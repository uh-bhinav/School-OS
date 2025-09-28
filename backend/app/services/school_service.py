# backend/app/services/school_service.py
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.school import School
from app.schemas.school_schema import SchoolUpdate


async def get_school(db: AsyncSession, school_id: int) -> Optional[School]:
    stmt = select(School).where(School.school_id == school_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def update_school(
    db: AsyncSession, *, db_obj: School, school_in: SchoolUpdate
) -> School:
    update_data = school_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
