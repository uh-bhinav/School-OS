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
EXISTING_CLASS_ID = 19
EXISTING_STUDENT_ID = 21
EXISTING_TEACHER_ID = 11
EXISTING_CLASS_ID_WITH_STUDENT = 11


@pytest.mark.asyncio
async def test_timetable_crud_lifecycle_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    INTEGRATION TEST: Tests the full lifecycle for Timetable entries.
    This test is self-sufficient and creates its own dependencies.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # 1. ARRANGE: Create all dependencies first to get guaranteed valid IDs.

    # Create an Academic Year
    year_payload = {
        "name": f"Year {uuid.uuid4()}",
        "start_date": "2025-01-01",
        "end_date": "2025-12-31",
        "school_id": SCHOOL_ID,
    }
    year_resp = await test_client.post("/api/v1/academic-years/", json=year_payload)
    assert year_resp.status_code == 201, "Setup failed: Could not create academic year."
    academic_year_id = year_resp.json()["id"]

    # Create a Class
    class_payload = {
        "grade_level": 1,
        "section": f"{uuid.uuid4().hex[:4]}",
        "class_teacher_id": 11,
        "academic_year_id": academic_year_id,
        "school_id": SCHOOL_ID,
    }
    class_resp = await test_client.post("/api/v1/classes/", json=class_payload)
    assert class_resp.status_code == 201, "Setup failed: Could not create class."
    class_id = class_resp.json()["class_id"]

    # Create a Subject
    subject_payload = {"name": f"Subject {uuid.uuid4()}", "school_id": SCHOOL_ID}
    subject_resp = await test_client.post("/api/v1/subjects/", json=subject_payload)
    assert subject_resp.status_code == 201, "Setup failed: Could not create subject."
    subject_id = subject_resp.json()["subject_id"]

    # Create a Period
    period_payload = {
        "school_id": SCHOOL_ID,
        "period_name": f"Period {uuid.uuid4()}",
        "period_number": 1,
        "start_time": "09:00:00",
        "end_time": "10:00:00",
    }
    period_resp = await test_client.post("/api/v1/periods/", json=period_payload)
    assert period_resp.status_code == 201, "Setup failed: Could not create period."
    period_id = period_resp.json()["id"]

    # Assume teacher with ID 1 exists
    teacher_id = 11

    # 2. ACT & ASSERT: Now test the Timetable lifecycle with guaranteed valid IDs.

    # CREATE
    create_payload = {
        "school_id": SCHOOL_ID,
        "class_id": class_id,
        "subject_id": subject_id,
        "teacher_id": teacher_id,
        "period_id": period_id,
        "day_of_week": 1,
        "academic_year_id": academic_year_id,
    }
    create_response = await test_client.post("/api/v1/timetable/", json=create_payload)
    assert create_response.status_code == status.HTTP_201_CREATED
    entry_id = create_response.json()["id"]

    # UPDATE
    new_teacher_id = 12  # Assume a second teacher with ID 2 exists
    update_payload = {"teacher_id": new_teacher_id}
    update_response = await test_client.put(f"/api/v1/timetable/{entry_id}", json=update_payload)
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["teacher"]["teacher_id"] == new_teacher_id

    # DELETE
    delete_response = await test_client.delete(f"/api/v1/timetable/{entry_id}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.asyncio
async def test_get_timetable_for_class_as_teacher(test_client: AsyncClient, db_session: AsyncSession):
    """HAPPY PATH: Tests that a teacher can successfully fetch a class timetable."""
    # Arrange: A teacher is logged in.
    mock_teacher_profile = Profile(
        user_id="teacher-timetable-test",
        school_id=SCHOOL_ID,
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=2, role_name="Teacher"))],
    )
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile

    # Act: Request the timetable for a known, existing class.
    response = await test_client.get(f"/api/v1/timetable/classes/{EXISTING_CLASS_ID}")

    # Assert
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    # Note: This might be empty if the dummy data has
    # no entries for class 1, which is fine.


@pytest.mark.asyncio
async def test_get_schedule_for_day_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    HAPPY PATH: Tests the agentic function 'get_schedule_for_day' for a class.
    This is a key function from the testing roadmap.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # Arrange: Ensure at least one entry exists for Monday (day_of_week=1) for our class
    payload = {
        "school_id": SCHOOL_ID,
        "class_id": EXISTING_CLASS_ID,
        "subject_id": 1,
        "teacher_id": 11,
        "period_id": 1,
        "day_of_week": 1,
        "academic_year_id": 1,
    }
    await test_client.post("/api/v1/timetable/", json=payload)

    # Act: Ask for the schedule for a specific Monday
    # Assuming the date is a Monday
    monday_date = "2025-10-06"
    response = await test_client.get(f"/api/v1/timetable/schedule-for-day?target_type=class&target_id={EXISTING_CLASS_ID}&schedule_date={monday_date}")

    # Assert
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "subject" in data[0]


@pytest.mark.asyncio
async def test_create_timetable_entry_as_teacher_fails(test_client: AsyncClient, db_session: AsyncSession):
    """SAD PATH: Tests that a non-admin cannot create a timetable entry."""
    mock_teacher_profile = Profile(
        user_id="teacher-fail-create-timetable",
        school_id=SCHOOL_ID,
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=2, role_name="Teacher"))],
    )
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile

    payload = {
        "school_id": SCHOOL_ID,
        "class_id": 1,
        "subject_id": 1,
        "teacher_id": 1,
        "period_id": 1,
        "day_of_week": 1,
        "academic_year_id": 1,
    }
    response = await test_client.post("/api/v1/timetable/", json=payload)

    assert response.status_code == status.HTTP_403_FORBIDDEN


# --- NEW TESTS FOR TEACHER-SPECIFIC ENDPOINT ---


@pytest.mark.asyncio
async def test_get_timetable_for_teacher_as_self(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    HAPPY PATH: Tests that a teacher can successfully fetch a timetable.
    """
    # 1. ARRANGE: As an admin, ensure a timetable entry exists for a specific teacher.
    # We'll use a distinct teacher ID to avoid conflicts.
    TARGET_TEACHER_ID = 11
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    payload = {
        "school_id": SCHOOL_ID,
        "class_id": 11,
        "subject_id": 1,
        "teacher_id": TARGET_TEACHER_ID,
        "period_id": 1,
        "day_of_week": 2,  # Tuesday
        "academic_year_id": 1,
    }
    # This call ensures data exists for our target teacher
    await test_client.post("/api/v1/timetable/", json=payload)

    # 2. ACT: Now, log in as a teacher and try to fetch the timetable.
    # The security only checks FOR the 'Teacher' role, not WHICH teacher.
    mock_teacher_profile = Profile(
        user_id="any-teacher-can-view",
        school_id=SCHOOL_ID,
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=2, role_name="Teacher"))],
    )
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile

    response = await test_client.get(f"/api/v1/timetable/teachers/{TARGET_TEACHER_ID}")

    # 3. ASSERT: The request is successful.
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    # Verify that all entries returned are for the correct teacher
    assert all(entry["teacher"]["teacher_id"] == TARGET_TEACHER_ID for entry in data)


@pytest.mark.asyncio
async def test_get_teacher_timetable_as_student_fails(test_client: AsyncClient, db_session: AsyncSession):
    """SAD PATH (SECURITY): Tests that a Parent cannot access a teacher's timetable."""
    # Arrange: Log in as a student
    mock_student_profile = Profile(
        user_id="student-timetable-test",
        school_id=SCHOOL_ID,
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=4, role_name="Parent"))],
    )
    app.dependency_overrides[get_current_user_profile] = lambda: mock_student_profile

    # Act: Attempt to access a teacher's timetable
    response = await test_client.get("/api/v1/timetable/teachers/11")

    # Assert: The request is forbidden
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_get_teacher_schedule_alias(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """HAPPY PATH: `/teacher/{id}/schedule` returns data and supports optional date filtering."""
    target_teacher_id = 11
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    payload = {
        "school_id": SCHOOL_ID,
        "class_id": 11,
        "subject_id": 1,
        "teacher_id": target_teacher_id,
        "period_id": 1,
        "day_of_week": 1,
        "academic_year_id": 1,
    }
    await test_client.post("/api/v1/timetable/", json=payload)

    mock_teacher_profile = Profile(
        user_id="teacher-schedule-alias",
        school_id=SCHOOL_ID,
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=2, role_name="Teacher"))],
    )
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile

    response = await test_client.get(f"/api/v1/timetable/teacher/{target_teacher_id}/schedule")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list) and len(data) >= 1

    filtered_response = await test_client.get(f"/api/v1/timetable/teacher/{target_teacher_id}/schedule?schedule_date=2025-10-06")
    assert filtered_response.status_code == status.HTTP_200_OK
    filtered = filtered_response.json()
    assert len(filtered) >= 1
    assert all(entry["day_of_week"] == 1 for entry in filtered)


# --- NEW TESTS FOR get_schedule_for_day and NOT FOUND ---


@pytest.mark.parametrize(
    "target_type, target_id_key",
    [
        ("class", "class_id"),
        ("teacher", "teacher_id"),
        ("student", "student_id"),
    ],
)
@pytest.mark.asyncio
async def test_get_schedule_for_day_all_targets(
    test_client: AsyncClient,
    db_session: AsyncSession,
    mock_admin_profile: Profile,
    target_type: str,
    target_id_key: str,
):
    """
    HAPPY PATH (Comprehensive): Tests get_schedule_for_day for all target types.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # 1. ARRANGE: Create only the necessary data for this specific test
    year_payload = {
        "name": f"Year {uuid.uuid4()}",
        "start_date": "2025-01-01",
        "end_date": "2025-12-31",
        "school_id": SCHOOL_ID,
    }
    academic_year_id = (await test_client.post("/api/v1/academic-years/", json=year_payload)).json()["id"]

    # Create a new timetable entry for a PRE-EXISTING class that has our student.
    entry_payload = {
        "school_id": SCHOOL_ID,
        "class_id": EXISTING_CLASS_ID_WITH_STUDENT,  # Use the class our student is in
        "subject_id": 1,
        "teacher_id": EXISTING_TEACHER_ID,
        "period_id": 1,
        "day_of_week": 1,  # Monday
        "academic_year_id": academic_year_id,
    }
    await test_client.post("/api/v1/timetable/", json=entry_payload)

    # Map the parameter names to the correct, known IDs
    id_map = {
        "class_id": EXISTING_CLASS_ID_WITH_STUDENT,
        "teacher_id": EXISTING_TEACHER_ID,
        "student_id": EXISTING_STUDENT_ID,
    }
    target_id = id_map[target_id_key]

    # 2. ACT
    monday_date = "2025-10-06"  # This must be a Monday
    response = await test_client.get(f"/api/v1/timetable/schedule-for-day?target_type={target_type}&target_id={target_id}&schedule_date={monday_date}")

    # 3. ASSERT
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert data[0]["day_of_week"] == 1


@pytest.mark.asyncio
async def test_update_or_delete_non_existent_entry_fails(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """SAD PATH: Tests that updating or deleting a non-existent entry returns a 404."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    non_existent_id = 99999

    # Test UPDATE
    update_payload = {"teacher_id": 11}
    update_response = await test_client.put(f"/api/v1/timetable/{non_existent_id}", json=update_payload)
    assert update_response.status_code == status.HTTP_404_NOT_FOUND

    # Test DELETE
    delete_response = await test_client.delete(f"/api/v1/timetable/{non_existent_id}")
    assert delete_response.status_code == status.HTTP_404_NOT_FOUND
