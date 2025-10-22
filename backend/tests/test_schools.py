# backend/tests/test_schools.py
import pytest
from fastapi import status
from httpx import AsyncClient
from pydantic import HttpUrl
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.main import app  # Keep this import for dependency override
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.user_roles import UserRole

VALID_SCHOOL_ID = 1
UNAUTHORIZED_SCHOOL_ID = 99

mock_admin_profile = Profile(
    user_id="cb0cf1e2-19d0-4ae3-93ed-3073a47a5058",
    school_id=VALID_SCHOOL_ID,
    first_name="Priya",
    last_name="Singh",
    is_active=True,
    roles=[UserRole(role_definition=RoleDefinition(role_id=1, role_name="Admin"))],
)


@pytest.mark.asyncio
async def test_get_school_details_as_admin(test_client: AsyncClient, db_session: AsyncSession):
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    response = await test_client.get(f"/api/v1/schools/{VALID_SCHOOL_ID}")
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["school_id"] == VALID_SCHOOL_ID
    assert "name" in data

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_school_details_as_admin(test_client: AsyncClient, db_session: AsyncSession):
    """Tests updating a school's details, as per the roadmap."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    update_payload = {
        "phone_number": "+91 9999988888",
        "website": "https://www.new-tapasyavp.edu.in",
    }
    response = await test_client.put(f"/api/v1/schools/{VALID_SCHOOL_ID}", json=update_payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    expected_website = str(HttpUrl(update_payload["website"]))
    assert data["website"] == expected_website
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_school_details_for_unauthorized_school_fails(test_client: AsyncClient, db_session: AsyncSession):
    """Tests security rule: An admin from one school cannot access another's details."""
    # This admin belongs to school 99
    mock_other_school_admin = Profile(
        user_id="a1a1a1a1-19d0-4ae3-93ed-3073a47a5058",
        school_id=UNAUTHORIZED_SCHOOL_ID,
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=1, role_name="Admin"))],
    )
    app.dependency_overrides[get_current_user_profile] = lambda: mock_other_school_admin
    # They try to access school 1, which should be forbidden
    response = await test_client.get(f"/api/v1/schools/{VALID_SCHOOL_ID}")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_soft_delete_school_as_admin(test_client: AsyncClient, db_session: AsyncSession):
    """Tests soft-deleting a school, as per the roadmap."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    # Delete the school
    delete_response = await test_client.delete(f"/api/v1/schools/{VALID_SCHOOL_ID}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    # Verify the school is gone by trying to get it again
    get_response = await test_client.get(f"/api/v1/schools/{VALID_SCHOOL_ID}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND
    app.dependency_overrides.clear()
