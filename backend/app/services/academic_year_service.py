# backend/app/services/academic_year_service.py


from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.academic_year import AcademicYear
from app.schemas.academic_year_schema import AcademicYearCreate, AcademicYearUpdate



async def create_academic_year(
    db: AsyncSession, *, year_in: AcademicYearCreate
) -> AcademicYear:
    db_obj = AcademicYear(**year_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_academic_year(db: AsyncSession, year_id: int) -> Optional[AcademicYear]:
    """
    Gets a single active academic year by its ID.
    """
    stmt = select(AcademicYear).where(
        AcademicYear.id == year_id, AcademicYear.is_active
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_academic_years_for_school(
    db: AsyncSession, school_id: int
) -> list[AcademicYear]:
    """
    Gets all active academic years for a given school.
    """
    stmt = (
        select(AcademicYear)
        .where(AcademicYear.school_id == school_id, AcademicYear.is_active)
        .order_by(AcademicYear.start_date.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_academic_year(
    db: AsyncSession, *, db_obj: AcademicYear, year_in: AcademicYearUpdate
) -> AcademicYear:
    update_data = year_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def soft_delete_academic_year(
    db: AsyncSession, year_id: int
) -> Optional[AcademicYear]:
    """
    Soft-deletes an academic year by setting its is_active flag to False.
    """
    stmt = (
        update(AcademicYear)
        .where(AcademicYear.id == year_id, AcademicYear.is_active)
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
    This is an administrative action that first deactivates all other years for the school
    to ensure only one year is ever active.
    """
    # Deactivate all other years for the school in one transaction
    await db.execute(
        update(AcademicYear)
        .where(AcademicYear.school_id == school_id)
        .values(is_active=False)
    )

    # Activate the target year
    stmt = (
        update(AcademicYear)
        .where(
            AcademicYear.id == academic_year_id,
            AcademicYear.school_id == school_id,
        )
        .values(is_active=True)
        .returning(AcademicYear)
    )

    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one_or_none()