from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_active_user,
    get_user_context_from_user,
    is_school_admin,
    is_teacher,
)
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.media_item_schema import MediaItemResponse, SignedUrlResponse
from app.services.media_service import UnauthorizedAccessError, media_service

router = APIRouter()


@router.post("/upload", response_model=MediaItemResponse, status_code=status.HTTP_201_CREATED)
async def upload_media_item(
    album_id: int = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user),
) -> MediaItemResponse:
    """Upload a media file to the requested album when the user has privileges."""

    if not (is_teacher(current_user) or is_school_admin(current_user)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to upload media")

    media_item = await media_service.upload_media_item(
        db,
        album_id=album_id,
        file=file,
        uploaded_by_id=current_user.user_id,
    )

    response = MediaItemResponse.model_validate(media_item, from_attributes=True)
    return response.model_copy(update={"signed_url": None})


@router.get("/{media_item_id}/signed-url", response_model=SignedUrlResponse)
async def get_media_signed_url(
    media_item_id: int,
    expires_in: int = 3600,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user),
) -> SignedUrlResponse:
    """Return a signed URL for the media item if the active user can access it."""

    user_context = await get_user_context_from_user(db, current_user)
    user_context.setdefault("roles", [role.role_definition.role_name for role in current_user.roles])

    signed_url = await media_service.generate_signed_url(
        db,
        media_item_id=media_item_id,
        user_context=user_context,
        expiry_seconds=expires_in,
    )

    return SignedUrlResponse(signed_url=signed_url, expires_in=expires_in)


@router.delete("/{media_item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media_item(
    media_item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user),
) -> Response:
    """Delete a media item uploaded by the current user."""

    try:
        await media_service.delete_media_item(
            db,
            media_item_id=media_item_id,
            user_id=current_user.user_id,
        )
    except UnauthorizedAccessError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
