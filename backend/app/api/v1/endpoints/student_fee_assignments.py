from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.student_fee_assignment_schema import StudentFeeAssignmentCreate, StudentFeeAssignmentOut
from app.services.student_fee_assignment_service import StudentFeeAssignmentService
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.models.student import Student
from fastapi import HTTPException, status

router = APIRouter()


def get_assignment_service(db: Session = Depends(get_db)) -> StudentFeeAssignmentService:
    return StudentFeeAssignmentService(db)


@router.post("/overrides", response_model=StudentFeeAssignmentOut, status_code=200, dependencies=[Depends(require_role("Admin"))])
async def set_student_fee_override(
    override_in: StudentFeeAssignmentCreate,
    request: Request,
    service: StudentFeeAssignmentService = Depends(get_assignment_service),
    current_user: Profile = Depends(get_current_user_profile),
    db: AsyncSession = Depends(get_db)
):
    """
    Create or update a fee override for a student.
    e.g., set is_active=False for the 'Bus Fee' component for a specific student.
    """
    target_student = await db.get(Student, override_in.student_id, options=[joinedload(Student.profile)])
    if not target_student or not target_student.profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student or student profile not found")
        
    if target_student.profile.school_id != current_user.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin cannot set overrides for students in other schools."
        )
    
    return service.create_or_update_override(override_data=override_in, user_id=current_user.id, ip_address=request.client.host)