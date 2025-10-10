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

SCHOOL_ID = 1


@pytest.mark.asyncio
async def test_period_crud_lifecycle_as_admin(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """
    INTEGRATION TEST: Tests the full Create, Read, Update, and
    Delete lifecycle for Periods.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    unique_name = f"1st Period {uuid.uuid4().hex[:6]}"

    # 1. CREATE
    create_payload = {
        "school_id": SCHOOL_ID,
        "period_name": unique_name,  # CORRECTED field name
        "period_number": 1,
        "start_time": "09:00:00",
        "end_time": "09:45:00",
        "is_recess": False,
    }
    create_response = await test_client.post("/v1/periods/", json=create_payload)
    assert create_response.status_code == status.HTTP_201_CREATED
    created_data = create_response.json()
    assert created_data["period_name"] == unique_name  # CORRECTED assertion
    period_id = created_data["id"]

    # 2. READ (Get One)
    get_response = await test_client.get(f"/v1/periods/{period_id}")
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["period_name"] == unique_name

    # 3. UPDATE
    update_payload = {"end_time": "09:50:00"}
    update_response = await test_client.put(
        f"/v1/periods/{period_id}", json=update_payload
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["end_time"] == "09:50:00"

    # 4. DELETE
    delete_response = await test_client.delete(f"/v1/periods/{period_id}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    # 5. VERIFY DELETE (by trying to get it again)
    verify_response = await test_client.get(f"/v1/periods/{period_id}")
    assert verify_response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_create_period_as_teacher_fails(
    test_client: AsyncClient, db_session: AsyncSession
):
    """SAD PATH: Tests that a non-admin cannot create a period."""
    mock_teacher_profile = Profile(
        user_id="teacher-user-id-periods",
        school_id=SCHOOL_ID,
        is_active=True,
        roles=[
            UserRole(role_definition=RoleDefinition(role_id=2, role_name="Teacher"))
        ],
    )
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile

    payload = {
        "school_id": SCHOOL_ID,
        "period_name": "Unauthorized Period",
        "period_number": 99,
        "start_time": "10:00:00",
        "end_time": "10:45:00",
        "is_recess": False,
    }

    response = await test_client.post("/v1/periods/", json=payload)

    assert response.status_code == status.HTTP_403_FORBIDDEN


# --- NEW SAD PATH TESTS ---


@pytest.mark.asyncio
async def test_update_non_existent_period_fails(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """SAD PATH: Tests that updating a non-existent period ID returns a 404."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    non_existent_id = 99999
    update_payload = {"period_name": "This Should Fail"}

    response = await test_client.put(
        f"/v1/periods/{non_existent_id}", json=update_payload
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_delete_non_existent_period_fails(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """SAD PATH: Tests that deleting a non-existent period ID returns a 404."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    non_existent_id = 99999

    response = await test_client.delete(f"/v1/periods/{non_existent_id}")

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_create_period_with_invalid_times_fails(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """SAD PATH: Tests that creating a period with end_time before start_time fails."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    payload = {
        "school_id": SCHOOL_ID,
        "period_name": "Invalid Time Period",
        "period_number": 50,
        "start_time": "11:00:00",
        "end_time": "10:00:00",  # <-- Invalid: end_time is before start_time
        "is_recess": False,
    }

    response = await test_client.post("/v1/periods/", json=payload)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.asyncio
async def test_get_all_periods_as_admin(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """HAPPY PATH: Tests retrieving a list of all periods for a school."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # First, create a unique period to ensure there's at least one to find
    payload = {
        "school_id": SCHOOL_ID,
        "period_name": f"List Test Period {uuid.uuid4().hex[:6]}",
        "period_number": 100,
        "start_time": "08:00:00",
        "end_time": "08:45:00",
    }
    await test_client.post("/v1/periods/", json=payload)

    # Now, call the 'get all' endpoint
    response = await test_client.get(f"/v1/periods/school/{SCHOOL_ID}/all")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1  # Should find at least the one we just created
    assert "period_name" in data[0]


@pytest.mark.asyncio
async def test_get_periods_for_class_as_teacher(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """HAPPY PATH: Tests a teacher can fetch the period structure for a class."""
    # 1. ARRANGE: As an ADMIN, create the necessary class data.
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    class_payload = {
        "grade_level": 1,
        "section": f"Class-{uuid.uuid4().hex[:4]}",
        "class_teacher_id": 11,
        "academic_year_id": 1,
        "school_id": SCHOOL_ID,
    }
    create_class_resp = await test_client.post("/v1/classes/", json=class_payload)
    assert (
        create_class_resp.status_code == status.HTTP_201_CREATED
    ), "Setup failed: Could not create class as Admin."
    class_id = create_class_resp.json()["class_id"]

    # 2. ACT: As a TEACHER, perform the action we want to test.
    mock_teacher_profile = Profile(
        user_id="teacher-for-class-periods",
        school_id=SCHOOL_ID,
        is_active=True,
        roles=[
            UserRole(role_definition=RoleDefinition(role_id=2, role_name="Teacher"))
        ],
    )
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile
    response = await test_client.get(f"/v1/periods/class/{class_id}/periods")

    # 3. ASSERT: The teacher's action was successful.
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_get_recess_periods_as_admin(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """HAPPY PATH: Tests fetching only the periods marked as recess."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # Arrange: Ensure at least one recess period exists
    recess_payload = {
        "school_id": SCHOOL_ID,
        "period_name": f"Lunch-{uuid.uuid4().hex[:4]}",
        "period_number": 99,
        "start_time": "12:00:00",
        "end_time": "13:00:00",
        "is_recess": True,  # This is the key flag
    }
    await test_client.post("/v1/periods/", json=recess_payload)

    # Act: Call the new endpoint
    response = await test_client.get(f"/v1/periods/school/{SCHOOL_ID}/recess")

    # Assert
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Crucially, verify that ALL periods returned are actually recess periods
    assert all(p["is_recess"] is True for p in data)


UNAUTHORIZED_SCHOOL_ID = 99

# --- NEW SAD PATH TESTS FOR AGENTIC ENDPOINTS ---


@pytest.mark.asyncio
async def test_get_periods_for_non_existent_class(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """SAD PATH: Tests that requesting periods for a non-existent
    class returns an empty list."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    non_existent_class_id = 99999
    response = await test_client.get(
        f"/v1/periods/class/{non_existent_class_id}/periods"
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND


# The service correctly returns an empty list


@pytest.mark.asyncio
async def test_get_recess_for_unauthorized_school_fails(
    test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
):
    """SAD PATH (SECURITY): Tests a user cannot get
    recess periods for another school."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # The admin from school 1 tries to access recess periods for school 99
    response = await test_client.get(
        f"/v1/periods/school/{UNAUTHORIZED_SCHOOL_ID}/recess"
    )

    # The request should be forbidden due to the security check we added
    assert response.status_code == status.HTTP_403_FORBIDDEN
