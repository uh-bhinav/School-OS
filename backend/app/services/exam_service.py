# backend/app/services/exam_service.py
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.exam import Exam
from app.schemas.exam_schema import ExamCreate, ExamUpdate


async def create_exam(db: AsyncSession, exam_in: ExamCreate) -> Exam:
    db_obj = Exam(**exam_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_exam_by_id(db: AsyncSession, exam_id: int) -> Optional[Exam]:
    stmt = select(Exam).where(Exam.id == exam_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_exams_for_school(db: AsyncSession, school_id: int) -> List[Exam]:
    stmt = (
        select(Exam).where(Exam.school_id == school_id).order_by(Exam.start_date.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_exam(db: AsyncSession, db_obj: Exam, exam_in: ExamUpdate) -> Exam:
    update_data = exam_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_exam(db: AsyncSession, db_obj: Exam) -> None:
    await db.delete(db_obj)
    await db.commit()
