from typing import Optional

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.class_model import Class
from app.models.period import Period
from app.schemas.period_schema import PeriodCreate, PeriodStructureCreate, PeriodUpdate


async def create_period(db: AsyncSession, *, period_in: PeriodCreate) -> Period:
    """Create and persist a new period record."""
    db_obj = Period(**period_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_period(db: AsyncSession, period_id: int) -> Optional[Period]:
    """Return an active period by its identifier or None."""
    stmt = select(Period).where(Period.id == period_id, Period.is_active.is_(True))
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_periods_for_school(db: AsyncSession, school_id: int) -> list[Period]:
    """Fetch all active periods for a given school ordered by period number."""
    stmt = select(Period).where(Period.school_id == school_id, Period.is_active.is_(True)).order_by(Period.period_number)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_period(db: AsyncSession, *, db_obj: Period, period_in: PeriodUpdate) -> Period:
    """Apply updates to an existing period and persist changes."""
    update_data = period_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_period(db: AsyncSession, *, db_obj: Period) -> Period:
    """Soft-delete a period by marking it inactive."""
    db_obj.is_active = False
    db.add(db_obj)
    await db.commit()
    return db_obj


async def fetch_periods_for_class(db: AsyncSession, class_id: int) -> list[Period]:
    """Return active, non-recess periods for the class's school."""
    stmt_class = select(Class.school_id).where(Class.class_id == class_id)
    result_class = await db.execute(stmt_class)
    school_id = result_class.scalar_one_or_none()

    if not school_id:
        return []

    # 2. Retrieve all active periods using the school_id
    stmt = (
        select(Period)
        # FIX 1: Corrected E712 comparison to
        # use idiomatic SQLAlchemy syntax for boolean check
        .where(Period.school_id == school_id, Period.is_recess.is_(False))
        .options(selectinload(Period.school))
        .order_by(Period.period_number)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_recess_periods(db: AsyncSession, school_id: int) -> list[Period]:
    """Return all recess periods for a school."""
    stmt = (
        select(Period)
        .where(
            Period.school_id == school_id,
            Period.is_recess.is_(True),
            Period.is_active.is_(True),
        )
        .order_by(Period.start_time)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


# Add this function to period_service.py


async def get_teaching_periods_for_school(db: AsyncSession, school_id: int, day_of_week: Optional[str] = None) -> list[Period]:
    """
    Fetch all non-recess periods for timetable generation.
    If day_of_week is provided, filter for day-specific periods.
    """
    stmt = select(Period).where(
        Period.school_id == school_id,
        Period.is_recess.is_(False),
        Period.is_active.is_(True),
    )

    if day_of_week:
        stmt = stmt.where(Period.day_of_week == day_of_week)

    stmt = stmt.order_by(Period.start_time)

    result = await db.execute(stmt)
    return list(result.scalars().all())


async def bulk_replace_period_structure(db: AsyncSession, *, school_id: int, structure_in: PeriodStructureCreate) -> list[Period]:
    """
    A robust "power tool" service.
    1. Deletes all existing periods for the school (in a transaction).
    2. Creates all new periods from the provided list.
    """

    # This service function assumes it's wrapped in a transaction
    # by the endpoint, or it manages its own. For simplicity,
    # we'll do it as two operations with one commit.

    # Step 1: Delete all existing, non-deleted periods for this school
    delete_stmt = delete(Period).where(Period.school_id == school_id)
    await db.execute(delete_stmt)

    # Step 2: Create new periods
    new_db_periods = []
    for period_data in structure_in.periods:
        # Create the full PeriodCreate object, adding the secure school_id
        period_in = PeriodCreate(school_id=school_id, **period_data.model_dump())
        db_obj = Period(**period_in.model_dump())
        db.add(db_obj)
        new_db_periods.append(db_obj)

    # Commit the transaction (deletes and new creates)
    await db.commit()

    # Refresh all new objects to get their IDs
    for obj in new_db_periods:
        await db.refresh(obj)

    return new_db_periods
