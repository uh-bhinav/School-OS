# backend/app/api/v1/endpoints/albums.py
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.album import Album
from app.models.profile import Profile
from app.schemas.album_schema import AlbumCreate, AlbumResponse
from app.schemas.album_target_schema import AlbumTargetCreate, AlbumTargetResponse
from app.services.album_service import album_service
from app.services.album_target_service import album_target_service

router = APIRouter()


@router.post("/", response_model=AlbumResponse, status_code=status.HTTP_201_CREATED)
async def create_album_with_targets(
    *,
    db: AsyncSession = Depends(deps.get_db),
    album_in: AlbumCreate,
    current_user: Profile = Depends(deps.get_current_active_user),
) -> Any:
    """Create an album and persist any access targets in a single request."""
    if not deps.is_teacher(current_user) and not deps.is_school_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create albums",
        )

    album = await album_service.create_album_with_targets(
        db=db,
        album_data=album_in,
        targets=album_in.targets,
        published_by_id=current_user.user_id,
        school_id=current_user.school_id,
    )
    return album


@router.get("/", response_model=list[AlbumResponse])
async def list_accessible_albums(
    db: AsyncSession = Depends(deps.get_db),
    album_type: str | None = None,
    current_user: Profile = Depends(deps.get_current_active_user),
) -> Any:
    """Return albums the user can actually see based on role and targets."""
    user_context = await deps.get_user_context_from_user(db, user=current_user)
    albums = await album_service.get_accessible_albums(
        db=db,
        user_context=user_context,
        album_type=album_type,
    )
    return albums


@router.get("/{album_id}", response_model=AlbumResponse)
async def get_album_details(
    album_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: Profile = Depends(deps.get_current_active_user),
) -> Any:
    """Fetch a single album after verifying the requesting user's access."""

    stmt = select(Album).where(
        Album.id == album_id,
        Album.school_id == current_user.school_id,
    )
    result = await db.execute(stmt)
    album = result.scalars().first()

    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

    user_context = await deps.get_user_context_from_user(db, user=current_user)
    accessible_albums = await album_service.get_accessible_albums(db=db, user_context=user_context)

    if album_id not in {a.id for a in accessible_albums}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this album")

    return album


@router.put("/{album_id}/targets", response_model=list[AlbumTargetResponse])
async def update_album_targets(
    album_id: int,
    targets_in: list[AlbumTargetCreate],
    db: AsyncSession = Depends(deps.get_db),
    current_user: Profile = Depends(deps.get_current_active_user),
) -> Any:
    """Replace all targets for the requested album."""
    if not deps.is_teacher(current_user) and not deps.is_school_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update album targets",
        )

    stmt = select(Album).where(
        Album.id == album_id,
        Album.school_id == current_user.school_id,
    )
    result = await db.execute(stmt)
    album = result.scalars().first()

    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

    try:
        await album_target_service.delete_targets(db, album_id=album_id)
        new_targets = await album_target_service.create_targets(
            db,
            album_id=album_id,
            targets=targets_in,
        )
        await db.commit()
        return new_targets
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update targets: {exc}",
        )
