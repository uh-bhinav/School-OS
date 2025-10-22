# backend/app/services/employment_status_service.py
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.employment_status import EmploymentStatus
from app.schemas.employment_status_schema import (
    EmploymentStatusCreate,
    EmploymentStatusUpdate,
)


async def create_status(db: AsyncSession, *, status_in: EmploymentStatusCreate) -> EmploymentStatus:
    """Create a new employment status."""
    db_obj = EmploymentStatus(**status_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_all_statuses_for_school(db: AsyncSession, school_id: int) -> list[EmploymentStatus]:
    """Get all employment statuses for a specific school."""
    stmt = select(EmploymentStatus).where(EmploymentStatus.school_id == school_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_status_by_id(db: AsyncSession, *, status_id: int) -> Optional[EmploymentStatus]:
    """Get a specific employment status by its ID."""
    stmt = select(EmploymentStatus).where(EmploymentStatus.status_id == status_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def update_status(db: AsyncSession, *, db_obj: EmploymentStatus, status_in: EmploymentStatusUpdate) -> EmploymentStatus:
    """Update an existing employment status."""
    update_data = status_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)

    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_status(db: AsyncSession, *, db_obj: EmploymentStatus) -> None:
    """Permanently delete an employment status."""
    await db.delete(db_obj)
    await db.commit()
