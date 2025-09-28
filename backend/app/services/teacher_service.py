# backend/app/services/teacher_service.py
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.profile import Profile
from app.models.teacher import Teacher
from app.schemas.teacher_schema import TeacherUpdate


async def get_teacher(db: AsyncSession, teacher_id: int) -> Optional[Teacher]:
    """
    Get a single teacher by their teacher_id, preloading profile info.
    """
    stmt = (
        select(Teacher)
        .where(Teacher.teacher_id == teacher_id)
        .options(selectinload(Teacher.profile))
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_teachers_for_school(
    db: AsyncSession, school_id: int
) -> list[Teacher]:
    """
    Get all teachers for a school, preloading their profile info.
    """
    stmt = (
        select(Teacher)
        .join(Teacher.profile)
        .where(Profile.school_id == school_id)
        .options(selectinload(Teacher.profile))
        .order_by(Profile.first_name)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_teacher(
    db: AsyncSession, *, db_obj: Teacher, teacher_in: TeacherUpdate
) -> Teacher:
    """
    Update a teacher's employment details.
    """
    update_data = teacher_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def deactivate_teacher(db: AsyncSession, *, db_obj: Teacher) -> Teacher:
    """
    Deactivate a teacher's record and their profile (soft delete).
    """
    db_obj.is_active = False
    if db_obj.profile:
        db_obj.profile.is_active = False
        db.add(db_obj.profile)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
