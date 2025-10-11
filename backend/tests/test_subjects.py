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
async def test_subject_crud_lifecycle_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    INTEGRATION TEST: Tests the full Create,Read,Update,and Delete
    lifecycle for Subjects
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    unique_name = f"History {uuid.uuid4()}"

    # 1. CREATE
    create_payload = {
        "name": unique_name,
        "school_id": SCHOOL_ID,
        "short_code": "HIST101",
        "category": "Social Studies",
    }
    create_response = await test_client.post("/v1/subjects/", json=create_payload)
    assert create_response.status_code == status.HTTP_201_CREATED
    created_data = create_response.json()
    assert created_data["name"] == unique_name
    subject_id = created_data["subject_id"]

    # 2. READ (Get One)
    get_response = await test_client.get(f"/v1/subjects/{subject_id}")
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["name"] == unique_name

    # 3. UPDATE
    update_payload = {"description": "An updated course description."}
    update_response = await test_client.put(f"/v1/subjects/{subject_id}", json=update_payload)
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["description"] == "An updated course description."

    # 4. DELETE
    delete_response = await test_client.delete(f"/v1/subjects/{subject_id}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    # 5. VERIFY DELETE (by trying to get it again)
    verify_response = await test_client.get(f"/v1/subjects/{subject_id}")
    assert verify_response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_create_subject_as_teacher_fails(test_client: AsyncClient, db_session: AsyncSession):
    """SAD PATH: Tests that a non-admin user cannot create a subject."""
    mock_teacher_profile = Profile(
        user_id="teacher-user-id-subjects",
        school_id=SCHOOL_ID,
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=2, role_name="Teacher"))],
    )
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile

    payload = {"name": "Unauthorized Subject", "school_id": SCHOOL_ID}
    response = await test_client.post("/v1/subjects/", json=payload)

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_update_non_existent_subject_fails(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """SAD PATH: Tests that updating a non-existent subject ID returns a 404."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    non_existent_id = 99999
    update_payload = {"description": "This should fail"}

    response = await test_client.put(f"/v1/subjects/{non_existent_id}", json=update_payload)

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_delete_non_existent_subject_fails(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """SAD PATH: Tests that deleting a non-existent subject ID returns a 404."""
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    non_existent_id = 99999

    response = await test_client.delete(f"/v1/subjects/{non_existent_id}")

    assert response.status_code == status.HTTP_404_NOT_FOUND
