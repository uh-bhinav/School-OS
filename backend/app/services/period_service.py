from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.class_model import Class
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
    stmt = select(Period).where(Period.id == period_id, Period.is_active.is_(True))
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_periods_for_school(db: AsyncSession, school_id: int) -> list[Period]:
    """Retrieves all active periods for a school (READ FILTER APPLIED)."""
    stmt = (
        select(Period)
        .where(Period.school_id == school_id, Period.is_active.is_(True))
        .order_by(Period.period_number)
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


async def fetch_periods_for_class(db: AsyncSession, class_id: int) -> list[Period]:
    """
    Retrieves all active period time slots defined for the school of the given class.

    This function supports the Agentic Layer by providing the time structure
    for scheduling, attendance, or timetable queries related to a specific class.
    """
    # 1. Get the school_id from the class_id (essential for multi-tenancy)
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
    # FIX 3: List type is now imported
    """
    Retrieves all periods marked as recess or breaks for a given school.

    This function is used by the Agent
    to answer time-based queries like "When is lunch?"
    or for scheduling reports that exclude break times.
    """

    stmt = (
        select(Period)
        .where(
            # 1. Multi-Tenancy Filter (CRITICAL)
            Period.school_id == school_id,
            # 2. Business Logic Filter (FIX 1: Corrected E712 comparison)
            Period.is_recess.is_(True),
            # 3. Soft Delete Filter (FIX 1: Corrected E712 comparison)
            Period.is_active.is_(True),
        )
        .order_by(Period.start_time)
    )
    result = await db.execute(stmt)
    return result.scalars().all()
