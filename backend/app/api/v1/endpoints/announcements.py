# backend/app/api/v1/endpoints/announcements.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from supabase.lib.client_options import User

from app.core.security import get_current_user, require_role
from app.db.session import get_db
from app.schemas.announcement_schema import AnnouncementCreate, AnnouncementOut
from app.services import announcement_service

router = APIRouter()


@router.post(
    "/",
    response_model=AnnouncementOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Communication: Announcements"],
)
async def create_new_announcement(
    announcement_in: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Publishes a new announcement targeted at specific school segments.
    Admin only.
    """
    return await announcement_service.create_announcement(
        db=db, obj_in=announcement_in, published_by_id=current_user.id
    )


@router.get(
    "/feed", response_model=list[AnnouncementOut], tags=["Communication: Announcements"]
)
async def get_my_announcement_feed(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """
    Retrieves the personalized feed of announcements for the logged-in user.
    (Access is filtered by RLS).
    """
    # The simplicity of this endpoint highlights
    #  the power of RLS doing the heavy lifting.
    return await announcement_service.get_user_announcement_feed(
        db=db, user_id=current_user.id
    )
