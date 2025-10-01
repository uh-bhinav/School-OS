# backend/app/api/v1/endpoints/students.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import Client

from app.core.security import get_supabase_client, require_role
from app.db.session import get_db
from app.schemas.student_schema import StudentCreate, StudentOut, StudentUpdate
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
