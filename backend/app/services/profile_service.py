# backend/app/services/profile_service.py
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.user_roles import UserRole
from app.schemas.profile_schema import ProfileUpdate


async def get_profile(db: AsyncSession, user_id: UUID) -> Optional[Profile]:
    """
    Get a single profile by its user_id, preloading all related role and entity info.
    """
    stmt = (
        select(Profile)
        .where(Profile.user_id == user_id)
        .options(
            selectinload(Profile.roles).selectinload(UserRole.role_definition),
            selectinload(Profile.teacher),  # Eagerly load the teacher record
            selectinload(Profile.student),  # Eagerly load the student record
        )
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
    Get all profiles for a school, with optional filters for role and name.
    """
    stmt = (
        select(Profile)
        .where(Profile.school_id == school_id)
        .options(
            selectinload(Profile.roles).selectinload(UserRole.role_definition),
            selectinload(Profile.teacher),  # Eagerly load the teacher record
            selectinload(Profile.student),  # Eagerly load the student record
        )
        .order_by(Profile.last_name)
    )

    if role:
        stmt = stmt.join(Profile.roles).join(UserRole.role_definition).where(RoleDefinition.role_name == role)

    if name:
        # Simple case-insensitive search on first or last name
        search = f"%{name}%"
        stmt = stmt.where(Profile.first_name.ilike(search) | Profile.last_name.ilike(search))

    result = await db.execute(stmt)
    return list(result.scalars().unique().all())


async def soft_delete_profile(db: AsyncSession, *, user_id: UUID, school_id: int) -> Optional[Profile]:
    """
    Soft-deletes a profile by setting is_active to False.
    Ensures an admin can only delete users from their own school.
    """
    db_obj = await get_profile(db, user_id=user_id)
    if db_obj and db_obj.school_id == school_id and db_obj.is_active:
        db_obj.is_active = False
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    return None


async def admin_update_profile(db: AsyncSession, *, db_obj: Profile, profile_in: ProfileUpdate) -> Profile:
    """
    Allows an Admin to update a user's profile.
    """
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
