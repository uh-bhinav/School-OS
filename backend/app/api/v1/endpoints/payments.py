from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.dependencies import limiter
from app.models.payment import Payment
from app.models.profile import Profile
from app.schemas.payment_schema import PaymentHealthStats, PaymentInitiateRequest, PaymentInitiateResponse, PaymentOut, PaymentVerificationRequest, ReconciliationReportStats
from app.services.payment_service import PaymentService

router = APIRouter()


def get_payment_service(db: AsyncSession = Depends(get_db)) -> PaymentService:
    return PaymentService(db)


@router.post("/initiate", response_model=PaymentInitiateResponse, status_code=status.HTTP_200_OK)
async def initiate_payment_flow(
    request_in: PaymentInitiateRequest,
    db: AsyncSession = Depends(get_db),  # ← Get transactional session
    current_user: Profile = Depends(get_current_user_profile),
) -> PaymentInitiateResponse:
    """
    Initiate a payment for an invoice or an e-commerce order.

    Transaction flow:
    1. get_db() dependency provides a session in a transaction
    2. PaymentService uses this session to create payment record
    3. Route returns response
    4. get_db() context manager exits → auto-commits
    """
    # Create service with the transactional db session
    service = PaymentService(db)

    # Service adds/flushes to db, but doesn't commit
    result = await service.initiate_payment(request_data=request_in, user_id=str(current_user.user_id))

    # When this route returns, get_db() will commit the transaction
    return result


@router.post(
    "/verify",
)
@limiter.limit("5/minute")  # Apply as decorator
async def verify_payment_signature(
    request: Request,  # Required for limiter to work
    verification_in: PaymentVerificationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user_profile),
):
    """
    Verify the signature of a successful Razorpay payment.
    This endpoint is now rate-limited.
    """
    service = PaymentService(db)
    await service.verify_payment(verification_data=verification_in)
    return {"status": "success", "message": "Payment verified successfully."}


@router.post(
    "/reconcile-pending",
    include_in_schema=False,  # Hides this from public OpenAPI docs
    dependencies=[Depends(require_role("Admin"))],
    # dependencies=[Depends(get_admin_user)]
)
async def trigger_reconciliation(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user_profile),
):
    """
    Triggers a background task to find and reconcile old 'pending' payments.
    This is an admin-only endpoint.
    """
    service = PaymentService(db)
    background_tasks.add_task(service.reconcile_pending_payments, db=db)

    return {"message": "Pending payment reconciliation task started in the background."}


@router.post(
    "/admin/reconcile-authorized",
    include_in_schema=False,  # Hides this from public OpenAPI docs
    dependencies=[Depends(require_role("Admin"))],
)
async def trigger_authorized_reconciliation(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user_profile),
):
    """
    Triggers a background task to capture 'authorized' payments or mark them as expired.

    This endpoint handles the two-step payment flow (Authorize → Capture):
    - Attempts to capture funds for authorized payments within the capture window
    - Marks expired authorizations (> 5 days old) as EXPIRED
    - Handles international cards and payment methods requiring explicit capture

    Admin-only endpoint for manual triggering. Should also be scheduled as a cron job.
    """
    service = PaymentService(db)
    background_tasks.add_task(service.reconcile_authorized_payments, db=db)

    return {"message": "Authorized payment reconciliation task started in the background.", "info": "This will attempt to capture authorized payments or mark expired ones."}


@router.get("/failed-allocations", response_model=list[PaymentOut], summary="[ADMIN] Get Failed Payment Allocations", dependencies=[Depends(require_role("Admin"))])
async def get_failed_payment_allocations(
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves a list of all payments that were successfully captured
    but failed during the internal allocation process.
    """
    service = PaymentService(db)
    payments = await service.get_failed_allocations(db=db)
    return payments


@router.post("/{payment_id}/retry-allocation", response_model=PaymentOut, summary="[ADMIN] Retry a Failed Payment Allocation", dependencies=[Depends(require_role("Admin"))])  # Return the updated payment
async def retry_failed_payment_allocation(
    payment_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Attempts to re-run the allocation logic for a payment that is
    stuck in the 'captured_allocation_failed' state.
    """
    service = PaymentService(db)

    # We need to get the payment *first* to check its status
    payment = await db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found.")

    if payment.status != "captured_allocation_failed":
        raise HTTPException(status_code=400, detail=f"Payment is not in a failed state. Current status: {payment.status}")

    # If the payment is valid for a retry, call the new service method
    updated_payment = await service.retry_allocation(db=db, payment=payment)
    return updated_payment


@router.get("/analytics/payment-health", response_model=PaymentHealthStats, summary="[ADMIN] Get Payment Health Statistics", dependencies=[Depends(require_role("Admin"))])  # 3. Use the new response model
async def get_payment_health_statistics(
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves key health statistics for the payment system
    over the last 24 hours.
    """
    service = PaymentService(db)
    stats = await service.get_payment_health_stats(db=db)
    return stats


@router.get("/analytics/reconciliation-report", response_model=ReconciliationReportStats, summary="[ADMIN] Get Reconciliation Report", dependencies=[Depends(require_role("Admin"))])  # 2. Use the new response model
async def get_reconciliation_report(
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves a report on webhook processing and background
    reconciliation tasks over the last 24 hours.
    """
    service = PaymentService(db)
    stats = await service.get_reconciliation_report(db=db)
    return stats
