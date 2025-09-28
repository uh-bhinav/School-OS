# backend/app/services/period_service.py
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.period import Period
from app.schemas.period_schema import PeriodCreate, PeriodUpdate


async def create_period(db: AsyncSession, *, period_in: PeriodCreate) -> Period:
    db_obj = Period(**period_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_period(db: AsyncSession, period_id: int) -> Optional[Period]:
    stmt = select(Period).where(Period.id == period_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_periods_for_school(db: AsyncSession, school_id: int) -> List[Period]:
    stmt = (
        select(Period)
        .where(Period.school_id == school_id)
        .order_by(Period.period_number)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_period(
    db: AsyncSession, *, db_obj: Period, period_in: PeriodUpdate
) -> Period:
    update_data = period_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_period(db: AsyncSession, *, db_obj: Period) -> Period:
    await db.delete(db_obj)
    await db.commit()
    return db_obj
