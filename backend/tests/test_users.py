# backend/tests/test_users.py
import uuid
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException, status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.main import app
from app.models.profile import Profile
from app.models.user_roles import UserRole

# --- Test Data ---
VALID_INVITE_PAYLOAD = {
    "email": f"new.teacher.{uuid.uuid4()}@schoolos.com",
    "school_id": 1,
    "first_name": "Sanjay",
    "last_name": "Gupta",
    "role_name": "Teacher",
    "phone_number": "9876543210",
}


# --- Integration Tests for User Invitation (/v1/users/invite) ---


@pytest.mark.asyncio
async def test_invite_new_user_as_admin_success(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Happy Path: Tests that an admin can successfully invite a new user and
    assign them a role.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # We mock the external invite function to return the ID of an EXISTING user.
    with patch(
        "app.api.v1.endpoints.users.invite_user",
        new_callable=AsyncMock,
        return_value={
            "id": str(mock_admin_profile.user_id),
            "email": VALID_INVITE_PAYLOAD["email"],
            "status": "invited",
        },
    ) as _mock_invite_user:
        response = await test_client.post("/v1/users/invite", json=VALID_INVITE_PAYLOAD)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["role"] == "Teacher"

        # FIX: Verify the new role using the correct composite key order: (user_id, role_id)
        # Assuming Role ID for "Teacher" is 2.
        user_role = await db_session.get(UserRole, (mock_admin_profile.user_id, 2))
        assert user_role is not None


@pytest.mark.asyncio
async def test_invite_user_as_non_admin_fails(test_client: AsyncClient, mock_teacher_profile: Profile):
    """
    Sad Path (Permissions): Tests that a non-admin user cannot invite new users.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile

    response = await test_client.post("/v1/users/invite", json=VALID_INVITE_PAYLOAD)

    assert response.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.clear()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "field_to_remove, expected_detail",
    [
        ("email", "Field required"),
        ("first_name", "Field required"),
        ("school_id", "Field required"),
        ("role_name", "Field required"),
    ],
)
async def test_invite_user_with_missing_fields_fails(
    test_client: AsyncClient,
    mock_admin_profile: Profile,
    field_to_remove: str,
    expected_detail: str,
):
    """
    Sad Path (Validation): Tests for missing required fields.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    invalid_payload = VALID_INVITE_PAYLOAD.copy()
    del invalid_payload[field_to_remove]

    response = await test_client.post("/v1/users/invite", json=invalid_payload)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert expected_detail in response.text
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_invite_user_with_invalid_email_fails(test_client: AsyncClient, mock_admin_profile: Profile):
    """
    Sad Path (Validation): Tests that an invalid email format is rejected.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    invalid_payload = VALID_INVITE_PAYLOAD.copy()
    invalid_payload["email"] = "not-a-valid-email"

    response = await test_client.post("/v1/users/invite", json=invalid_payload)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert "value is not a valid email address" in response.text
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_invite_user_supabase_api_error(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Sad Path (External Service Failure): Tests API response when Supabase fails.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    with patch(
        "app.api.v1.endpoints.users.invite_user",
        new_callable=AsyncMock,
        side_effect=HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supabase invite failed: User already exists",
        ),
    ) as mock_supabase_invite:
        response = await test_client.post("/v1/users/invite", json=VALID_INVITE_PAYLOAD)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "User already exists" in response.text
        mock_supabase_invite.assert_awaited_once()

    app.dependency_overrides.clear()
