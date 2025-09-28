# backend/app/services/subject_service.py
from typing import List, Optional

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
    stmt = select(Subject).where(Subject.subject_id == subject_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_subjects_for_school(
    db: AsyncSession, school_id: int
) -> List[Subject]:
    stmt = select(Subject).where(Subject.school_id == school_id).order_by(Subject.name)
    result = await db.execute(stmt)
    return result.scalars().all()


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


async def delete_subject(db: AsyncSession, *, db_obj: Subject) -> Subject:
    await db.delete(db_obj)
    await db.commit()
    return db_obj
