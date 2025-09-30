# backend/app/services/timetable_service.py
from typing import Optional

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.timetable import Timetable
from app.schemas.timetable_schema import TimetableEntryCreate, TimetableEntryUpdate


async def create_timetable_entry(
    db: AsyncSession, timetable_in: TimetableEntryCreate
) -> Timetable:
    db_obj = Timetable(**timetable_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_timetable_entry_by_id(
    db: AsyncSession, entry_id: int
) -> Optional[Timetable]:
    # Use 'Timetable.is_active' directly for the boolean check
    stmt = select(Timetable).where(Timetable.id == entry_id, Timetable.is_active)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_class_timetable(db: AsyncSession, class_id: int) -> list[Timetable]:
    # Use 'Timetable.is_active' directly for the boolean check
    stmt = (
        select(Timetable)
        .where(Timetable.class_id == class_id, Timetable.is_active)
        .order_by(Timetable.day_of_week, Timetable.period_id)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_teacher_timetable(db: AsyncSession, teacher_id: int) -> list[Timetable]:
    # Use 'Timetable.is_active' directly for the boolean check
    stmt = (
        select(Timetable)
        .where(Timetable.teacher_id == teacher_id, Timetable.is_active)
        .order_by(Timetable.day_of_week, Timetable.period_id)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_timetable_entry(
    db: AsyncSession, db_obj: Timetable, timetable_in: TimetableEntryUpdate
) -> Timetable:
    update_data = timetable_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def soft_delete_timetable_entry(
    db: AsyncSession, entry_id: int
) -> Optional[Timetable]:
    """
    Soft-deletes a timetable entry by setting its is_active flag to False.
    """
    stmt = (
        update(Timetable)
        .where(
            Timetable.id == entry_id, Timetable.is_active
        )  # Use 'Timetable.is_active' directly
        .values(is_active=False)
        .returning(Timetable)
    )
    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one_or_none()
