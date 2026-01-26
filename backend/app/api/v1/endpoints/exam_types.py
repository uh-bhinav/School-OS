# backend/app/api/v1/endpoints/exam_types.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role

# No longer need 'from typing import List'
from app.db.session import get_db
from app.schemas.exam_type_schema import ExamTypeCreate, ExamTypeOut
from app.services import exam_type_service

router = APIRouter()


@router.post(
    "/",
    response_model=ExamTypeOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_exam_type(*, db: AsyncSession = Depends(get_db), exam_type_in: ExamTypeCreate):
    """
    Create a new exam type category for a school. Admin only.
    """
    return await exam_type_service.create_exam_type(db=db, exam_type_in=exam_type_in)


@router.get(
    "/{school_id}/all",
    response_model=list[ExamTypeOut],  # Changed from List to list
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_exam_types(school_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all exam type categories for a school. Admin only.
    """
    return await exam_type_service.get_all_exam_types_for_school(db=db, school_id=school_id)
