from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user, require_role
from app.db.session import get_db
from app.models import User
from app.schemas.payment_gateway_schema import GatewayCredentialsCreate
from app.services.payment_gateway_service import PaymentGatewayService

router = APIRouter()


def get_gateway_service(db: AsyncSession = Depends(get_db)) -> PaymentGatewayService:
    return PaymentGatewayService(db)


@router.post("/configure", status_code=200, dependencies=[Depends(require_role("Admin"))])
async def configure_payment_gateway(
    credentials_in: GatewayCredentialsCreate,
    service: PaymentGatewayService = Depends(get_gateway_service),
    current_user: User = Depends(get_current_user),
):
    """
    Configure Razorpay credentials for the admin's school.
    """
    await service.configure_gateway_credentials(school_id=current_user.school_id, credentials=credentials_in)  # Source school_id from trusted JWT
    return {"message": "Payment gateway credentials configured successfully."}
