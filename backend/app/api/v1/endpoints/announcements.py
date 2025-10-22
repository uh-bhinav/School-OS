# backend\app\api\v1\endpoints\announcements.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.schemas.announcement_schema import AnnouncementCreate, AnnouncementOut
from app.services import announcement_service

router = APIRouter()


@router.post(
    "/",
    response_model=AnnouncementOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_announcement(
    announcement_in: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_profile=Depends(get_current_user_profile),
):
    """Create a new announcement targeted to specific audiences."""

    announcement = await announcement_service.create_announcement(
        db=db,
        announcement_in=announcement_in,
        published_by_id=current_profile.user_id,
        language=getattr(current_profile, "preferred_language", None),
    )
    return announcement


@router.get("/", response_model=list[AnnouncementOut])
async def list_announcements(
    db: AsyncSession = Depends(get_db),
    current_profile=Depends(get_current_user_profile),
):
    """
    Return the announcements that are visible to the authenticated user.
    """
    announcements = await announcement_service.get_user_announcement_feed(db=db, user_id=current_profile.user_id)
    return announcements
