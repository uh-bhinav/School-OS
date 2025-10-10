import uuid

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

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
    # CORRECTED ENDPOINT: The path is '/all'
    response = await test_client.get(f"/v1/academic-years/school/{SCHOOL_ID}/all")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    print(data)
    assert isinstance(data, list)
    assert len(data) > 0
    assert "id" in data[0]


@pytest.mark.asyncio
async def test_create_and_get_one_academic_year(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """Tests creating a new academic year with a unique name."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # 2. Generate a unique name for this test run
    unique_name = f"Test Year {uuid.uuid4()}"
    payload = {
        "name": unique_name,
        "start_date": "2025-08-01",
        "end_date": "2026-05-30",
        "school_id": SCHOOL_ID,
    }

    create_response = await test_client.post("/v1/academic-years/", json=payload)
    assert create_response.status_code == status.HTTP_201_CREATED
    created_data = create_response.json()
    new_year_id = created_data["id"]

    get_response = await test_client.get(f"/v1/academic-years/{new_year_id}")
    assert get_response.status_code == status.HTTP_200_OK
    get_data = get_response.json()
    assert get_data["name"] == unique_name


@pytest.mark.asyncio
async def test_update_academic_year(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    payload = {
        "name": f"To Be Updated {uuid.uuid4()}",
        "start_date": "2028-01-01",
        "end_date": "2028-12-31",
        "school_id": SCHOOL_ID,
    }
    create_response = await test_client.post("/v1/academic-years/", json=payload)
    year_id_to_update = create_response.json()["id"]

    update_payload = {"name": "Updated Year Name"}
    update_response = await test_client.put(f"/v1/academic-years/{year_id_to_update}", json=update_payload)

    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["name"] == "Updated Year Name"


@pytest.mark.asyncio
async def test_soft_delete_academic_year(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    payload = {
        "name": f"To Be Deleted {uuid.uuid4()}",
        "start_date": "2029-01-01",
        "end_date": "2029-12-31",
        "school_id": SCHOOL_ID,
    }
    create_response = await test_client.post("/v1/academic-years/", json=payload)
    year_id_to_delete = create_response.json()["id"]

    delete_response = await test_client.delete(f"/v1/academic-years/{year_id_to_delete}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    get_response = await test_client.get(f"/v1/academic-years/{year_id_to_delete}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_set_active_academic_year_deactivates_others(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

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
    year_A_id = (await test_client.post("/v1/academic-years/", json=year_A_payload)).json()["id"]
    year_B_id = (await test_client.post("/v1/academic-years/", json=year_B_payload)).json()["id"]

    await test_client.put(f"/v1/academic-years/{SCHOOL_ID}/set-active/{year_A_id}")

    response_B = await test_client.put(f"/v1/academic-years/{SCHOOL_ID}/set-active/{year_B_id}")
    assert response_B.status_code == status.HTTP_200_OK
    assert response_B.json()["is_active"] is True

    stmt = select(AcademicYear).where(AcademicYear.id == year_A_id)
    result = await db_session.execute(stmt)
    year_A_from_db = result.scalar_one()

    assert year_A_from_db.is_active is False

    """response_A = await test_client.get(f"/v1/academic-years/{year_A_id}")
    assert response_A.status_code == status.HTTP_200_OK
    assert response_A.json()["is_active"] is False"""


@pytest.mark.asyncio
async def test_create_academic_year_as_teacher_fails(test_client: AsyncClient, db_session: AsyncSession):
    """
    Tests that a user without the 'Admin' role cannot create an academic year.
    """
    # 1. Create a mock profile for a 'Teacher', not an 'Admin'
    mock_teacher_profile = Profile(
        user_id="teacher-user-id-12345",
        school_id=SCHOOL_ID,
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=2, role_name="Teacher"))],
    )
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile

    payload = {
        "name": f"Unauthorized Year {uuid.uuid4()}",
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "school_id": SCHOOL_ID,
    }

    # 2. Attempt to create the academic year
    response = await test_client.post("/v1/academic-years/", json=payload)

    # 3. Assert that the request was forbidden
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_update_non_existent_academic_year_fails(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """Tests that updating a non-existent year ID returns a 404 error."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    non_existent_id = 99999
    update_payload = {"name": "This Should Fail"}

    response = await test_client.put(f"/v1/academic-years/{non_existent_id}", json=update_payload)

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_delete_non_existent_academic_year_fails(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """Tests that deleting a non-existent year ID returns a 404 error."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    non_existent_id = 99999

    response = await test_client.delete(f"/v1/academic-years/{non_existent_id}")

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_create_academic_year_with_invalid_dates_fails(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """Tests that creating a year with end_date before start_date fails."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    payload = {
        "name": f"Invalid Date Year {uuid.uuid4()}",
        "start_date": "2025-08-01",
        "end_date": "2025-01-31",  # <-- Invalid: end_date is before start_date
        "school_id": SCHOOL_ID,
    }

    response = await test_client.post("/v1/academic-years/", json=payload)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
