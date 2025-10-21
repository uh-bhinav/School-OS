# backend/app/services/payment_service.py
import logging
import os
from decimal import Decimal

import razorpay
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

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

            import time

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
        except Exception as e:
            # If Razorpay fails, don't create a payment record at all
            raise HTTPException(status_code=502, detail=f"Failed to create order with payment gateway: {str(e)}")

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
        await self.db.flush()  # Flush to get the new_payment.id

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
            return payment  # Payment is already verified, do nothing.

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
            payment.status = "failed"
            payment.error_description = "Signature verification failed."
            await self.db.commit()
            raise HTTPException(status_code=400, detail="Invalid payment signature.")

        # 4. If verification succeeds, update our records atomically
        payment.status = "captured"
        payment.gateway_payment_id = verification_data.razorpay_payment_id
        payment.gateway_signature = verification_data.razorpay_signature  # THIS WAS MISSING

        try:
            razorpay_client = await _get_razorpay_client(db=self.db, school_id=payment.school_id)
            payment_details = razorpay_client.payment.fetch(payment.gateway_payment_id)
            payment.method = payment_details.get("method")  # e.g., 'card', 'upi'
            payment.metadata = payment_details.get("notes")  # Razorpay uses 'notes' for metadata
        except Exception as e:
            logger.error(f"Could not fetch payment details from Razorpay: {e}")
            # Decide if this should be a critical failure or not

        await self.db.flush()

        # Update the target Invoice or Order
        if payment.invoice_id:
            logger.info(f"DEBUG: Looking for invoice with id={payment.invoice_id}")
            invoice = await self.db.get(Invoice, payment.invoice_id)

            if not invoice:
                logger.error(f"DEBUG: Invoice NOT FOUND with id={payment.invoice_id}")
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
                order.status = OrderStatus.PROCESSING
                await self.db.flush()  # Update order status after payment

        await self.db.commit()
        await self.db.refresh(payment)

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

        # Log the event with 'received' status before processing
        new_event = GatewayWebhookEvent(event_id=event_id, payload=payload, status="received")
        self.db.add(new_event)
        await self.db.commit()

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
                    raise

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
                logger.info(f"Webhook event processed successfully: {event_id}")

            except Exception as e:
                new_event.status = "failed"
                new_event.processing_error = str(e)
                logger.error(f"Webhook processing failed: {str(e)}", exc_info=True)
                # In a real system, you would also send an alert here.

            await self.db.commit()
