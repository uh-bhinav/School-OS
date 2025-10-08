import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

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
from supabase import Client

router = APIRouter()


@router.post("/", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
async def enroll_new_student(
    student_in: StudentCreate,
    db: AsyncSession = Depends(get_db),
    supabase: Client = Depends(get_supabase_client),
    current_user: Profile = Depends(require_role("Admin")),
):
    """
    Enroll a new student. Only admins can perform this action.
    """
    try:
        # --- FIX: Added the missing 'await' keyword ---
        response = supabase.auth.admin.create_user(
            {
                "email": student_in.email,
                "password": student_in.password or str(uuid.uuid4()),
            }
        )
        supabase_user = getattr(response, "user", None) or (response.get("user") if isinstance(response, dict) else None)
        if not supabase_user:
            raise ValueError("Supabase user creation failed")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Supabase user creation failed: {str(e)}",
        )

    student = await student_service.create_student(db=db, supabase=supabase, student_in=student_in)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create student. The user may already exist or input data is invalid.",
        )
    return student


@router.get("/search", response_model=List[StudentOut])
async def search_for_students(
    name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user_profile),
):
    """
    Search for students by name.
    Returns 404 if no results are found.
    """
    results = await student_service.search_students(db=db, school_id=current_user.school_id, name=name)
    if not results:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No students found.")
    return results


@router.get("/{student_id}", response_model=StudentOut)
async def get_student_by_id(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user_profile),
):
    student = await student_service.get_student_by_id(db=db, student_id=student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")
    return student


# ... (The rest of your endpoint file remains unchanged) ...
@router.get("/", response_model=List[StudentOut])
async def get_all_students(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user_profile),
):
    """
    Retrieve all students for the current user's school.
    """
    return await student_service.search_students(db=db, school_id=current_user.school_id)


@router.put(
    "/{student_id}",
    response_model=StudentOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_existing_student(student_id: int, *, db: AsyncSession = Depends(get_db), student_in: StudentUpdate):
    db_student = await student_service.get_student(db=db, student_id=student_id)
    if not db_student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    return await student_service.update_student(db=db, db_obj=db_student, student_in=student_in)


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(require_role("Admin")),
):
    """
    Soft delete a student record.
    Only Admins are allowed to perform this.
    """
    deleted = await student_service.soft_delete_student(db=db, student_id=student_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    return {"detail": "Student deleted successfully."}


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
    result = await student_service.bulk_promote_students(db=db, promotion_data=promotion_in)
    if result["promoted_count"] == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No students were updated. Check if the student IDs are valid.",
        )
    return result


@router.get(
    "/{student_id}/academic-summary",
    response_model=StudentAcademicSummaryOut,
    dependencies=[Depends(require_role("Admin"))],
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
    summary = await student_service.get_student_academic_summary(db=db, student_id=student_id, academic_year_id=academic_year_id)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not generate summary for the given student.",
        )
    return summary
