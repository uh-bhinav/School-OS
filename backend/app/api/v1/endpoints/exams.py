# backend/app/api/v1/endpoints/exams.py (FINALIZED)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db

# CRITICAL IMPORT: Need to import the model directly for robust PUT/DELETE checks
from app.schemas.exam_schema import ExamCreate, ExamOut, ExamUpdate
from app.services import exam_service

router = APIRouter()


# Admin only: Create a new exam
@router.post(
    "/",
    response_model=ExamOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_exam(exam_in: ExamCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new exam. Admin only.
    """
    return await exam_service.create_exam(db=db, exam_in=exam_in)


# All authenticated users: Get all exams for a specific school
@router.get("/all/{school_id}", response_model=list[ExamOut])
async def get_all_exams(school_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all exams for a specific school.
    """
    # Service layer handles filtering by school_id AND is_active=True
    exams = await exam_service.get_all_exams_for_school(db=db, school_id=school_id)
    if not exams:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active exams found for this school.",
        )
    return exams


# Admin only: Update an existing exam
@router.put("/{exam_id}", response_model=ExamOut, dependencies=[Depends(require_role("Admin"))])
async def update_exam(exam_id: int, exam_in: ExamUpdate, db: AsyncSession = Depends(get_db)):
    """Update an existing exam. Admin only."""
    updated = await exam_service.update_exam(db, exam_id=exam_id, exam_in=exam_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found.")
    return updated


# Admin only: Delete an existing exam
@router.delete(
    "/{exam_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_exam(exam_id: int, db: AsyncSession = Depends(get_db)):
    """Deactivate an exam (SOFT DELETE). Admin only."""
    deleted = await exam_service.delete_exam(db, exam_id=exam_id)
    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found.")
    return None  # Return 204 No Content
