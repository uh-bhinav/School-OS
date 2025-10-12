from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.security import require_role
from app.db.session import get_db
from app.models import User
from app.schemas.student_fee_assignment_schema import StudentFeeAssignmentCreate, StudentFeeAssignmentOut
from app.services.student_fee_assignment_service import StudentFeeAssignmentService

router = APIRouter()


def get_assignment_service(db: Session = Depends(get_db)) -> StudentFeeAssignmentService:
    return StudentFeeAssignmentService(db)


@router.post("/overrides", response_model=StudentFeeAssignmentOut, status_code=200, dependencies=[Depends(require_role("Admin"))])
def set_student_fee_override(
    override_in: StudentFeeAssignmentCreate,
    request: Request,
    service: StudentFeeAssignmentService = Depends(get_assignment_service),
    current_user: User = Depends(get_current_user),
):
    """
    Create or update a fee override for a student.
    e.g., set is_active=False for the 'Bus Fee' component for a specific student.
    """
    return service.create_or_update_override(override_data=override_in, user_id=current_user.id, ip_address=request.client.host)
