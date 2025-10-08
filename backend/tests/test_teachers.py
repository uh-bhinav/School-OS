import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    _get_current_user_profile_from_db,
    get_current_user_profile,
)
from app.main import app
from app.models.profile import Profile
from app.models.teacher import Teacher

# Mock data for creating and updating a teacher
mock_teacher_data = {
    "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "department": "Science",
    "subject_specialization": "Physics",
    "hire_date": "2023-01-15",
    "employment_status_id": 1,
    "years_of_experience": 5,
    "is_certified": True,
    "bio": "A passionate physics teacher.",
    "qualifications": [{"degree": "M.Sc. Physics", "institution": "University of Science"}],
    "is_active": True,
}


@pytest.mark.asyncio
async def test_get_all_teachers_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Happy Path: Tests that an Admin can retrieve all teachers for their school.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    school_id = mock_admin_profile.school_id
    response = await test_client.get(f"/v1/teachers/school/{school_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    # Assuming there's at least one teacher in the test DB for school 1
    assert len(data) > 0
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_all_teachers_as_teacher_fails(test_client: AsyncClient, mock_teacher_profile: Profile):
    """
    Sad Path: Tests that a non-Admin user (e.g., a Teacher) receives a 403 Forbidden error.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile
    school_id = mock_teacher_profile.school_id
    response = await test_client.get(f"/v1/teachers/school/{school_id}")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_teacher_by_id_as_admin(test_client, db_session, mock_admin_profile):
    app.dependency_overrides[_get_current_user_profile_from_db] = lambda: mock_admin_profile

    new_teacher = Teacher(
        teacher_id=1,
        user_id=mock_admin_profile.user_id,
        department="Science",
        subject_specialization="Physics",
        is_certified=True,
        years_of_experience=5,
        is_active=True,
    )
    db_session.add(new_teacher)
    await db_session.commit()
    await db_session.refresh(new_teacher)

    response = await test_client.get(f"/v1/teachers/{new_teacher.teacher_id}")

    print(response.status_code, response.text)  # sanity check
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_nonexistent_teacher_fails(test_client: AsyncClient, mock_admin_profile: Profile):
    """
    Sad Path: Tests that fetching a non-existent teacher ID returns a 404 error.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    non_existent_id = 99999
    response = await test_client.get(f"/v1/teachers/{non_existent_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_teacher_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    app.dependency_overrides[_get_current_user_profile_from_db] = lambda: mock_admin_profile

    new_teacher = Teacher(
        teacher_id=1,
        user_id=mock_admin_profile.user_id,
        department="Science",
        subject_specialization="Physics",
        is_certified=True,
        years_of_experience=3,
        is_active=True,
    )
    db_session.add(new_teacher)
    await db_session.commit()
    await db_session.refresh(new_teacher)

    update_data = {
        "department": "Updated Department",
        "subject_specialization": "Chemistry",
        "qualifications": [{"degree": "Ph.D. Chemistry", "institution": "Global Chem University"}],
    }

    response = await test_client.put(f"/v1/teachers/{new_teacher.teacher_id}", json=update_data)
    print(response.status_code, response.text)

    assert response.status_code == 200
    data = response.json()
    assert data["department"] == "Updated Department"
    assert data["subject_specialization"] == "Chemistry"


@pytest.mark.asyncio
async def test_update_nonexistent_teacher_fails(test_client: AsyncClient, mock_admin_profile: Profile):
    """
    Sad Path: Tests that updating a non-existent teacher returns a 404 error.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    non_existent_id = 99999
    update_data = {"department": "Ghost Department"}
    response = await test_client.put(f"/v1/teachers/{non_existent_id}", json=update_data)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    app.dependency_overrides.clear()


async def test_get_teacher_qualifications(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # ✅ Create a mock teacher before requesting
    new_teacher = Teacher(
        teacher_id=1,
        user_id=mock_admin_profile.user_id,
        department="Science",
        subject_specialization="Physics",
        is_certified=True,
        years_of_experience=5,
        qualifications=[{"degree": "M.Sc. Physics", "institution": "University of Science"}],
        is_active=True,
    )
    db_session.add(new_teacher)
    await db_session.commit()
    await db_session.refresh(new_teacher)

    # ✅ Now call the endpoint
    response = await test_client.get(f"/v1/teachers/{new_teacher.teacher_id}/qualifications")

    assert response.status_code == 200
    data = response.json()
    assert "years_of_experience" in data
    assert "qualifications" in data
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_deactivate_teacher_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Happy Path: Tests an admin can soft-delete a teacher.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # ✅ Create a teacher first
    new_teacher = Teacher(
        teacher_id=1,
        user_id=mock_admin_profile.user_id,
        department="Math",
        subject_specialization="Algebra",
        is_certified=True,
        years_of_experience=4,
        is_active=True,
    )
    db_session.add(new_teacher)
    await db_session.commit()
    await db_session.refresh(new_teacher)

    # ✅ Now deactivate it
    response = await test_client.delete(f"/v1/teachers/{new_teacher.teacher_id}")
    assert response.status_code == status.HTTP_200_OK

    # ✅ Verify the teacher is now inactive
    get_response = await test_client.get(f"/v1/teachers/{new_teacher.teacher_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND  # teacher is soft-deleted

    app.dependency_overrides.clear()
