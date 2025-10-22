import logging
from typing import Optional

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.payment_service import PaymentService

router = APIRouter()
logger = logging.getLogger(__name__)


def get_payment_service(db: AsyncSession = Depends(get_db)) -> PaymentService:
    return PaymentService(db)


def _get_client_ip(request: Request) -> str:
    """
    Extract the client's IP address from the request.
    Checks X-Forwarded-For header first (for proxied requests), then falls back to client.host.
    """
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # X-Forwarded-For can contain multiple IPs, take the first one
        return forwarded_for.split(",")[0].strip()

    if request.client:
        return request.client.host

    return "unknown"


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
    - Logs security events including source IP for attack detection
    """
    client_ip = _get_client_ip(request)

    if not x_razorpay_signature:
        # 🚨 SECURITY EVENT: Missing signature
        logger.warning(f"🚨 SECURITY: Webhook signature missing from IP: {client_ip}. " f"Potential attack or misconfigured webhook source.")
        return {"status": "error", "message": "Signature missing."}

    # Get the raw body captured by RawBodyMiddleware
    # This is CRITICAL for signature verification
    raw_body = getattr(request.state, "raw_body", None)

    if raw_body is None:
        # Fallback: if middleware didn't capture it, log error
        logger.error(f"Raw body not available for webhook from IP: {client_ip}. " f"RawBodyMiddleware may not be properly configured.")
        return {"status": "error", "message": "Raw body not available for signature verification."}

    # Parse the JSON payload for processing (after we have the raw body)
    payload = await request.json()

    # Pass client IP to service for security logging
    await service.handle_webhook_event(payload=payload, raw_body=raw_body, signature=x_razorpay_signature, client_ip=client_ip)

    return {"status": "ok"}
