from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import crypto_service
from app.models.school import School
from app.schemas.payment_gateway_schema import GatewayCredentialsCreate


class PaymentGatewayService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def configure_gateway_credentials(self, *, school_id: int, credentials: GatewayCredentialsCreate) -> School:
        """
        Encrypts and saves Razorpay credentials for a specific school.
        """
        school = await self.db.get(School, school_id)
        if not school:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found.")

        # Use the crypto service to encrypt each credential
        school.razorpay_key_id_encrypted = crypto_service.encrypt_value(credentials.razorpay_key_id)
        school.razorpay_key_secret_encrypted = crypto_service.encrypt_value(credentials.razorpay_key_secret)
        school.razorpay_webhook_secret_encrypted = crypto_service.encrypt_value(credentials.razorpay_webhook_secret)

        await self.db.commit()
        await self.db.refresh(school)

        return school
