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

    Security Note:
    - Uses raw_body from middleware for signature verification
    - The raw body is the exact bytes sent by Razorpay (unmodified)
    - This ensures cryptographic signature verification integrity
    """
    if not x_razorpay_signature:
        # This is a security event and should be logged.
        return {"status": "error", "message": "Signature missing."}

    # Get the raw body captured by RawBodyMiddleware
    # This is CRITICAL for signature verification
    raw_body = getattr(request.state, "raw_body", None)

    if raw_body is None:
        # Fallback: if middleware didn't capture it, log error
        return {"status": "error", "message": "Raw body not available for signature verification."}

    # Parse the JSON payload for processing (after we have the raw body)
    payload = await request.json()

    # Pass both raw body and parsed payload to service
    await service.handle_webhook_event(payload=payload, raw_body=raw_body, signature=x_razorpay_signature)

    return {"status": "ok"}
