from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.student_fee_assignment_schema import StudentFeeAssignmentCreate, StudentFeeAssignmentOut
from app.services.student_fee_assignment_service import StudentFeeAssignmentService

router = APIRouter()


def get_assignment_service(db: Session = Depends(get_db)) -> StudentFeeAssignmentService:
    return StudentFeeAssignmentService(db)


@router.post("/overrides", response_model=StudentFeeAssignmentOut, status_code=200)
def set_student_fee_override(
    override_in: StudentFeeAssignmentCreate,
    service: StudentFeeAssignmentService = Depends(get_assignment_service),
):
    """
    Create or update a fee override for a student.
    e.g., set is_active=False for the 'Bus Fee' component for a specific student.
    """
    return service.create_or_update_override(override_data=override_in)
