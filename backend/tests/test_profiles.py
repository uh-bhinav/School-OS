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
    Happy Path: Tests that an authenticated user can retrieve their own profile.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    response = await test_client.get("/v1/profiles/me")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["user_id"] == str(mock_admin_profile.user_id)
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_all_profiles_as_admin(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """
    Happy Path: Tests that an Admin can retrieve all profiles for their school.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    school_id = mock_admin_profile.school_id
    response = await test_client.get(f"/v1/profiles/school/{school_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_all_profiles_as_teacher_fails(
    test_client: AsyncClient, db_session: AsyncSession
):
    """
    Sad Path: Tests that a non-Admin user receives a 403 Forbidden error.
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


@pytest.mark.asyncio
async def test_get_all_profiles_as_admin_filter_by_role(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """
    Happy Path: Tests that an Admin can filter profiles by role.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    school_id = mock_admin_profile.school_id
    response = await test_client.get(f"/v1/profiles/school/{school_id}?role=Admin")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    for profile in data:
        role_names = [role["role_definition"]["role_name"] for role in profile["roles"]]
        assert "Admin" in role_names
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_specific_profile_as_admin(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """
    Happy Path: Tests an admin can fetch a specific user profile by its UUID.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    # In a real test, you might fetch another user's ID. Here, we fetch our own.
    user_id_to_fetch = mock_admin_profile.user_id
    response = await test_client.get(f"/v1/profiles/{user_id_to_fetch}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["user_id"] == str(user_id_to_fetch)
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_nonexistent_profile_fails(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """
    Sad Path: Tests that fetching a non-existent profile UUID returns a 404 error.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    non_existent_uuid = uuid.uuid4()
    response = await test_client.get(f"/v1/profiles/{non_existent_uuid}")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_delete_profile_as_admin(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """
    Happy Path & Sad Path: Tests an admin can soft-delete a user in their school,
    and that deleting a non-existent user fails correctly.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # --- Happy Path: Delete an existing user ---
    # In a real-world test, we would create a new user here to delete.
    # For this test, we'll use the mock admin's ID, assuming they exist.
    user_id_to_delete = mock_admin_profile.user_id
    delete_response = await test_client.delete(f"/v1/profiles/{user_id_to_delete}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    # --- Sad Path: Try to delete a user that doesn't exist ---
    non_existent_uuid = uuid.uuid4()
    delete_fail_response = await test_client.delete(f"/v1/profiles/{non_existent_uuid}")
    assert delete_fail_response.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.clear()
