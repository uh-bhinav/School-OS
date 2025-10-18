from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user_roles import User
from app.schemas.media_item_schema import MediaItem as MediaItemSchema
from app.services.media_service import media_service

router = APIRouter()


@router.post("/upload", response_model=MediaItemSchema, status_code=status.HTTP_201_CREATED)
async def upload_media_to_album(
    *,
    db: Session = Depends(deps.get_db),
    album_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload a new media item (image or video) to a specific album.
    Permissions are checked within the service layer before upload.
    """
    # Note: More specific permission checks (e.g., is user a teacher?)
    # should be added inside the media_service as per the roadmap.
    media_item = await media_service.upload_media_item(db=db, album_id=album_id, file=file, uploaded_by_id=current_user.user_id)
    return media_item


@router.get("/{media_item_id}/signed-url", response_model=dict)
def get_signed_url_for_media(
    media_item_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Generate a secure, time-limited signed URL for a media item.
    The service layer will verify if the user has access to this item
    based on the album's access rules before generating the URL.
    """
    user_context = deps.get_user_context_from_user(db, user=current_user)
    try:
        signed_url = media_service.generate_signed_url(db=db, media_item_id=media_item_id, user_context=user_context)
        return {"signed_url": signed_url, "expires_in": 3600}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{media_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media_item(
    media_item_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> None:
    """
    Delete a media item.
    By default, only the user who uploaded it or an admin can delete it.
    """
    try:
        media_service.delete_media_item(db=db, media_item_id=media_item_id, user_id=current_user.user_id)
        return
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
