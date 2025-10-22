"""Business logic for working with Profile records."""

from typing import Optional
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.storage import storage_client
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.user_roles import UserRole
from app.schemas.profile_schema import ProfileUpdate

MAX_PROFILE_PICTURE_BYTES = 5 * 1024 * 1024


async def get_profile(db: AsyncSession, user_id: UUID) -> Optional[Profile]:
    """Fetch a single profile by user identifier with related data eagerly loaded."""

    stmt = (
        select(Profile)
        .where(Profile.user_id == user_id)
        .options(
            selectinload(Profile.roles).selectinload(UserRole.role_definition),
            selectinload(Profile.teacher),
            selectinload(Profile.student),
        )
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_profiles_for_school(
    db: AsyncSession,
    *,
    school_id: int,
    role: Optional[str] = None,
    name: Optional[str] = None,
) -> list[Profile]:
    """Return all profiles scoped to a school with optional role and name filters."""

    stmt = (
        select(Profile)
        .where(Profile.school_id == school_id)
        .options(
            selectinload(Profile.roles).selectinload(UserRole.role_definition),
            selectinload(Profile.teacher),
            selectinload(Profile.student),
        )
        .order_by(Profile.last_name)
    )

    if role:
        stmt = stmt.join(Profile.roles).join(UserRole.role_definition).where(RoleDefinition.role_name == role)

    if name:
        search = f"%{name}%"
        stmt = stmt.where(Profile.first_name.ilike(search) | Profile.last_name.ilike(search))

    result = await db.execute(stmt)
    return list(result.scalars().unique().all())


async def soft_delete_profile(db: AsyncSession, *, user_id: UUID, school_id: int) -> Optional[Profile]:
    """Soft delete a profile if it belongs to the provided school and is active."""

    db_obj = await get_profile(db, user_id=user_id)
    if db_obj and db_obj.school_id == school_id and db_obj.is_active:
        db_obj.is_active = False
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    return None


async def admin_update_profile(db: AsyncSession, *, db_obj: Profile, profile_in: ProfileUpdate) -> Profile:
    """Update selected profile fields on behalf of an administrator."""

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def upload_profile_picture(db: AsyncSession, *, user_id: UUID, file: UploadFile) -> Profile:
    """Store a new profile picture and persist the relative storage path."""

    profile = await get_profile(db, user_id=user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image.")

    contents = await file.read()
    if len(contents) > MAX_PROFILE_PICTURE_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File size cannot exceed 5MB.")

    file_extension = (file.filename or "avatar").split(".")[-1]
    storage_path = f"{user_id}/avatar.{file_extension}"

    storage_client.upload_file(bucket="profile-pictures", path=storage_path, file=contents, mime_type=file.content_type)

    profile.profile_picture_url = storage_path
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def get_profile_picture_url(db: AsyncSession, *, user_id: UUID, requesting_user_context: dict) -> str:
    """Return a signed URL for a stored profile picture after verifying permissions."""

    profile = await get_profile(db, user_id=user_id)
    if not profile or not profile.profile_picture_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile picture not found")

    is_owner = requesting_user_context.get("user_id") == str(user_id)
    role_names = requesting_user_context.get("role_names", []) or []
    if not role_names:
        role_names = requesting_user_context.get("roles", []) or []
    is_admin = "School Admin" in role_names or "Admin" in role_names

    if not (is_owner or is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not authorized to view this profile picture.")

    return storage_client.generate_signed_url(bucket="profile-pictures", path=profile.profile_picture_url, expires_in=3600)
