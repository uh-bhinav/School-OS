# backend/app/services/subject_service.py
from typing import Optional

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

# Models and Schemas needed
# Add this import
from app.models.class_model import class_subjects_association
from app.models.profile import Profile
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.schemas.subject_schema import SubjectCreate, SubjectUpdate

# --- Basic CRUD Functions ---


async def get_subject_with_streams(
    db: AsyncSession, subject_id: int
) -> Optional[Subject]:
    """
    Gets a single subject by ID, preloading the 'streams' relationship
    to ensure it matches the SubjectOut schema.
    """
    stmt = (
        select(Subject)
        .where(Subject.subject_id == subject_id, Subject.is_active)
        .options(selectinload(Subject.streams))  # <-- Eagerly load streams
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def create_subject(db: AsyncSession, *, subject_in: SubjectCreate) -> Subject:
    """Creates a new subject in the master list for a school."""
    db_obj = Subject(**subject_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return await get_subject_with_streams(db=db, subject_id=db_obj.subject_id)


async def get_subject(db: AsyncSession, subject_id: int) -> Optional[Subject]:
    """Gets a single active subject by its ID."""
    stmt = select(Subject).where(Subject.subject_id == subject_id, Subject.is_active)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_subjects_for_school(
    db: AsyncSession, school_id: int
) -> list[Subject]:
    """Gets all active subjects for a given school."""
    stmt = (
        select(Subject)
        .where(Subject.school_id == school_id, Subject.is_active)
        .options(selectinload(Subject.streams))
        .order_by(Subject.name)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_subject(
    db: AsyncSession, *, db_obj: Subject, subject_in: SubjectUpdate
) -> Subject:
    """Updates a subject's details."""
    update_data = subject_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return await get_subject_with_streams(db=db, subject_id=db_obj.subject_id)


async def soft_delete_subject(db: AsyncSession, subject_id: int) -> Optional[Subject]:
    """Soft-deletes a subject by setting its is_active flag to False."""
    stmt = (
        update(Subject)
        .where(Subject.subject_id == subject_id, Subject.is_active)
        .values(is_active=False)
        .returning(Subject)
    )
    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one_or_none()


# --- Business Logic Functions ---


async def get_subjects_for_class(db: AsyncSession, class_id: int) -> list[Subject]:
    """
    Retrieves a list of all subjects taught in a specific class.
    """
    stmt = (
        select(Subject)
        .join(class_subjects_association)
        .where(class_subjects_association.c.class_id == class_id, Subject.is_active)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_teachers_for_subject(
    db: AsyncSession, *, school_id: int, subject_id: int
) -> list[Teacher]:
    """
    Finds all active teachers in a school whose specialization matches
    a given subject.
    """
    # First, get the subject name from its ID
    subject = await get_subject(db, subject_id=subject_id)
    if not subject:
        return []

    # Now, find teachers with that name in their specialization string
    stmt = (
        select(Teacher)
        .join(Teacher.profile)
        .where(
            Profile.school_id == school_id,
            Teacher.is_active,
            # This performs a case-insensitive search
            Teacher.subject_specialization.ilike(f"%{subject.name}%"),
        )
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())
