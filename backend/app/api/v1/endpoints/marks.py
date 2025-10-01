# backend/app/api/v1/endpoints/marks.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.mark_schema import MarkBulkCreate, MarkCreate, MarkOut, MarkUpdate
from app.services import mark_service, student_contact_service

router = APIRouter()


# Admin/Teacher only: Create a new mark record
@router.post(
    "/",
    response_model=MarkOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_role("teacher"))
    ],  # Example: Teachers can submit marks
)
async def create_new_mark(mark_in: MarkCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new mark record. Teacher only.
    """
    return await mark_service.create_mark(db=db, mark_in=mark_in)


# Student/Parent only: Get marks for a specific student
@router.get(
    "/students/{student_id}",
    response_model=list[MarkOut],
    dependencies=[Depends(require_role("student"))],  # Or Parent
)
async def get_student_marks(student_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all marks for a specific student.
    """
    marks = await mark_service.get_marks_by_student(db=db, student_id=student_id)
    if not marks:
        raise HTTPException(status_code=404, detail="Marks not found for this student.")
    return marks


# Admin/Teacher only: Update an existing mark record
@router.put(
    "/{mark_id}",
    response_model=MarkOut,
    dependencies=[Depends(require_role("teacher"))],
)
async def update_mark(
    mark_id: int, mark_in: MarkUpdate, db: AsyncSession = Depends(get_db)
):
    db_obj = await mark_service.get_mark_by_id(db, mark_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Mark not found.")
    return await mark_service.update_mark(db, db_obj=db_obj, mark_in=mark_in)


# Admin only: Delete a mark record
@router.delete(
    "/{mark_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_mark(mark_id: int, db: AsyncSession = Depends(get_db)):
    db_obj = await mark_service.get_mark_by_id(db, mark_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Mark not found.")
    await mark_service.delete_mark(db, db_obj=db_obj)
    return {"ok": True}


@router.post(
    "/bulk",
    response_model=list[MarkOut],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Teacher"))],  # Or "Admin"
)
async def submit_marks_in_bulk(
    *,
    db: AsyncSession = Depends(get_db),
    marks_in: MarkBulkCreate,
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Submit marks for multiple students at once. Teacher/Admin only.
    """
    if not current_profile.teacher:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with a teacher record can submit marks.",
        )

    # Pass the authenticated teacher's ID to the service function
    created_marks = await mark_service.bulk_create_marks(
        db=db,
        marks_in=marks_in.marks,
        entered_by_teacher_id=current_profile.teacher.teacher_id,
    )
    return created_marks


@router.get("/report-card/student/{student_id}", response_model=list[MarkOut])
async def get_report_card(
    student_id: int,
    academic_year_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get a student's full report card for an academic year.
    - Admins can see any report card.
    - Students can only see their own.
    - Parents can only see the report cards of their linked children.
    """
    # Check the user's roles
    user_roles = {role.role_definition.role_name for role in current_profile.roles}

    is_authorized = False
    if "Admin" in user_roles:
        is_authorized = True
    elif (
        "Student" in user_roles
        and current_profile.student
        and current_profile.student.student_id == student_id
    ):
        is_authorized = True
    elif "Parent" in user_roles:
        is_authorized = await student_contact_service.is_user_linked_to_student(
            db, user_id=current_profile.user_id, student_id=student_id
        )

    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this report card.",
        )

    return await mark_service.get_student_report_card(
        db=db, student_id=student_id, academic_year_id=academic_year_id
    )
