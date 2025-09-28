# backend/app/services/exam_type_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

# No longer need 'from typing import List'
from app.models.exam_type import ExamType
from app.schemas.exam_type_schema import ExamTypeCreate


async def create_exam_type(
    db: AsyncSession, *, exam_type_in: ExamTypeCreate
) -> ExamType:
    db_obj = ExamType(**exam_type_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_all_exam_types_for_school(
    db: AsyncSession, school_id: int
) -> list[ExamType]:  # Changed from List to list
    stmt = select(ExamType).where(ExamType.school_id == school_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())
