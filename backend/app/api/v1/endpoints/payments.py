from fastapi import APIRouter, Depends, status, Request, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.profile import Profile
from app.dependencies import limiter
from app.schemas.payment_schema import PaymentInitiateRequest, PaymentInitiateResponse, PaymentVerificationRequest
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


# @router.post("/verify")
# async def verify_payment_signature(
#     verification_in: PaymentVerificationRequest,
#     service: PaymentService = Depends(get_payment_service),
# ):
#     """
#     Verify the signature of a successful Razorpay payment.
#     """

#     await service.verify_payment(verification_data=verification_in)
#     return {"status": "success", "message": "Payment verified successfully."}


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
    "/admin/reconcile-pending",
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
