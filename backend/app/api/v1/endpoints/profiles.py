# backend/app/api/v1/endpoints/profiles.py
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db
from app.schemas.profile_schema import ProfileOut
from app.services import profile_service

router = APIRouter()


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
):
    """
    Get all active user profiles for a school, with optional filters. Admin only.
    """
    return await profile_service.get_all_profiles_for_school(
        db=db, school_id=school_id, role=role, name=name
    )


@router.get(
    "/{user_id}",
    response_model=ProfileOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_profile_by_id(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Get a specific user profile by their user_id. Admin only.
    """
    db_profile = await profile_service.get_profile(db=db, user_id=user_id)
    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
        )
    return db_profile


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_profile(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Soft-deletes a user profile. Admin only.
    """
    deleted_profile = await profile_service.soft_delete_profile(db, user_id=user_id)
    if not deleted_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active profile for user_id {user_id} not found",
        )
    return None
