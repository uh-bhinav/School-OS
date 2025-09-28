# backend/app/api/v1/endpoints/exams.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db
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
@router.get("/all/{school_id}", response_model=List[ExamOut])
async def get_all_exams(school_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all exams for a specific school.
    """
    exams = await exam_service.get_all_exams_for_school(db=db, school_id=school_id)
    if not exams:
        raise HTTPException(status_code=404, detail="No exams found for this school.")
    return exams


# Admin only: Update an existing exam
@router.put(
    "/{exam_id}", response_model=ExamOut, dependencies=[Depends(require_role("Admin"))]
)
async def update_exam(
    exam_id: int, exam_in: ExamUpdate, db: AsyncSession = Depends(get_db)
):
    db_obj = await exam_service.get_exam_by_id(db, exam_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Exam not found.")
    return await exam_service.update_exam(db, db_obj=db_obj, exam_in=exam_in)


# Admin only: Delete an existing exam
@router.delete(
    "/{exam_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_exam(exam_id: int, db: AsyncSession = Depends(get_db)):
    db_obj = await exam_service.get_exam_by_id(db, exam_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Exam not found.")
    await exam_service.delete_exam(db, db_obj=db_obj)
    return {"ok": True}
