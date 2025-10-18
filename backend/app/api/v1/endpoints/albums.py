from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user_roles import User
from app.schemas.album_schema import Album as AlbumSchema
from app.schemas.album_schema import AlbumCreate
from app.schemas.album_target_schema import AlbumTarget as AlbumTargetSchema
from app.schemas.album_target_schema import AlbumTargetCreate
from app.services.album_service import album_service
from app.services.album_target_service import album_target_service

router = APIRouter()


@router.post("/", response_model=AlbumSchema, status_code=status.HTTP_201_CREATED)
def create_album_with_targets(
    *,
    db: Session = Depends(deps.get_db),
    album_in: AlbumCreate,
    targets_in: list[AlbumTargetCreate],
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new album along with its targeting rules.
    Restricted to users with appropriate permissions (e.g., teachers, admins).
    """
    if not deps.is_teacher(current_user) and not deps.is_school_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create albums",
        )

    album = album_service.create_album_with_targets(db=db, album_data=album_in, targets=targets_in, published_by_id=current_user.user_id, school_id=current_user.school_id)
    return album


@router.get("/", response_model=list[AlbumSchema])
def list_accessible_albums(
    db: Session = Depends(deps.get_db),
    album_type: str = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve all albums that the current user has access to,
    based on their school, public access, and specific targeting rules.
    """
    user_context = deps.get_user_context_from_user(db, user=current_user)
    albums = album_service.get_accessible_albums(db=db, user_context=user_context, album_type=album_type)
    return albums


@router.get("/{album_id}", response_model=AlbumSchema)
def get_album_details(
    album_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get detailed information for a single album, including its targets.
    This endpoint should verify the user has access before returning the data.
    """
    # First, check if the album exists and belongs to the user's school
    album = db.query(AlbumSchema).filter(AlbumSchema.id == album_id, AlbumSchema.school_id == current_user.school_id).first()
    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

    # Now, verify if the user has access based on the same logic as listing
    user_context = deps.get_user_context_from_user(db, user=current_user)
    accessible_albums = album_service.get_accessible_albums(db=db, user_context=user_context)
    if album_id not in [a.id for a in accessible_albums]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this album")

    return album


@router.put("/{album_id}/targets", response_model=list[AlbumTargetSchema])
def update_album_targets(
    album_id: int,
    targets_in: list[AlbumTargetCreate],
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update the targeting rules for an album.
    This replaces all existing targets with the new set.
    Restricted to admins and teachers.
    """
    if not deps.is_teacher(current_user) and not deps.is_school_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update album targets",
        )

    # Verify album exists in the user's school
    album = db.query(AlbumSchema).filter(AlbumSchema.id == album_id, AlbumSchema.school_id == current_user.school_id).first()
    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

    # Atomically delete old targets and create new ones
    try:
        album_target_service.delete_targets(db, album_id=album_id)
        new_targets = album_target_service.create_targets(db, album_id=album_id, targets=targets_in)
        return new_targets
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update targets: {e}")
