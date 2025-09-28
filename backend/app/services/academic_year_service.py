# backend/app/services/academic_year_service.py
from typing import List, Optional

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
    stmt = select(AcademicYear).where(AcademicYear.id == year_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_academic_years_for_school(
    db: AsyncSession, school_id: int
) -> List[AcademicYear]:
    stmt = (
        select(AcademicYear)
        .where(AcademicYear.school_id == school_id)
        .order_by(AcademicYear.start_date.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


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


async def delete_academic_year(
    db: AsyncSession, *, db_obj: AcademicYear
) -> AcademicYear:
    await db.delete(db_obj)
    await db.commit()
    return db_obj
