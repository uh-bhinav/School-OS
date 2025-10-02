from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.academic_year import AcademicYear
from app.schemas.academic_year_schema import AcademicYearCreate, AcademicYearUpdate


async def create_academic_year(
    db: AsyncSession, *, year_in: AcademicYearCreate
) -> AcademicYear:
    """Creates a new academic year entry."""
    db_obj = AcademicYear(**year_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_academic_year(db: AsyncSession, year_id: int) -> Optional[AcademicYear]:
    """Retrieves a single active academic year by ID."""
    # Applies the READ filter to ensure only active records are fetched
    stmt = select(AcademicYear).where(
        AcademicYear.id == year_id, AcademicYear.is_active.is_(True)
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_academic_years(db: AsyncSession) -> list[AcademicYear]:
    """Retrieves all active academic years for
    all schools (RLS should handle multi-tenancy)."""
    # Applies the READ filter
    stmt = select(AcademicYear).where(AcademicYear.is_active.is_(True))
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_academic_year(
    db: AsyncSession, *, db_obj: AcademicYear, year_in: AcademicYearUpdate
) -> AcademicYear:
    """Updates academic year details."""
    update_data = year_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def soft_delete_academic_year(
    db: AsyncSession, *, year_id: int
) -> Optional[AcademicYear]:
    """
    Soft-deletes an academic year by
    setting its is_active flag to False.
    Returns the object if successfully deactivated.
    """
    # Use update/returning for efficient
    # soft delete without loading the entire object first
    stmt = (
        update(AcademicYear)
        .where(AcademicYear.id == year_id, AcademicYear.is_active.is_(True))
        .values(is_active=False)
        .returning(AcademicYear)
    )
    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one_or_none()


async def get_active_academic_year(
    db: AsyncSession, *, school_id: int
) -> Optional[AcademicYear]:
    """
    Finds the single academic year that is currently active for a school.
    Use this to get the context for the current school year's operations.
    """
    stmt = select(AcademicYear).where(
        AcademicYear.school_id == school_id, AcademicYear.is_active.is_(True)
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def set_active_academic_year(
    db: AsyncSession, *, school_id: int, academic_year_id: int
) -> Optional[AcademicYear]:
    """
    Sets a specific academic year as active for a school.
    This action deactivates all other years for the school to ensure only one
    is active.
    """
    # 1. Look up the year to get its school_id
    #  (needed for filtering other years)
    year_obj = await db.get(AcademicYear, academic_year_id)
    if not year_obj:
        return None

    school_id = year_obj.school_id

    # 2. Deactivate all other years for
    # the school (set is_active=False)
    await db.execute(
        update(AcademicYear)
        .where(AcademicYear.school_id == school_id)
        .values(is_active=False)
    )

    # 3. Activate the target year (set is_active=True)
    stmt = (
        update(AcademicYear)
        .where(
            AcademicYear.id == academic_year_id,
        )
        .values(is_active=True)
        .returning(AcademicYear)
    )

    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one_or_none()
