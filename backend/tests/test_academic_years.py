import uuid

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.core.security import get_current_user_profile
from app.main import app
from app.models.academic_year import AcademicYear
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.user_roles import UserRole

SCHOOL_ID = 1


@pytest.mark.asyncio
async def test_get_all_academic_years(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """Tests retrieving all academic years for the school."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    app.dependency_overrides[get_db_session] = lambda: db_session

    # CORRECTED ENDPOINT: The path is '/all'
    response = await test_client.get(f"/api/v1/academic-years/school/{SCHOOL_ID}/all")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    print(data)
    assert isinstance(data, list)
    assert len(data) > 0
    assert "id" in data[0]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_and_get_one_academic_year(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """Tests creating a new academic year with a unique name."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    app.dependency_overrides[get_db_session] = lambda: db_session

    # Generate a unique name for this test run
    unique_name = f"Test Year {uuid.uuid4()}"
    payload = {
        "name": unique_name,
        "start_date": "2025-08-01",
        "end_date": "2026-05-30",
        "school_id": SCHOOL_ID,
    }

    create_response = await test_client.post("/api/v1/academic-years/", json=payload)
    assert create_response.status_code == status.HTTP_201_CREATED
    created_data = create_response.json()
    new_year_id = created_data["id"]

    get_response = await test_client.get(f"/api/v1/academic-years/{new_year_id}")
    assert get_response.status_code == status.HTTP_200_OK
    get_data = get_response.json()
    assert get_data["name"] == unique_name

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_academic_year(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    app.dependency_overrides[get_db_session] = lambda: db_session

    # Create with unique name
    original_name = f"To Be Updated {uuid.uuid4()}"
    payload = {
        "name": original_name,
        "start_date": "2028-01-01",
        "end_date": "2028-12-31",
        "school_id": SCHOOL_ID,
    }
    create_response = await test_client.post("/api/v1/academic-years/", json=payload)
    assert create_response.status_code == status.HTTP_201_CREATED
    year_id_to_update = create_response.json()["id"]

    # Update with ANOTHER unique name to avoid constraint violations
    updated_name = f"Updated Year Name {uuid.uuid4()}"
    update_payload = {"name": updated_name}
    update_response = await test_client.put(f"/api/v1/academic-years/{year_id_to_update}", json=update_payload)

    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["name"] == updated_name

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_soft_delete_academic_year(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    app.dependency_overrides[get_db_session] = lambda: db_session

    payload = {
        "name": f"To Be Deleted {uuid.uuid4()}",
        "start_date": "2029-01-01",
        "end_date": "2029-12-31",
        "school_id": SCHOOL_ID,
    }
    create_response = await test_client.post("/api/v1/academic-years/", json=payload)
    assert create_response.status_code == status.HTTP_201_CREATED
    year_id_to_delete = create_response.json()["id"]

    delete_response = await test_client.delete(f"/api/v1/academic-years/{year_id_to_delete}")
    assert delete_response.status_code == status.HTTP_200_OK

    # After soft delete, the record should not be found (because it's inactive)
    get_response = await test_client.get(f"/api/v1/academic-years/{year_id_to_delete}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_set_active_academic_year_deactivates_others(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    app.dependency_overrides[get_db_session] = lambda: db_session

    year_A_payload = {
        "name": f"Year A {uuid.uuid4()}",
        "start_date": "2030-01-01",
        "end_date": "2030-12-31",
        "school_id": SCHOOL_ID,
    }
    year_B_payload = {
        "name": f"Year B {uuid.uuid4()}",
        "start_date": "2031-01-01",
        "end_date": "2031-12-31",
        "school_id": SCHOOL_ID,
    }
    year_A_response = await test_client.post("/api/v1/academic-years/", json=year_A_payload)
    assert year_A_response.status_code == status.HTTP_201_CREATED
    year_A_id = year_A_response.json()["id"]

    year_B_response = await test_client.post("/api/v1/academic-years/", json=year_B_payload)
    assert year_B_response.status_code == status.HTTP_201_CREATED
    year_B_id = year_B_response.json()["id"]

    # Set Year A as active
    set_active_A_response = await test_client.put(f"/api/v1/academic-years/{SCHOOL_ID}/set-active/{year_A_id}")
    assert set_active_A_response.status_code == status.HTTP_200_OK

    # Set Year B as active (should deactivate Year A)
    response_B = await test_client.put(f"/api/v1/academic-years/{SCHOOL_ID}/set-active/{year_B_id}")
    assert response_B.status_code == status.HTTP_200_OK
    assert response_B.json()["is_active"] is True

    # Verify Year A is now inactive in the database
    stmt = select(AcademicYear).where(AcademicYear.id == year_A_id)
    result = await db_session.execute(stmt)
    year_A_from_db = result.scalar_one()

    assert year_A_from_db.is_active is False

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_academic_year_as_teacher_fails(test_client: AsyncClient, db_session: AsyncSession):
    """
    Tests that a user without the 'Admin' role cannot create an academic year.
    """
    # Create a mock profile for a 'Teacher', not an 'Admin'
    mock_teacher_profile = Profile(
        user_id="teacher-user-id-12345",
        school_id=SCHOOL_ID,
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=2, role_name="Teacher"))],
    )
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile
    app.dependency_overrides[get_db_session] = lambda: db_session

    payload = {
        "name": f"Unauthorized Year {uuid.uuid4()}",
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "school_id": SCHOOL_ID,
    }

    # Attempt to create the academic year
    response = await test_client.post("/api/v1/academic-years/", json=payload)

    # Assert that the request was forbidden
    assert response.status_code == status.HTTP_403_FORBIDDEN

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_non_existent_academic_year_fails(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """Tests that updating a non-existent year ID returns a 404 error."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    app.dependency_overrides[get_db_session] = lambda: db_session

    non_existent_id = 99999
    update_payload = {"name": "This Should Fail"}

    response = await test_client.put(f"/api/v1/academic-years/{non_existent_id}", json=update_payload)

    assert response.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_delete_non_existent_academic_year_fails(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """Tests that deleting a non-existent year ID returns a 404 error."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    app.dependency_overrides[get_db_session] = lambda: db_session

    non_existent_id = 99999

    response = await test_client.delete(f"/api/v1/academic-years/{non_existent_id}")

    assert response.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_academic_year_with_invalid_dates_fails(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """Tests that creating a year with end_date before start_date fails."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    app.dependency_overrides[get_db_session] = lambda: db_session

    payload = {
        "name": f"Invalid Date Year {uuid.uuid4()}",
        "start_date": "2025-08-01",
        "end_date": "2025-01-31",  # <-- Invalid: end_date is before start_date
        "school_id": SCHOOL_ID,
    }

    response = await test_client.post("/api/v1/academic-years/", json=payload)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    app.dependency_overrides.clear()
