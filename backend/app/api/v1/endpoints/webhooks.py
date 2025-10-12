from typing import Optional

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.payment_service import PaymentService

router = APIRouter()


def get_payment_service(db: AsyncSession = Depends(get_db)) -> PaymentService:
    return PaymentService(db)


@router.post("/razorpay")
async def handle_razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None),
    service: PaymentService = Depends(get_payment_service),
):
    """
    Receives and processes webhook notifications from Razorpay.
    """
    if not x_razorpay_signature:
        # This is a security event and should be logged.
        return {"status": "error", "message": "Signature missing."}

    payload = await request.json()
    await service.handle_webhook_event(payload=payload, signature=x_razorpay_signature)

    return {"status": "ok"}
