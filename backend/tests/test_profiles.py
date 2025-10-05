import uuid

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.main import app
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.user_roles import UserRole


@pytest.mark.asyncio
async def test_get_my_profile(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """
    Tests that an authenticated user can successfully retrieve their own profile.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    response = await test_client.get("/v1/profiles/me")
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data["user_id"] == str(mock_admin_profile.user_id)
    assert data["first_name"] == mock_admin_profile.first_name
    assert data["school_id"] == mock_admin_profile.school_id
    assert "roles" in data

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_all_profiles_as_admin(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """
    Tests that an Admin can successfully retrieve all profiles for their school.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    school_id = mock_admin_profile.school_id

    response = await test_client.get(f"/v1/profiles/school/{school_id}")

    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "user_id" in data[0]
    assert "first_name" in data[0]
    assert "roles" in data[0]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_all_profiles_as_teacher_fails(
    test_client: AsyncClient, db_session: AsyncSession
):
    """
    Tests that a non-Admin user (e.g., a Teacher) receives a 403 Forbidden error.
    """
    mock_teacher_profile = Profile(
        user_id=uuid.uuid4(),
        school_id=1,
        is_active=True,
        roles=[
            UserRole(role_definition=RoleDefinition(role_id=2, role_name="Teacher"))
        ],
    )
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile

    response = await test_client.get(
        f"/v1/profiles/school/{mock_teacher_profile.school_id}"
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN

    app.dependency_overrides.clear()

    # Add this function to the end of tests/test_profiles.py


@pytest.mark.asyncio
async def test_get_all_profiles_as_admin_filter_by_role(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """
    Tests that an Admin can filter profiles by role.
    """
    # 1. Arrange: Override dependency
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    school_id = mock_admin_profile.school_id

    # 2. Act: Make a request to the endpoint with a role filter
    # We are filtering for the "Admin" role, so we expect at least one result.
    response = await test_client.get(f"/v1/profiles/school/{school_id}?role=Admin")

    # 3. Assert
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    # Verify that all returned profiles actually have the 'Admin' role
    for profile in data:
        role_names = [role["role_definition"]["role_name"] for role in profile["roles"]]
        assert "Admin" in role_names

    # 4. Cleanup
    app.dependency_overrides.clear()
