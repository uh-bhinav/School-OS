# backend/app/api/v1/endpoints/exam_types.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.exam_type_schema import ExamTypeCreate, ExamTypeOut
from app.services import exam_type_service

router = APIRouter()


@router.post("/", response_model=ExamTypeOut, status_code=status.HTTP_200_OK)
def create_exam_type(
    *, exam_type_in: ExamTypeCreate, db: Session = Depends(deps.get_db)
):
    """
    Create a new exam type.
    """
    exam_type = exam_type_service.create_exam_type(db=db, exam_type_in=exam_type_in)
    return exam_type


@router.get(
    "/{school_id}/all",
    response_model=list[ExamTypeOut],
)
def get_all_exam_types(school_id: int, db: Session = Depends(deps.get_db)):
    """
    Get all exam type categories for a school.
    """
    return exam_type_service.get_all_exam_types_for_school(db=db, school_id=school_id)
