import uuid

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.main import app
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.student_contact import StudentContact
from app.models.user_roles import UserRole

# Define constants for clarity
SCHOOL_ID = 1
EXISTING_STUDENT_ID = 21
# Use an actual user ID from your Supabase auth.users table
PARENT_USER_ID = uuid.UUID("aebd8219-5fd4-4ede-86c0-344c0e6cd257")


@pytest.fixture(scope="session")
def mock_parent_profile() -> Profile:
    """Provides a reusable mock parent profile for tests."""
    return Profile(
        user_id=PARENT_USER_ID,
        school_id=SCHOOL_ID,
        first_name="Parent",
        last_name="Test",
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=4, role_name="Parent"))],
    )


@pytest.fixture
async def created_student_contact(db_session: AsyncSession, mock_parent_profile: Profile) -> StudentContact:
    """Fixture to create a student contact for use in multiple tests."""
    contact = StudentContact(
        student_id=EXISTING_STUDENT_ID,
        profile_user_id=mock_parent_profile.user_id,
        name=f"Guardian {uuid.uuid4().hex[:6]}",
        phone="1234567890",
        email="guardian.fixture@example.com",
        relationship_type="Guardian",
        is_emergency_contact=True,
        is_active=True,
    )
    db_session.add(contact)
    await db_session.commit()
    await db_session.refresh(contact)
    return contact


@pytest.mark.asyncio
async def test_create_student_contact_as_admin(test_client: AsyncClient, mock_admin_profile: Profile, mock_parent_profile: Profile):
    """INTEGRATION TEST: Tests creating a new student contact."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    unique_name = f"Guardian {uuid.uuid4().hex[:6]}"
    create_payload = {
        "student_id": EXISTING_STUDENT_ID,
        "profile_user_id": str(mock_parent_profile.user_id),
        "name": unique_name,
        "phone": "1234567890",
        "email": "guardian@example.com",
        "relationship_type": "Guardian",
        "is_emergency_contact": True,
    }
    create_response = await test_client.post("/api/v1/student-contacts/", json=create_payload)
    assert create_response.status_code == status.HTTP_201_CREATED, create_response.text
    created_data = create_response.json()
    assert created_data["name"] == unique_name
    assert created_data["relationship_type"] == "Guardian"
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_student_contact_by_id_as_admin(
    test_client: AsyncClient,
    mock_admin_profile: Profile,
    created_student_contact: StudentContact,
):
    """INTEGRATION TEST: Tests retrieving a single student contact by ID."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    get_response = await test_client.get(f"/api/v1/student-contacts/{created_student_contact.id}")
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["name"] == created_student_contact.name
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_all_contacts_for_student_as_admin(
    test_client: AsyncClient,
    mock_admin_profile: Profile,
    created_student_contact: StudentContact,
):
    """INTEGRATION TEST: Tests retrieving all contacts for a given student."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    get_all_response = await test_client.get(f"/api/v1/student-contacts/student/{EXISTING_STUDENT_ID}")
    assert get_all_response.status_code == status.HTTP_200_OK
    all_contacts = get_all_response.json()
    assert isinstance(all_contacts, list)
    assert any(c["id"] == created_student_contact.id for c in all_contacts)
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_student_contact_as_admin(
    test_client: AsyncClient,
    mock_admin_profile: Profile,
    created_student_contact: StudentContact,
):
    """INTEGRATION TEST: Tests updating an existing student contact."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    update_payload = {"phone": "0987654321", "is_emergency_contact": False}
    update_response = await test_client.put(f"/api/v1/student-contacts/{created_student_contact.id}", json=update_payload)
    assert update_response.status_code == status.HTTP_200_OK
    updated_data = update_response.json()
    assert updated_data["phone"] == "0987654321"
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_delete_student_contact_as_admin(
    test_client: AsyncClient,
    mock_admin_profile: Profile,
    created_student_contact: StudentContact,
):
    """INTEGRATION TEST: Tests soft-deleting a student contact."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    delete_response = await test_client.delete(f"/api/v1/student-contacts/{created_student_contact.id}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    # Verify the contact is now inactive
    verify_response = await test_client.get(f"/api/v1/student-contacts/{created_student_contact.id}")
    assert verify_response.status_code == status.HTTP_200_OK
    verify_data = verify_response.json()
    assert verify_data["is_active"] is False
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_contact_as_non_admin_fails(
    test_client: AsyncClient,
    mock_teacher_profile: Profile,
    mock_parent_profile: Profile,
):
    """SAD PATH: Tests that a non-admin (e.g., a Teacher) cannot create a student contact."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile
    create_payload = {
        "student_id": EXISTING_STUDENT_ID,
        "profile_user_id": str(mock_parent_profile.user_id),
        "name": "Unauthorized Contact",
        "phone": "1112223333",
        "relationship_type": "Tutor",
    }
    response = await test_client.post("/api/v1/student-contacts/", json=create_payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_delete_non_existent_contact_fails(test_client: AsyncClient, mock_admin_profile: Profile):
    """SAD PATH: Tests that updating or deleting a non-existent contact ID returns a 404."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile
    non_existent_id = 99999

    # Test UPDATE
    update_response = await test_client.put(f"/api/v1/student-contacts/{non_existent_id}", json={"phone": "0000000000"})
    assert update_response.status_code == status.HTTP_404_NOT_FOUND

    # Test DELETE
    delete_response = await test_client.delete(f"/api/v1/student-contacts/{non_existent_id}")
    assert delete_response.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.clear()
