# backend/app/services/profile_service.py
from typing import Optional
from uuid import UUID

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.user_role import UserRole

# Assuming you have schemas for ProfileCreate and ProfileUpdate
# from app.schemas.profile_schema import ProfileCreate, ProfileUpdate


async def get_profile(db: AsyncSession, user_id: UUID) -> Optional[Profile]:
    """
    Get a single active profile by its user_id, preloading role information.
    """
    stmt = (
        select(Profile)
        .where(
            Profile.user_id == user_id, Profile.is_active
        )  # MODIFIED: Filter by is_active
        .options(selectinload(Profile.roles).selectinload(UserRole.role_definition))
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_profiles_for_school(
    db: AsyncSession,
    school_id: int,
    role: Optional[str] = None,
    name: Optional[str] = None,
) -> list[Profile]:
    """
    Get all active profiles for a school, with optional filters for role and name.
    """
    stmt = (
        select(Profile)
        .where(
            Profile.school_id == school_id, Profile.is_active
        )  # MODIFIED: Filter by is_active
        .options(selectinload(Profile.roles).selectinload(UserRole.role_definition))
        .order_by(Profile.last_name)
    )

    if role:
        stmt = (
            stmt.join(Profile.roles)
            .join(UserRole.role_definition)
            .where(RoleDefinition.role_name == role)
        )

    if name:
        # Simple case-insensitive search on first or last name
        search = f"%{name}%"
        stmt = stmt.where(
            Profile.first_name.ilike(search) | Profile.last_name.ilike(search)
        )

    result = await db.execute(stmt)
    return list(result.scalars().unique().all())


async def soft_delete_profile(db: AsyncSession, user_id: UUID) -> Optional[Profile]:
    """
    Soft-deletes a profile by setting its is_active flag to False.
    """
    stmt = (
        update(Profile)
        .where(Profile.user_id == user_id, Profile.is_active)
        .values(is_active=False)
        .returning(Profile)
    )
    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one_or_none()
