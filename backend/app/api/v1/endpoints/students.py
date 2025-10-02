# This is the corrected import block
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import Client

from app.core.security import (
    get_current_user_profile,
    get_supabase_client,
    require_role,
)
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.student_schema import (
    StudentAcademicSummaryOut,
    StudentBulkPromoteIn,
    StudentBulkPromoteOut,
    StudentCreate,
    StudentOut,
    StudentUpdate,
)
from app.services import student_service

router = APIRouter()


@router.post(
    "/",
    response_model=StudentOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def enroll_new_student(
    *,
    db: AsyncSession = Depends(get_db),
    supabase: Client = Depends(get_supabase_client),
    student_in: StudentCreate,
):
    """
    Enroll a new student into a school. Admin only.
    """
    student = await student_service.create_student(
        db=db, supabase=supabase, student_in=student_in
    )
    if not student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Failed to create student. The user may already exist "
                "or input data is invalid."
            ),
        )
    # Re-fetch to load the nested profile data correctly for the response
    return await student_service.get_student(db=db, student_id=student.student_id)


@router.get(
    "/{student_id}",
    response_model=StudentOut,
    dependencies=[Depends(require_role("Admin", "Teacher"))],  # Added Teacher
)
async def get_student_by_id(student_id: int, db: AsyncSession = Depends(get_db)):
    db_student = await student_service.get_student(db=db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
        )
    return db_student


@router.put(
    "/{student_id}",
    response_model=StudentOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_existing_student(
    student_id: int, *, db: AsyncSession = Depends(get_db), student_in: StudentUpdate
):
    db_student = await student_service.get_student(db=db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
        )

    return await student_service.update_student(
        db=db, db_obj=db_student, student_in=student_in
    )


@router.delete(
    "/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_student(student_id: int, db: AsyncSession = Depends(get_db)):
    """
    Soft-deletes a student and their associated profile.
    """
    deleted_student = await student_service.soft_delete_student(
        db, student_id=student_id
    )
    if not deleted_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active student with id {student_id} not found",
        )
    return None


@router.get(
    "/search",
    response_model=list[StudentOut],
    dependencies=[Depends(require_role("Admin"))],  # Or other appropriate roles
)
async def search_for_students(
    name: Optional[str] = None,
    class_id: Optional[int] = None,
    roll_number: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Search for students by name, class, or roll number.
    """
    students = await student_service.search_students(
        db=db,
        school_id=current_profile.school_id,
        name=name,
        class_id=class_id,
        roll_number=roll_number,
    )
    if not students:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No students found matching the criteria.",
        )
    return students


@router.post(
    "/promote",
    response_model=StudentBulkPromoteOut,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_role("Admin"))],
)
async def promote_students_in_bulk(
    promotion_in: StudentBulkPromoteIn,
    db: AsyncSession = Depends(get_db),
):
    """
    Promote a list of students to a new class.
    """
    result = await student_service.bulk_promote_students(
        db=db, promotion_data=promotion_in
    )
    if result["promoted_count"] == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No students were updated. Check if the student IDs are valid.",
        )
    return result


@router.get(
    "/{student_id}/academic-summary",
    response_model=StudentAcademicSummaryOut,
    dependencies=[Depends(require_role("Admin"))],  # Also for Teachers, Parents
)
async def get_student_summary(
    student_id: int,
    academic_year_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Get a consolidated academic summary for a student,
    including attendance and marks.
    """
    summary = await student_service.get_student_academic_summary(
        db=db, student_id=student_id, academic_year_id=academic_year_id
    )
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not generate summary for the given student.",
        )
    return summary
