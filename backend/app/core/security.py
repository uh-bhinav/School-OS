# backend/app/core/security.py
import base64
import inspect
import json
import os
import uuid
from collections.abc import Iterable
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

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
from app.models.role_definition import RoleDefinition
from app.models.user_roles import UserRole
from supabase import Client, create_async_client

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# Dependency to get the Supabase client
async def get_supabase_client() -> Client:
    return await create_async_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


async def _fetch_profile_for_role(
    db: AsyncSession,
    role_name: str,
    user_uuid: uuid.UUID | None = None,
) -> Profile:
    stmt = (
        select(Profile)
        .join(UserRole, UserRole.user_id == Profile.user_id)
        .join(RoleDefinition, RoleDefinition.role_id == UserRole.role_id)
        .where(RoleDefinition.role_name == role_name)
        .options(
            selectinload(Profile.roles).selectinload(UserRole.role_definition),
            selectinload(Profile.teacher),
            selectinload(Profile.student),
        )
    )

    if user_uuid:
        stmt = stmt.where(Profile.user_id == user_uuid)

    result = await db.execute(stmt)
    profile = result.scalars().first()

    if not profile and user_uuid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(f"No {role_name.lower()} profile associated with supplied test token user '{user_uuid}'."),
        )

    if not profile:
        # Fallback: allow tokens without embedded subject to bind to any profile with the role.
        fallback_stmt = (
            select(Profile)
            .join(UserRole, UserRole.user_id == Profile.user_id)
            .join(RoleDefinition, RoleDefinition.role_id == UserRole.role_id)
            .where(RoleDefinition.role_name == role_name)
            .options(
                selectinload(Profile.roles).selectinload(UserRole.role_definition),
                selectinload(Profile.teacher),
                selectinload(Profile.student),
            )
        )
        result = await db.execute(fallback_stmt)
        profile = result.scalars().first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(f"No {role_name.lower()} profile associated with test credentials."),
        )

    if not profile.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Profile not found or inactive",
        )

    return profile


def _decode_jwt_payload(token: str) -> dict[str, Any] | None:
    parts = token.split(".")
    if len(parts) != 3:
        return None

    payload_segment = parts[1] + "=" * (-len(parts[1]) % 4)

    try:
        decoded = base64.urlsafe_b64decode(payload_segment.encode("utf-8"))
        return json.loads(decoded)
    except Exception:
        return None


def _iter_test_tokens() -> Iterable[tuple[str, str | None]]:
    yield "Admin", settings.TEST_ADMIN_TOKEN
    yield "Teacher", settings.TEST_TEACHER_TOKEN


# Dependency to get the current user's profile from your database
async def _get_current_user_profile_from_db(
    token: str = Depends(oauth2_scheme),
    supabase: Client = Depends(get_supabase_client),
    db: AsyncSession = Depends(get_db),
) -> Profile:
    try:
        for role_name, test_token in _iter_test_tokens():
            if test_token and token == test_token:
                payload = _decode_jwt_payload(token) or {}
                user_uuid: uuid.UUID | None = None
                sub = payload.get("sub")
                if sub:
                    try:
                        user_uuid = uuid.UUID(str(sub))
                    except (ValueError, TypeError):
                        user_uuid = None

                return await _fetch_profile_for_role(
                    db=db,
                    role_name=role_name,
                    user_uuid=user_uuid,
                )

        get_user_result = supabase.auth.get_user(token)
        if inspect.isawaitable(get_user_result):
            user_response = await get_user_result
        else:
            user_response = get_user_result
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
    except HTTPException:
        raise
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


# --- SECURITY CRITICAL ---
# These values MUST be set in your .env file
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a new JWT access token.

    :param subject: The subject of the token (e.g., user ID).
    :param expires_delta: Optional timedelta for token expiry.
    :return: The encoded JWT token string.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
