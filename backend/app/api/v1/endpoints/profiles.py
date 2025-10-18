import uuid
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user_roles import User
from app.schemas.profile_schema import Profile, ProfileCreate, ProfileUpdate
from app.services.profile_service import profile_service

router = APIRouter()


@router.get("/", response_model=list[Profile])
def read_profiles(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve profiles.
    """
    if not deps.is_school_admin(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    profiles = profile_service.get_profiles_by_school(db, school_id=current_user.school_id, skip=skip, limit=limit)
    return profiles


@router.post("/", response_model=Profile)
def create_profile(
    *,
    db: Session = Depends(deps.get_db),
    profile_in: ProfileCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new profile.
    """
    # This endpoint might need more specific logic depending on who can create profiles
    profile = profile_service.create_profile(db=db, profile=profile_in, user_id=current_user.user_id, school_id=current_user.school_id)
    return profile


@router.put("/me", response_model=Profile)
def update_profile_me(
    *,
    db: Session = Depends(deps.get_db),
    profile_in: ProfileUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own profile.
    """
    profile = profile_service.update_profile(db=db, user_id=current_user.user_id, profile=profile_in)
    return profile


@router.get("/me", response_model=Profile)
def read_profile_me(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current profile.
    """
    return current_user.profile


@router.get("/{user_id}", response_model=Profile)
def read_profile_by_id(
    user_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific profile by id.
    """
    profile = profile_service.get_profile(db, user_id=user_id)
    if not profile or profile.school_id != current_user.school_id:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


# --- NEW ENDPOINTS FROM ROADMAP ---


@router.post("/me/picture", response_model=Profile)
async def upload_own_profile_picture(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload a profile picture for the currently authenticated user.
    """
    profile = await profile_service.upload_profile_picture(db=db, user_id=current_user.user_id, file=file)
    return profile


@router.get("/{user_id}/picture", response_model=dict)
def get_profile_picture_url(
    user_id: uuid.UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get a secure, time-limited signed URL for a user's profile picture.
    Access is restricted to the owner or a school admin.
    """
    requesting_user_context = deps.get_user_context_from_user(db, user=current_user)
    try:
        signed_url = profile_service.get_profile_picture_url(db=db, user_id=user_id, requesting_user_context=requesting_user_context)
        return {"signed_url": signed_url, "expires_at": "1 hour from generation"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
