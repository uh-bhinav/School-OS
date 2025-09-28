# backend/app/core/security.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from supabase import Client, create_client

from app.core.config import settings
from app.db.session import get_db
from app.models.profile import Profile
from app.models.user_role import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# Dependency to get the Supabase client
async def get_supabase_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


# Dependency to get the current user's profile from your database
async def get_current_user_profile(
    token: str = Depends(oauth2_scheme),
    supabase: Client = Depends(get_supabase_client),
    db: AsyncSession = Depends(get_db),
) -> Profile:
    try:
        user_response = await supabase.auth.get_user(token)
        auth_user = user_response.user
        if not auth_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
            )

        # Fetch the user's profile and roles from your public schema
        stmt = (
            select(Profile)
            .where(Profile.user_id == auth_user.id)
            .options(selectinload(Profile.roles).selectinload(UserRole.role_definition))
        )
        result = await db.execute(stmt)
        profile = result.scalars().first()

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Profile not found"
            )

        return profile
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


# Final implementation of the role checker
def require_role(required_role: str):
    """
    Dependency that checks if the current user has the required role.
    This enforces the application-layer security based on your defined policies.
    """

    async def role_checker(
        profile: Profile = Depends(get_current_user_profile),
    ) -> Profile:
        user_roles = {role.role_definition.role_name for role in profile.roles}
        if required_role not in user_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Requires '{required_role}' role.",
            )
        return profile

    return role_checker
