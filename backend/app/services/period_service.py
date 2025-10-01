from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.period import Period
from app.schemas.period_schema import PeriodCreate, PeriodUpdate


# ... (create_period function is unchanged) ...
async def create_period(db: AsyncSession, *, period_in: PeriodCreate) -> Period:
    db_obj = Period(**period_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_period(db: AsyncSession, period_id: int) -> Optional[Period]:
    """Retrieves a single active period by ID (READ FILTER APPLIED)."""
    # FIX: Replaced '== True' with the idiomatic SQLAlchemy '.is_(True)'
    stmt = select(Period).where(Period.id == period_id, Period.is_active.is_(True))
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_periods_for_school(db: AsyncSession, school_id: int) -> list[Period]:
    """Retrieves all active periods for a school (READ FILTER APPLIED)."""
    stmt = (
        select(Period)
        # FIX: Replaced '== True' with the idiomatic SQLAlchemy '.is_(True)'
        .where(Period.school_id == school_id, Period.is_active.is_(True)).order_by(
            Period.period_number
        )
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_period(
    db: AsyncSession, *, db_obj: Period, period_in: PeriodUpdate
) -> Period:
    """Updates period details."""
    update_data = period_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_period(db: AsyncSession, *, db_obj: Period) -> Period:
    """Deactivates a period (SOFT DELETE IMPLEMENTED)."""
    db_obj.is_active = False  # Set the flag to False
    db.add(db_obj)  # Mark the object as modified
    await db.commit()  # Save the change (the soft delete)
    return db_obj
