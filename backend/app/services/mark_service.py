# backend/app/services/mark_service.py
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.mark import Mark
from app.schemas.mark_schema import MarkCreate, MarkUpdate


async def create_mark(db: AsyncSession, mark_in: MarkCreate) -> Mark:
    db_obj = Mark(**mark_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_mark_by_id(db: AsyncSession, mark_id: int) -> Optional[Mark]:
    stmt = select(Mark).where(Mark.id == mark_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_marks_by_student(db: AsyncSession, student_id: int) -> List[Mark]:
    stmt = select(Mark).where(Mark.student_id == student_id).order_by(Mark.exam_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_marks_for_exam(db: AsyncSession, exam_id: int) -> List[Mark]:
    stmt = select(Mark).where(Mark.exam_id == exam_id).order_by(Mark.student_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_mark(db: AsyncSession, db_obj: Mark, mark_in: MarkUpdate) -> Mark:
    update_data = mark_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_mark(db: AsyncSession, db_obj: Mark) -> None:
    await db.delete(db_obj)
    await db.commit()
