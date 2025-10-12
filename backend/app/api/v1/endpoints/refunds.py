from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user, require_role
from app.db.session import get_db
from app.models import User  # Assuming your user model is named User
from app.schemas.refund_schema import RefundCreate, RefundOut
from app.services.refund_service import RefundService

router = APIRouter()


def get_refund_service(db: AsyncSession = Depends(get_db)) -> RefundService:
    return RefundService(db)


@router.post("/", response_model=RefundOut, status_code=201, dependencies=[Depends(require_role("Admin"))])
async def create_refund(
    refund_in: RefundCreate,
    service: RefundService = Depends(get_refund_service),
    current_user: User = Depends(get_current_user),
):
    """
    Process a refund for a captured payment. This action is restricted to Admins.
    """
    # Ensure the user ID in the request matches the authenticated user for security
    if refund_in.processed_by_user_id != current_user.id:
        # Or, more securely, overwrite it:
        refund_in.processed_by_user_id = current_user.id

    return await service.process_refund(refund_data=refund_in)
