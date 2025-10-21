# backend/app/services/payment_service.py
import logging
import os
import time
from decimal import Decimal
import requests # Add import
from razorpay.errors import BadRequestError, ServerError, GatewayError

import razorpay
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from app.core import crypto_service
from app.models.gateway_webhook_event import GatewayWebhookEvent
from app.models.invoice import Invoice
from app.models.order import Order
from app.models.payment import Payment
from app.models.school import School
from app.models.student import Student
from app.schemas.enums import OrderStatus
from app.schemas.payment_schema import PaymentInitiateRequest, PaymentVerificationRequest
from app.services import invoice_service
from app.schemas.enums import PaymentStatus, OrderStatus
from sqlalchemy import update

logger = logging.getLogger(__name__)


async def _get_razorpay_client(db: AsyncSession, school_id: int) -> razorpay.Client:
    """
    Fetches a school's credentials, decrypts them, and returns an initialized Razorpay client.
    """
    school = await db.get(School, school_id)
    if not school or not school.razorpay_key_id_encrypted or not school.razorpay_key_secret_encrypted:
        raise HTTPException(status_code=503, detail="Payment gateway is not configured for this school.")

    key_id = crypto_service.decrypt_value(school.razorpay_key_id_encrypted)
    key_secret = crypto_service.decrypt_value(school.razorpay_key_secret_encrypted)

    return razorpay.Client(auth=(key_id, key_secret))


class PaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def initiate_payment(self, *, request_data: PaymentInitiateRequest, user_id: str) -> dict:
        """
        Creates a pending payment record and generates a Razorpay Order.
        NOTE: Transaction is managed by the caller (get_db dependency).
        This service only adds/flushes - caller commits.
        """
        # 1. Determine target (Invoice or Order) and fetch details
        if request_data.invoice_id:
            target_obj = await self.db.get(Invoice, request_data.invoice_id, options=[selectinload(Invoice.student).selectinload(Student.current_class)])
            if not target_obj:
                raise HTTPException(status_code=404, detail="Invoice not found.")
            if not target_obj.student or not target_obj.student.current_class:
                raise HTTPException(status_code=400, detail="Student or class not found for this invoice.")

            school_id = target_obj.student.current_class.school_id
            amount = Decimal(target_obj.amount_due)
            student_id = target_obj.student_id
            description = f"Payment for Invoice {target_obj.invoice_number}"
        else:  # order_id must exist due to schema validation
            target_obj = await self.db.get(Order, request_data.order_id)
            if not target_obj:
                raise HTTPException(status_code=404, detail="Order not found.")
            amount = Decimal(target_obj.total_amount)
            school_id = target_obj.school_id
            student_id = target_obj.student_id
            description = f"Payment for Order #{target_obj.order_number}"

        # 2. Retrieve and decrypt school's Razorpay credentials BEFORE creating payment
        school = await self.db.get(School, school_id)
        if not school or not school.razorpay_key_id_encrypted or not school.razorpay_key_secret_encrypted:
            raise HTTPException(status_code=503, detail="Payment gateway is not configured for this school.")

        key_id = crypto_service.decrypt_value(school.razorpay_key_id_encrypted)
        key_secret = crypto_service.decrypt_value(school.razorpay_key_secret_encrypted)

        # 3. Call Razorpay's Orders API BEFORE creating our payment record
        try:
            client = razorpay.Client(auth=(key_id, key_secret))

            timestamp = int(time.time()) % 1000000  # Last 6 digits of timestamp
            receipt = f"SCHOOS_PAY_{timestamp}"[:40]  # Ensure max 40 chars

            order_payload = {
                "amount": int(amount * 100),  # Convert to paise
                "currency": "INR",
                "receipt": receipt,
                "notes": {
                    "target_invoice_id": request_data.invoice_id,
                    "target_order_id": request_data.order_id,
                },
            }
            razorpay_order = client.order.create(data=order_payload)
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as net_err:
            logger.error(f"Razorpay API network error during order creation: {net_err}")
            # Raise 504 Gateway Timeout or 503 Service Unavailable
            raise HTTPException(status_code=504, detail="Payment gateway timed out. Please try again later.")
        except (BadRequestError, ServerError, GatewayError) as rzp_err:
            # Log specific Razorpay error
            logger.error(f"Razorpay API error during order creation: {rzp_err}")
            # Raise 502 Bad Gateway as the gateway itself reported an issue
            raise HTTPException(status_code=502, detail=f"Payment gateway error: {rzp_err}")
        except Exception as e:
            # Catch any other unexpected errors during Razorpay interaction
            logger.exception(f"Unexpected error during Razorpay order creation: {e}")
            raise HTTPException(status_code=500, detail="An unexpected error occurred with the payment gateway.")

        # 4. NOW create our internal 'pending' payment record (only if Razorpay succeeded)
        new_payment = Payment(
            invoice_id=request_data.invoice_id,
            order_id=request_data.order_id,
            amount_paid=amount,
            status="pending",
            school_id=school_id,
            student_id=student_id,
            user_id=user_id,
            gateway_order_id=razorpay_order["id"],
            currency="INR",
            gateway_name="razorpay",  # Store immediately
        )
        self.db.add(new_payment)
        try:
            await self.db.flush() # Or commit if service manages transaction
        except Exception as db_err:
             logger.exception(f"Database error after creating Razorpay order {razorpay_order['id']}: {db_err}")
             # IMPORTANT: Need to potentially refund/cancel the Razorpay order here if possible,
             # or flag for manual admin review. For now, just raise.
             raise HTTPException(status_code=500, detail="Database error processing payment initiation.")

        # 5. Return data required by the frontend
        # The caller's get_db() dependency will commit this transaction
        return {"razorpay_order_id": new_payment.gateway_order_id, "razorpay_key_id": key_id, "amount": razorpay_order["amount"], "internal_payment_id": new_payment.id, "school_name": school.name, "description": description}

    async def verify_payment(self, *, verification_data: PaymentVerificationRequest) -> Payment:
        """
        Verifies a payment's signature and updates the status of the payment
        and its target (Invoice or Order).
        """
        # 1. Fetch our internal payment record
        payment = await self.db.get(Payment, verification_data.internal_payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment record not found.")

        if payment.status == "captured":
            logger.info(f"Payment {payment.id} already captured. Returning.")
            return payment  # Payment is already verified, do nothing.
        
        if payment.status != "pending":
            logger.warning(f"Payment {payment.id} is in non-verifiable state: {payment.status}")
            raise HTTPException(status_code=400, detail=f"Payment not in a verifiable state (status: {payment.status}).")

        # 2. Retrieve and decrypt the school's Razorpay secret
        school = await self.db.get(School, payment.school_id)
        if not school or not school.razorpay_key_secret_encrypted:
            raise HTTPException(status_code=503, detail="Payment gateway secret is not configured.")

        key_secret = crypto_service.decrypt_value(school.razorpay_key_secret_encrypted)

        # 3. Perform the cryptographic signature verification
        try:
            client = razorpay.Client(auth=("", key_secret))  # Key ID is not needed for verification
            client.utility.verify_payment_signature({"razorpay_order_id": verification_data.razorpay_order_id, "razorpay_payment_id": verification_data.razorpay_payment_id, "razorpay_signature": verification_data.razorpay_signature})
        except razorpay.errors.SignatureVerificationError:
            # This is a critical security event. The signature is invalid.
            payment_id_log = payment.id
            payment.status = "failed"
            payment.error_description = "Signature verification failed."
            await self.db.commit()
            logger.warning(f"Invalid Razorpay signature for internal_payment_id: {payment_id_log}")
            raise HTTPException(status_code=400, detail="Invalid payment signature.")
        except Exception as sig_err: # Catch other potential errors during verification
             payment_id_log = payment.id 
             logger.exception(f"Error during Razorpay signature verification for internal_payment_id {payment_id_log}: {sig_err}")
             # Don't change payment status yet, maybe temporary issue
             raise HTTPException(status_code=502, detail="Error verifying payment signature with gateway.")
        # --- END ERROR HANDLING ---

        # 4. If verification succeeds, update our records atomically
        payment.status = "captured"
        payment.gateway_payment_id = verification_data.razorpay_payment_id
        payment.gateway_signature = verification_data.razorpay_signature  # THIS WAS MISSING

        try:
            razorpay_client = await _get_razorpay_client(db=self.db, school_id=payment.school_id)
            payment_details = razorpay_client.payment.fetch(payment.gateway_payment_id)
            payment.method = payment_details.get("method")  # e.g., 'card', 'upi'
            payment.metadata = payment_details.get("notes")  # Razorpay uses 'notes' for metadata
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as net_err:
             # Log the error but continue - verification succeeded, details are secondary
             logger.warning(f"Network error fetching Razorpay payment details for {payment.gateway_payment_id}: {net_err}")
        except (BadRequestError, ServerError, GatewayError) as rzp_err:
             # Log the error but continue
             logger.warning(f"Razorpay API error fetching payment details for {payment.gateway_payment_id}: {rzp_err}")
        except Exception as e:
             # Log unexpected errors but continue
             logger.exception(f"Unexpected error fetching Razorpay payment details for {payment.gateway_payment_id}: {e}")
        # --- END ERROR HANDLING ---

        await self.db.flush()

        # Update the target Invoice or Order
        try:
            if payment.invoice_id:
                logger.info(f"DEBUG: Looking for invoice with id={payment.invoice_id}")
                invoice = await self.db.get(Invoice, payment.invoice_id)

                if not invoice:
                    logger.error(f"DEBUG: Invoice NOT FOUND with id={payment.invoice_id}")
                    raise ValueError(f"Associated invoice {payment.invoice_id} not found.")
                if invoice:
                    # --- THIS IS THE CRITICAL ADDITION ---
                    # Now that the payment is captured, call the allocation service
                    # to distribute the funds and update the invoice status.
                    await invoice_service.allocate_payment_to_invoice_items(db=self.db, payment_id=payment.id, user_id=payment.user_id)  # Get the user ID from the payment record
                else:
                    logger.info(f"DEBUG: Invoice FOUND - id={invoice.id}, current payment_status={invoice.payment_status}")
                    logger.info("DEBUG: Setting payment_status to 'paid'")
                    invoice.payment_status = "paid"
                    logger.info(f"DEBUG: After assignment - invoice.payment_status={invoice.payment_status}")
                    logger.info("DEBUG: About to flush invoice")
                    await self.db.flush()
                    logger.info(f"DEBUG: Flush complete - invoice.payment_status={invoice.payment_status}")  # ✅ FLUSH invoice changes

            elif payment.order_id:
                order_stmt = select(Order).where(Order.order_id == payment.order_id)
                order_result = await self.db.execute(order_stmt)
                order = order_result.scalar_one_or_none()

                if order:
                    if order.status not in ["pending_payment"]: # Only update if pending
                        logger.warning(f"Payment verification for payment {payment.id}: Associated order {order.order_id} has non-pending status '{order.status}'. Cannot update order status.")
                        # Option 1: Just log and continue (payment captured, order untouched)
                        # Option 2: Raise an error (might be better for consistency)
                        # raise HTTPException(status_code=400, detail=f"Cannot verify payment for order with status '{order.status}'.")
                        pass # Let's just pass for now, payment is verified, order is left alone.
                    else:
                        order.status = "processing"
                        await self.db.flush() # Update order status only if it was pending
                else:
                    # Order not found after successful signature verification - this is an issue!
                    logger.error(f"Payment verification for payment {payment.id}: Associated order {payment.order_id} not found!")
                    # Should we fail the payment here? Or just log? Let's raise for clarity.
                    payment.status = "failed" # Mark payment as failed if order is missing
                    payment.error_description = f"Associated order {payment.order_id} not found during verification."
                    # Don't raise HTTPException here, let the commit happen below to save 'failed' status
                    # raise HTTPException(status_code=404, detail="Associated order not found")

            payment_id_final = payment.id
            payment_status_final = payment.status
            await self.db.commit()
            logger.info(f"✅ Payment verification completed. Payment ID: {payment_id_final}, Status: {payment_status_final}")


        except Exception as e:
            # --- 🚨 ALLOCATION FAILURE CATCH-ALL 🚨 ---
            logger.critical(
                f"CRITICAL: Payment {payment.id} CAPTURED but FAILED allocation/update. Error: {e}",
                exc_info=True,
            )
            # We must roll back the failed allocation changes
            await self.db.rollback()

            # NOW, we start a NEW transaction to mark the payment for review
            try:
                payment_id_alert = payment.id 
                payment.status = PaymentStatus.CAPTURED_ALLOCATION_FAILED
                payment.error_description = f"Allocation failed: {str(e)[:255]}"
                self.db.add(payment) # Re-add the object to the new session
                await self.db.commit()
                
                # This is your log marker for alerting
                logger.info(
                    f"ALERT_PAYMENT_ALLOCATION_FAILURE: payment_id={payment_id_alert} "
                    f"marked as 'captured_allocation_failed'."
                )
                
            except Exception as inner_e:
                # Absolute worst-case scenario: we can't even update the DB.
                logger.critical(
                    f"FATAL: Could not mark payment {payment.id} as 'captured_allocation_failed'. "
                    f"DB error: {inner_e}",
                    exc_info=True
                )
                await self.db.rollback()
                # Re-raise the original error so the client doesn't get a 200 OK
                raise HTTPException(status_code=500, detail="Payment captured but allocation failed.")
            
        try:
            await self.db.refresh(payment)
        except Exception as refresh_error:
            # If refresh fails (e.g., session closed), just log it
            logger.warning(f"Could not refresh payment object: {refresh_error}")

        return payment

    async def handle_webhook_event(self, *, payload: dict, raw_body: bytes, signature: str) -> None:
        """
        Handles incoming Razorpay webhooks, verifying signature and idempotency.

        SECURITY CRITICAL:
        - Uses raw_body (exact bytes sent by Razorpay) for signature verification
        - Never use the parsed JSON payload for signature verification
        - This prevents tampering attacks via JSON manipulation

        Args:
            payload: Parsed JSON payload (for processing after verification)
            raw_body: Raw request body bytes (for signature verification)
            signature: X-Razorpay-Signature header value
        """
        event_type = payload.get("event")

        # Razorpay webhooks don't have a unique event ID at root level
        # We need to construct one from the payment ID and timestamp for idempotency
        if event_type == "payment.captured":
            payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
            payment_id = payment_entity.get("id")
            created_at = payload.get("created_at")

            if not payment_id or not created_at:
                raise HTTPException(status_code=400, detail="Invalid webhook payload.")

            # Create composite event ID for idempotency
            event_id = f"{event_type}_{payment_id}_{created_at}"
        else:
            # For other event types, construct event ID differently
            raise HTTPException(status_code=400, detail=f"Unsupported event type: {event_type}")

        # 1. Idempotency Check: Has this event already been processed?
        existing_event = await self.db.execute(select(GatewayWebhookEvent).where(GatewayWebhookEvent.event_id == event_id))
        if existing_event.scalars().first():
            # We've seen this before, do nothing.
            logger.info(f"Duplicate webhook event received: {event_id}")
            return
        
        # 2. Create the event log entry (but don't commit yet!)
        new_event = GatewayWebhookEvent(
            event_id=event_id,
            payload=payload,
            status="received"
        )
        self.db.add(new_event)

        # We are only interested in successful payment events for now
        if event_type == "payment.captured":
            try:
                # Find the payment record by matching gateway_order_id
                gateway_order_id = payment_entity.get("order_id")

                if not gateway_order_id:
                    raise ValueError("Gateway order ID not found in webhook payload.")

                # 2. Find our internal payment record using gateway_order_id
                payment_stmt = select(Payment).where(Payment.gateway_order_id == gateway_order_id)
                payment_result = await self.db.execute(payment_stmt)
                payment = payment_result.scalar_one_or_none()

                if not payment:
                    raise ValueError(f"Payment record with gateway_order_id {gateway_order_id} not found.")

                # 3. Signature Verification - Decrypt webhook secret from database
                school = await self.db.get(School, payment.school_id)

                # Try to get webhook secret from encrypted database field
                if school.razorpay_webhook_secret_encrypted:
                    # Production: Decrypt from database
                    webhook_secret = crypto_service.decrypt_value(school.razorpay_webhook_secret_encrypted)
                    logger.info(f"Using encrypted webhook secret from database for school_id={payment.school_id}")
                else:
                    # Development fallback: Use environment variable
                    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
                    if not webhook_secret:
                        raise ValueError(
                            f"Webhook secret not configured for school_id={payment.school_id}. " "Please either:\n" "1. Set RAZORPAY_WEBHOOK_SECRET in .env (development)\n" "2. Configure via API: PUT /api/v1/finance/gateway/credentials (production)"
                        )
                    logger.warning(f"⚠️ Using webhook secret from .env (DEVELOPMENT MODE) for school_id={payment.school_id}. " f"Configure via /api/v1/finance/gateway/credentials for production.")

                # SECURITY CRITICAL: Use raw_body for signature verification
                # Convert bytes to string as required by Razorpay SDK
                try:
                    client = razorpay.Client(auth=("", ""))  # No auth needed for this utility
                    client.utility.verify_webhook_signature(raw_body.decode("utf-8"), signature, webhook_secret)  # Use raw body instead of str(payload)
                    logger.info(f"✅ Webhook signature verified successfully for payment {gateway_order_id}")
                except razorpay.errors.SignatureVerificationError:
                    logger.error(f"❌ Webhook signature verification failed for payment {gateway_order_id}. " f"This likely means the webhook secret in the database doesn't match the one in Razorpay dashboard.")
                    await self.db.commit()
                    raise HTTPException(status_code=400, detail="Invalid webhook signature.")

                # 4. Process the event if signature is valid (backup logic)
                if payment.status != "captured":
                    payment.status = "captured"
                    payment.gateway_payment_id = payment_entity.get("id")

                    # ✅ Update Invoice/Order status atomically
                    if payment.invoice_id:
                        await invoice_service.allocate_payment_to_invoice_items(db=self.db, payment_id=payment.id, user_id=payment.user_id)
                    elif payment.order_id:
                        order_stmt = select(Order).where(Order.order_id == payment.order_id)
                        order_result = await self.db.execute(order_stmt)
                        order = order_result.scalar_one_or_none()

                        if order:
                            order.status = OrderStatus.PROCESSING

                new_event.status = "processed"
            
            except Exception as e:
                # Any processing error - log it and mark as failed
                logger.error(f"Webhook processing failed for event {event_id}: {e}", exc_info=True)
                new_event.status = "failed"
                new_event.processing_error = str(e)
                # Don't raise - we want to commit the failure log
        
        # 10. SINGLE COMMIT - All or nothing transaction
        try:
            await self.db.commit()
            logger.info(f"Webhook event {event_id} committed with status '{new_event.status}'")
        except Exception as commit_error:
            logger.error(f"Failed to commit webhook event {event_id}: {commit_error}", exc_info=True)
            await self.db.rollback()
            raise

    async def reconcile_pending_payments(self, db: AsyncSession):
        """
        Finds 'pending' payments older than a threshold and checks their
        true status with Razorpay.
        """
        logger.info("Starting pending payment reconciliation task...")
        
        # 1. Find payments pending for more than 1 hour (configurable)
        reconciliation_threshold = datetime.utcnow() - timedelta(hours=1)
        
        stmt = (
            select(Payment)
            .where(Payment.status == PaymentStatus.PENDING)
            .where(Payment.created_at < reconciliation_threshold)
            .where(Payment.gateway_order_id != None)
            .limit(100) # Process in batches
        )
        result = await db.execute(stmt)
        pending_payments = result.scalars().all()

        processed = 0
        reconciled = 0
        failed = 0

        for payment in pending_payments:
            processed += 1
            try:
                # 2. Get Razorpay client for the payment's school
                razorpay_client = await _get_razorpay_client(db=db, school_id=payment.school_id)
                
                # 3. Fetch all payments for the gateway_order_id
                order_payments = razorpay_client.order.payments(payment.gateway_order_id)
                
                captured_payment_entity = None
                for p in order_payments.get("items", []):
                    if p.get("status") == "captured":
                        captured_payment_entity = p
                        break # Found it

                if captured_payment_entity:
                    # 4. PAYMENT WAS CAPTURED! Reconcile it.
                    logger.warning(
                        f"Reconciliation: Found CAPTURED gateway payment for "
                        f"PENDING internal Payment ID {payment.id}."
                    )
                    
                    payment.status = PaymentStatus.CAPTURED
                    payment.gateway_payment_id = captured_payment_entity.get("id")
                    
                    # 5. --- ATTEMPT ALLOCATION ---
                    # We re-use the *same* logic block
                    try:
                        if payment.invoice_id:
                            await invoice_service.allocate_payment_to_invoice_items(
                                db=db,
                                payment_id=payment.id,
                                user_id=payment.user_id, # Or a system user ID
                            )
                        elif payment.order_id:
                            await db.execute(
                                update(Order)
                                .where(Order.order_id == payment.order_id)
                                .where(Order.status == OrderStatus.PENDING_PAYMENT)
                                .values(status=OrderStatus.PROCESSING)
                            )
                        
                        await db.commit() # Commit this one payment's success
                        reconciled += 1

                    except Exception as e:
                        logger.critical(
                            f"RECONCILIATION_ALLOCATION_FAILURE: Payment {payment.id} reconciled but FAILED allocation. Error: {e}",
                            exc_info=True
                        )
                        await db.rollback()
                        # Mark as failed in a new session
                        payment.status = PaymentStatus.CAPTURED_ALLOCATION_FAILED
                        payment.error_description = f"Recon allocation fail: {str(e)[:255]}"
                        db.add(payment)
                        await db.commit()
                        logger.info(f"ALERT_PAYMENT_ALLOCATION_FAILURE: payment_id={payment.id}")
                
                else:
                    # 6. Payment is not captured at gateway. Mark as failed.
                    payment.status = PaymentStatus.FAILED
                    payment.error_description = "Reconciled: Gateway payment not found or not captured."
                    await db.commit()
                    failed += 1

            except Exception as e:
                logger.error(f"Reconciliation error for Payment {payment.id}: {e}", exc_info=True)
                await db.rollback()
                # Don't change status, just log. Will retry next time.

        logger.info(
            f"Reconciliation complete. Processed: {processed}, "
            f"Reconciled: {reconciled}, Marked Failed: {failed}."
        )
        return {"processed": processed, "reconciled": reconciled, "failed": failed}