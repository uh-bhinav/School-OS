# backend/app/services/class_service.py
from typing import Optional

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.class_model import Class
from app.schemas.class_schema import ClassCreate, ClassUpdate


async def create_class(db: AsyncSession, *, class_in: ClassCreate) -> Class:
    db_obj = Class(
        school_id=class_in.school_id,
        grade_level=class_in.grade_level,
        section=class_in.section,
        academic_year_id=class_in.academic_year_id,
        class_teacher_id=class_in.class_teacher_id,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_class(db: AsyncSession, class_id: int) -> Optional[Class]:
    """
    Gets a single class by its ID, ensuring it is active.
    """
    stmt = select(Class).where(Class.class_id == class_id, Class.is_active)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_classes_for_school(db: AsyncSession, school_id: int) -> list[Class]:
    """
    Gets all active classes for a given school.
    """
    stmt = (
        select(Class)
        .where(Class.school_id == school_id, Class.is_active)
        .order_by(Class.grade_level, Class.section)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_class(
    db: AsyncSession, *, db_obj: Class, class_in: ClassUpdate
) -> Class:
    update_data = class_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def soft_delete_class(db: AsyncSession, class_id: int) -> Optional[Class]:
    """
    Soft-deletes a class by setting its is_active flag to False.
    """
    stmt = (
        update(Class)
        .where(Class.class_id == class_id, Class.is_active)
        .values(is_active=False)
        .returning(Class)
    )
    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one_or_none()
