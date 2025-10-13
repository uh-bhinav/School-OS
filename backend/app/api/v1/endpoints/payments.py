from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.payment_schema import PaymentInitiateRequest, PaymentInitiateResponse, PaymentVerificationRequest
from app.services.payment_service import PaymentService

router = APIRouter()


def get_payment_service(db: AsyncSession = Depends(get_db)) -> PaymentService:
    return PaymentService(db)


@router.post("/initiate", response_model=PaymentInitiateResponse)
async def initiate_payment_flow(
    request_in: PaymentInitiateRequest,
    service: PaymentService = Depends(get_payment_service),
    current_user: Profile = Depends(get_current_user_profile),
):
    """
    Initiate a payment for an invoice or an e-commerce order.
    """
    return await service.initiate_payment(request_data=request_in, user_id=current_user.id)


@router.post("/verify")
async def verify_payment_signature(
    verification_in: PaymentVerificationRequest,
    service: PaymentService = Depends(get_payment_service),
):
    """
    Verify the signature of a successful Razorpay payment.
    """

    await service.verify_payment(verification_data=verification_in)
    return {"status": "success", "message": "Payment verified successfully."}
