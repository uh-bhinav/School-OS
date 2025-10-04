# backend/app/services/exam_type_service.py
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.exam_type import ExamType
from app.schemas.exam_type_schema import ExamTypeCreate


def create_exam_type(db: Session, *, exam_type_in: ExamTypeCreate) -> ExamType:
    db_obj = ExamType(**exam_type_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_all_exam_types_for_school(db: Session, school_id: int) -> list[ExamType]:
    stmt = select(ExamType).where(ExamType.school_id == school_id)
    result = db.execute(stmt)
    return list(result.scalars().all())


def get_exam_type_id_by_name(
    db: Session, school_id: int, type_name: str
) -> Optional[int]:
    """
    Agentic Function: Retrieves the ID for a given exam type name within a school.
    """
    stmt = select(ExamType.exam_type_id).where(
        ExamType.school_id == school_id, ExamType.type_name == type_name
    )
    result = db.execute(stmt)
    # Returns the integer ID or None
    return result.scalar_one_or_none()


def check_type_name_exists(db: Session, school_id: int, type_name: str) -> bool:
    """
    Agentic Function: Checks if an exam type name already exists for the school.
    """
    stmt = select(
        select(ExamType)
        .where(ExamType.school_id == school_id, ExamType.type_name == type_name)
        .exists()
    )
    result = db.execute(stmt)
    return result.scalar_one()


def update_type_name(
    db: Session, exam_type_id: int, new_name: str
) -> Optional[ExamType]:
    """
    Agentic Function: Updates the name of an existing exam type.
    """
    db_obj = db.get(ExamType, exam_type_id)
    if not db_obj:
        return None

    db_obj.type_name = new_name
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
