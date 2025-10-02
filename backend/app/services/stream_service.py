# backend/app/services/stream_service.py

from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.stream import Stream
from app.models.subject import Subject
from app.schemas.stream_schema import StreamCreate, StreamUpdate


async def create_stream(db: AsyncSession, *, stream_in: StreamCreate) -> Stream:
    """
    Creates a new academic stream for a school (e.g., 'Science').
    This is an administrative function.
    """
    db_stream = Stream(**stream_in.model_dump())
    db.add(db_stream)
    await db.commit()
    await db.refresh(db_stream)
    return db_stream


async def get_stream_by_id(db: AsyncSession, stream_id: int) -> Optional[Stream]:
    """
    Retrieves a single stream by its ID, preloading its associated subjects.
    """
    stmt = (
        select(Stream)
        .where(Stream.id == stream_id)
        .options(selectinload(Stream.subjects))
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_streams_for_school(
    db: AsyncSession, *, school_id: int
) -> list[Stream]:
    """
    Retrieves a list of all available academic streams for a given school.
    """
    stmt = (
        select(Stream)
        .where(Stream.school_id == school_id, Stream.is_active.is_(True))
        .options(selectinload(Stream.subjects))
        .order_by(Stream.name)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_stream(
    db: AsyncSession, *, db_stream: Stream, stream_in: StreamUpdate
) -> Stream:
    """
    Updates the details of an existing stream, such as its name or description.
    """
    update_data = stream_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_stream, field, value)
    db.add(db_stream)
    await db.commit()
    await db.refresh(db_stream)
    return db_stream


async def assign_subjects_to_stream(
    db: AsyncSession, *, db_stream: Stream, subject_ids: list[int]
) -> Stream:
    """
    Assigns a list of subjects to a stream, replacing any existing associations.
    """
    # Fetch the subject objects from the database
    subjects = await db.execute(
        select(Subject).where(Subject.subject_id.in_(subject_ids))
    )
    db_stream.subjects = list(subjects.scalars().all())

    db.add(db_stream)
    await db.commit()
    await db.refresh(db_stream)
    return db_stream


async def get_subjects_for_stream(
    db: AsyncSession, *, stream_id: int
) -> list[Subject]:
    """
    Retrieves all the subjects that are part of a specific academic stream.
    """
    stream = await get_stream_by_id(db, stream_id=stream_id)
    return stream.subjects if stream else []