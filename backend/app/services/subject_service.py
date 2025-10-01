# backend/app/services/subject_service.py
from typing import Optional

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.subject import Subject
from app.schemas.subject_schema import SubjectCreate, SubjectUpdate


async def create_subject(db: AsyncSession, *, subject_in: SubjectCreate) -> Subject:
    db_obj = Subject(**subject_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_subject(db: AsyncSession, subject_id: int) -> Optional[Subject]:
    """
    Gets a single active subject by its ID.
    """
    stmt = select(Subject).where(Subject.subject_id == subject_id, Subject.is_active)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_subjects_for_school(
    db: AsyncSession, school_id: int
) -> list[Subject]:
    """
    Gets all active subjects for a given school.
    """
    stmt = (
        select(Subject)
        .where(Subject.school_id == school_id, Subject.is_active)
        .order_by(Subject.name)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_subject(
    db: AsyncSession, *, db_obj: Subject, subject_in: SubjectUpdate
) -> Subject:
    update_data = subject_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def soft_delete_subject(db: AsyncSession, subject_id: int) -> Optional[Subject]:
    """
    Soft-deletes a subject by setting its is_active flag to False.
    """
    stmt = (
        update(Subject)
        .where(Subject.subject_id == subject_id, Subject.is_active)
        .values(is_active=False)
        .returning(Subject)
    )
    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one_or_none()
