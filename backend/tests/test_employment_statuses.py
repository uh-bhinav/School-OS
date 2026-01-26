import uuid

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.main import app
from app.models.employment_status import EmploymentStatus
from app.models.profile import Profile

SCHOOL_ID = 1


@pytest.fixture
async def created_employment_status(db_session: AsyncSession) -> EmploymentStatus:
    """Fixture to create an employment status for use in multiple tests."""
    status = EmploymentStatus(
        school_id=SCHOOL_ID,
        status_name=f"Contract-{uuid.uuid4().hex[:6]}",
    )
    db_session.add(status)
    await db_session.commit()
    await db_session.refresh(status)
    return status


@pytest.mark.asyncio
async def test_create_employment_status_as_admin(test_client: AsyncClient, mock_admin_profile: Profile):
    """INTEGRATION TEST: Tests creating a new employment status."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    unique_status_name = f"Probationary-{uuid.uuid4().hex[:6]}"
    create_payload = {
        "school_id": SCHOOL_ID,
        "status_name": unique_status_name,
    }
    create_response = await test_client.post("/api/v1/employment-statuses/", json=create_payload)
    assert create_response.status_code == status.HTTP_201_CREATED
    created_data = create_response.json()
    assert created_data["status_name"] == unique_status_name
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_employment_status_by_id_as_admin(
    test_client: AsyncClient,
    mock_admin_profile: Profile,
    created_employment_status: EmploymentStatus,
):
    """INTEGRATION TEST: Tests retrieving a single employment status by ID."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    get_response = await test_client.get(f"/api/v1/employment-statuses/{created_employment_status.status_id}")
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["status_name"] == created_employment_status.status_name
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_all_statuses_for_school_as_admin(
    test_client: AsyncClient,
    mock_admin_profile: Profile,
    created_employment_status: EmploymentStatus,
):
    """INTEGRATION TEST: Tests retrieving all employment statuses for a school."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    get_all_response = await test_client.get(f"/api/v1/employment-statuses/{SCHOOL_ID}/all")
    assert get_all_response.status_code == status.HTTP_200_OK
    all_statuses = get_all_response.json()
    assert isinstance(all_statuses, list)
    assert any(s["status_id"] == created_employment_status.status_id for s in all_statuses)
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_employment_status_as_admin(
    test_client: AsyncClient,
    mock_admin_profile: Profile,
    created_employment_status: EmploymentStatus,
):
    """INTEGRATION TEST: Tests updating an existing employment status."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    update_payload = {"status_name": f"Confirmed-{uuid.uuid4().hex[:6]}"}
    update_response = await test_client.put(
        f"/api/v1/employment-statuses/{created_employment_status.status_id}",
        json=update_payload,
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["status_name"] == update_payload["status_name"]
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_delete_employment_status_as_admin(
    test_client: AsyncClient,
    mock_admin_profile: Profile,
    created_employment_status: EmploymentStatus,
):
    """INTEGRATION TEST: Tests deleting an employment status."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    delete_response = await test_client.delete(f"/api/v1/employment-statuses/{created_employment_status.status_id}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    # Verify the status is now deleted
    verify_response = await test_client.get(f"/api/v1/employment-statuses/{created_employment_status.status_id}")
    assert verify_response.status_code == status.HTTP_404_NOT_FOUND
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_status_as_non_admin_fails(test_client: AsyncClient, mock_teacher_profile: Profile):
    """SAD PATH: Tests that a non-admin (e.g., a Teacher) cannot create a status."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile
    create_payload = {
        "school_id": SCHOOL_ID,
        "status_name": "Unauthorized Status",
    }
    response = await test_client.post("/api/v1/employment-statuses/", json=create_payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_delete_non_existent_status_fails(test_client: AsyncClient, mock_admin_profile: Profile):
    """SAD PATH: Tests that updating or deleting a non-existent status ID returns a 404."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    non_existent_id = 99999

    # Test UPDATE
    update_response = await test_client.put(f"/api/v1/employment-statuses/{non_existent_id}", json={"status_name": "Wont Work"})
    assert update_response.status_code == status.HTTP_404_NOT_FOUND

    # Test DELETE
    delete_response = await test_client.delete(f"/api/v1/employment-statuses/{non_existent_id}")
    assert delete_response.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.clear()
