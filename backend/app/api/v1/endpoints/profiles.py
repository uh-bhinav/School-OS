import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.profile_schema import ProfileOut
from app.services import profile_service

router = APIRouter()


@router.get("/me", response_model=ProfileOut)
async def get_my_profile(current_profile: Profile = Depends(get_current_user_profile)) -> Profile:
    """Return the authenticated user's profile."""

    return current_profile


@router.get(
    "/school/{school_id}",
    response_model=list[ProfileOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_profiles(
    school_id: int,
    role: Optional[str] = None,
    name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
) -> list[Profile]:
    """List profiles for the admin's school with optional filters."""

    if current_profile.school_id != school_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this school")

    return await profile_service.get_all_profiles_for_school(db=db, school_id=school_id, role=role, name=name)


@router.get(
    "/{user_id}",
    response_model=ProfileOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_profile_by_id(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
) -> Profile:
    """Retrieve a specific profile by identifier."""

    db_profile = await profile_service.get_profile(db=db, user_id=user_id)
    if not db_profile or db_profile.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return db_profile


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_profile(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
) -> None:
    """Soft delete a profile from the admin's school."""

    deleted_profile = await profile_service.soft_delete_profile(db=db, user_id=user_id, school_id=current_profile.school_id)
    if not deleted_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Active profile for user_id {user_id} not found in this school")
    return None


@router.post("/me/picture", response_model=ProfileOut)
async def upload_own_profile_picture(
    *,
    db: AsyncSession = Depends(get_db),
    file: UploadFile = File(...),
    current_user: Profile = Depends(get_current_user_profile),
) -> Profile:
    """Upload a profile picture for the current user."""

    return await profile_service.upload_profile_picture(db=db, user_id=current_user.user_id, file=file)


@router.get("/{user_id}/picture", response_model=dict)
async def get_profile_picture_url(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user_profile),
) -> dict:
    """Generate a signed URL for a profile picture when permitted."""

    requesting_user_context = await deps.get_user_context_from_user(db, user=current_user)
    try:
        signed_url = await profile_service.get_profile_picture_url(db=db, user_id=user_id, requesting_user_context=requesting_user_context)
        return {"signed_url": signed_url, "expires_at": "1 hour from generation"}
    except HTTPException as exc:
        raise exc
    except Exception as exc:  # pragma: no cover - unexpected failures surfaced as 500s
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
