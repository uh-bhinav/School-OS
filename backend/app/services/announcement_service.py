# backend/app/services/announcement_service.py (Corrected)
from typing import Optional
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.announcement import Announcement
from app.models.announcement_target import AnnouncementTarget
from app.models.profile import Profile
from app.schemas.announcement_schema import AnnouncementCreate


async def create_announcement(
    db: AsyncSession,
    *,
    announcement_in: AnnouncementCreate,
    published_by_id: UUID,
    language: Optional[str] = None,
) -> Announcement:
    """Create a new announcement along with its targets."""

    announcement_data = announcement_in.model_dump(exclude={"targets"})

    db_announcement = Announcement(
        published_by_id=published_by_id,
        language=language,
        targets=[AnnouncementTarget(**target.model_dump()) for target in announcement_in.targets],
        **announcement_data,
    )

    db.add(db_announcement)
    try:
        await db.commit()
    except SQLAlchemyError:
        await db.rollback()
        raise
    await db.refresh(db_announcement)
    await db.refresh(db_announcement, attribute_names=["targets"])

    return db_announcement


async def get_announcement_by_id(db: AsyncSession, announcement_id: int) -> Optional[Announcement]:
    """Retrieves a single announcement."""
    stmt = select(Announcement).where(Announcement.id == announcement_id, Announcement.is_active.is_(True))
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_user_announcement_feed(db: AsyncSession, user_id: UUID) -> list[Announcement]:
    """
    Retrieves announcements relevant to the
    user (Requires complex filtering/RLS).
    """
    # 1. Look up the user's school_id first.
    user_profile = await db.get(Profile, user_id)
    if not user_profile:
        return []

    # 2. Add the essential multi-tenancy filter to the query.
    stmt = select(Announcement).where(
        Announcement.is_active.is_(True),
        Announcement.school_id == user_profile.school_id,
        # CRITICAL: Filter by school
    )

    # RLS will apply the fine-grained logic for targets (CLASS, GRADE)
    result = await db.execute(stmt)
    return result.scalars().all()


async def delete_announcement(db: AsyncSession, *, db_obj: Announcement):
    """Deactivates an announcement (SOFT DELETE IMPLEMENTED)."""
    db_obj.is_active = False  # Set the flag to False
    db.add(db_obj)
    await db.commit()
