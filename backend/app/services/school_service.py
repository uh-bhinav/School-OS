# backend/app/services/school_service.py
from typing import Optional

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.school import School
from app.schemas.school_schema import SchoolUpdate


async def get_school(db: AsyncSession, school_id: int) -> Optional[School]:
    """
    Gets a single active school by its ID.
    """
    stmt = select(School).where(School.school_id == school_id, School.is_active)
    result = await db.execute(stmt)
    return result.scalars().first()


async def update_school(db: AsyncSession, *, db_obj: School, school_in: SchoolUpdate) -> School:
    update_data = school_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def soft_delete_school(db: AsyncSession, school_id: int) -> Optional[School]:
    """
    Soft-deletes a school by setting its is_active flag to False.
    """
    stmt = update(School).where(School.school_id == school_id, School.is_active).values(is_active=False).returning(School)
    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one_or_none()
