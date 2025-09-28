# backend/app/services/employment_status_service.py
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.employment_status import EmploymentStatus
from app.schemas.employment_status_schema import EmploymentStatusCreate


async def create_status(
    db: AsyncSession, *, status_in: EmploymentStatusCreate
) -> EmploymentStatus:
    db_obj = EmploymentStatus(**status_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_all_statuses_for_school(
    db: AsyncSession, school_id: int
) -> List[EmploymentStatus]:
    stmt = select(EmploymentStatus).where(EmploymentStatus.school_id == school_id)
    result = await db.execute(stmt)
    return result.scalars().all()
