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

# Assume the mock admin belongs to School #1
SCHOOL_ID = 1
# Assume a teacher with ID 1 and an academic year with ID 1 exist in your dummy data
EXISTING_TEACHER_ID = 11
EXISTING_ACADEMIC_YEAR_ID = 2


@pytest.mark.asyncio
async def test_create_class_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """Tests creating a new class with a valid section length."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # FIX 1: Generate a short section name that fits in varchar(10)
    unique_section = str(uuid.uuid4())[:8]
    payload = {
        "grade_level": 5,
        "section": unique_section,
        "class_teacher_id": EXISTING_TEACHER_ID,
        "academic_year_id": EXISTING_ACADEMIC_YEAR_ID,
        "school_id": SCHOOL_ID,
    }

    response = await test_client.post("/api/v1/classes/", json=payload)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["grade_level"] == 5
    assert data["section"] == unique_section
    assert "class_id" in data


@pytest.mark.asyncio
async def test_search_for_class_by_grade_level(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """Tests searching for a class using the correct URL structure."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    test_grade = 99
    payload = {
        "grade_level": test_grade,
        "section": str(uuid.uuid4())[:8],
        "class_teacher_id": EXISTING_TEACHER_ID,
        "academic_year_id": EXISTING_ACADEMIC_YEAR_ID,
        "school_id": SCHOOL_ID,
    }
    await test_client.post("/api/v1/classes/", json=payload)

    # FIX 2: Use the correct search URL, including the school_id in the path
    response = await test_client.get(f"/api/v1/classes/search/{SCHOOL_ID}?grade_level={test_grade}")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(c["grade_level"] == test_grade for c in data)


@pytest.mark.asyncio
async def test_update_class_details(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """Tests updating a class's details, for example, changing the teacher."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # 1. First, create a class to update
    payload = {
        "grade_level": 8,
        "section": str(uuid.uuid4())[:8],
        "class_teacher_id": EXISTING_TEACHER_ID,
        "academic_year_id": EXISTING_ACADEMIC_YEAR_ID,
        "school_id": SCHOOL_ID,
    }
    create_response = await test_client.post("/api/v1/classes/", json=payload)
    class_id_to_update = create_response.json()["class_id"]

    # 2. Now, update its teacher. Assume teacher #2 exists in dummy data.
    NEW_TEACHER_ID = 12
    update_payload = {"class_teacher_id": NEW_TEACHER_ID}
    response = await test_client.put(f"/api/v1/classes/{class_id_to_update}", json=update_payload)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["class_teacher_id"] == NEW_TEACHER_ID


@pytest.mark.asyncio
async def test_assign_subjects_to_class(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """Tests the special function to assign a list of subjects to a class."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # 1. Create a class that will receive the subjects
    payload = {
        "grade_level": 7,
        "section": str(uuid.uuid4())[:8],
        "class_teacher_id": EXISTING_TEACHER_ID,
        "academic_year_id": EXISTING_ACADEMIC_YEAR_ID,
        "school_id": SCHOOL_ID,
    }
    create_response = await test_client.post("/api/v1/classes/", json=payload)
    class_id_to_update = create_response.json()["class_id"]

    # 2. Define the subjects to assign.
    # IMPORTANT: These subject IDs (e.g., 1, 2, 3) must exist in your test database.
    subject_ids_to_assign = [1, 2, 3]
    assign_payload = {"subject_ids": subject_ids_to_assign}

    # 3. Call the special endpoint to assign them
    response = await test_client.post(f"/api/v1/classes/{class_id_to_update}/subjects", json=assign_payload)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    # 4. Verify that the returned class object now contains the assigned subjects
    assert "subjects" in data
    assigned_subject_ids = {subject["subject_id"] for subject in data["subjects"]}
    assert assigned_subject_ids == set(subject_ids_to_assign)


# --- NEW SAD PATH TESTS ---


@pytest.mark.asyncio
async def test_create_class_as_teacher_fails(test_client: AsyncClient, db_session: AsyncSession):
    """SAD PATH: Tests that a user without the 'Admin' role cannot create a class."""
    # Create a mock profile for a 'Teacher'
    mock_teacher_profile = Profile(
        user_id="teacher-user-id-classes",
        school_id=SCHOOL_ID,
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=2, role_name="Teacher"))],
    )
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile

    payload = {
        "grade_level": 1,
        "section": "Unauthorized",
        "class_teacher_id": EXISTING_TEACHER_ID,
        "academic_year_id": EXISTING_ACADEMIC_YEAR_ID,
        "school_id": SCHOOL_ID,
    }

    response = await test_client.post("/api/v1/classes/", json=payload)

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_update_non_existent_class_fails(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """SAD PATH: Tests that updating a non-existent class ID returns a 404."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    non_existent_id = 99999
    update_payload = {"section": "This Should Fail"}

    response = await test_client.put(f"/api/v1/classes/{non_existent_id}", json=update_payload)

    assert response.status_code == status.HTTP_404_NOT_FOUND
