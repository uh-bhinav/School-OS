# backend/app/core/security.py
from datetime import datetime, timedelta, timezone
from typing import Any, Union

import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.db.session import get_db
from app.models.profile import Profile
from app.models.user_roles import UserRole
from supabase import Client, create_async_client

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# Dependency to get the Supabase client
async def get_supabase_client() -> Client:
    return await create_async_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


# Dependency to get the current user's profile from your database
async def _get_current_user_profile_from_db(
    token: str = Depends(oauth2_scheme),
    supabase: Client = Depends(get_supabase_client),
    db: AsyncSession = Depends(get_db),
) -> Profile:
    try:
        user_response = await supabase.auth.get_user(token)
        auth_user = user_response.user
        if not auth_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        stmt = select(Profile).where(Profile.user_id == auth_user.id).options(selectinload(Profile.roles).selectinload(UserRole.role_definition))
        result = await db.execute(stmt)
        profile = result.scalars().first()

        if not profile or not profile.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Profile not found or inactive",
            )

        return profile
    except Exception as e:
        print(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


# Final implementation of the role checker
def require_role(*required_roles: str):
    """
    Dependency that checks if the current user has ANY of the required roles.
    """
    required_roles_set = set(required_roles)

    async def role_checker(
        profile: Profile = Depends(_get_current_user_profile_from_db),
    ) -> Profile:
        user_roles = {role.role_definition.role_name for role in profile.roles}

        # If the user has no roles in common with the required roles, deny access.
        if user_roles.isdisjoint(required_roles_set):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=("Operation not permitted. " f"Requires one of: {', '.join(required_roles)}."),
            )
        return profile

    return role_checker


get_current_user_profile = _get_current_user_profile_from_db


async def invite_user(
    email: str,
    school_id: int,
    first_name: str,
    last_name: str,
    phone_number: str | None = None,
    gender: str | None = None,
    dob: str | None = None,
) -> dict:
    payload = {
        "email": email,
        "data": {
            "school_id": school_id,
            "first_name": first_name,
            "last_name": last_name,
            "phone_number": phone_number,
            "gender": gender,
            "date_of_birth": dob,
        },
    }

    response = requests.post(
        f"{settings.SUPABASE_URL}/auth/v1/invite",
        headers={
            "apikey": settings.SUPABASE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
    )

    if not response.ok:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Supabase invite failed: {response.text}",
        )

    return response.json()


def create_access_token(subject: Union[str, Any], roles: list[str] = [], expires_delta: timedelta = None) -> str:
    """
    Generates a JWT access token for testing purposes.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Default to a 15-minute expiration
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "roles": roles,  # Include roles in the token
    }
    # NOTE: In a real app, the SECRET_KEY should be much more complex and kept secret.
    # For testing, we'll use a simple key defined in settings.
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
