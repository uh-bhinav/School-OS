import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.main import app
from app.models.profile import Profile
from app.models.student import Student


@pytest.mark.asyncio
async def test_enroll_new_student_as_admin(test_client: AsyncClient, mock_admin_profile: Profile, db_session: AsyncSession):
    """
    Happy Path: Test enrolling a new student by mocking the service layer.
    This avoids direct DB manipulation and Supabase auth calls.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # 1. Define the successful 'Student' object our mock service will return.
    mock_user_id = uuid.uuid4()
    mock_student_result = Student(
        student_id=101,
        user_id=mock_user_id,
        current_class_id=1,
        profile=Profile(
            user_id=mock_user_id,
            school_id=1,
            first_name="New",
            last_name="Student",
            is_active=True,
        ),
        is_active=True,
    )

    # 2. Patch the service function. When the endpoint calls it, our mock runs instead.
    with patch(
        "app.api.v1.endpoints.students.student_service.create_student",
        new_callable=AsyncMock,
        return_value=mock_student_result,
    ) as mock_create_student:
        # 3. Call the API endpoint.
        response = await test_client.post(
            "/v1/students/",
            json={
                "email": f"student.{uuid.uuid4()}@example.com",
                "password": "password",
                "first_name": "New",
                "last_name": "Student",
                "school_id": 1,
                "current_class_id": 1,
                "enrollment_date": "2025-09-01",
            },
        )

    # 4. Assert the endpoint behaved correctly.
    assert response.status_code == status.HTTP_201_CREATED, response.text
    mock_create_student.assert_awaited_once()

    data = response.json()
    assert data["profile"]["first_name"] == "New"
    assert data["current_class_id"] == 1

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_search_student_by_name(test_client: AsyncClient, mock_admin_profile: Profile, db_session: AsyncSession):
    """
    Happy Path: Test searching for a student by name by mocking the service layer.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    unique_name = f"Searchable_{uuid.uuid4().hex}"
    mock_user_id = uuid.uuid4()

    # Define the mock result the service will return
    profile = Profile(
        user_id=mock_user_id,
        school_id=1,
        first_name=unique_name,
        last_name="User",
        is_active=True,
    )
    student = Student(
        student_id=102,
        user_id=profile.user_id,
        current_class_id=1,
        profile=profile,
        is_active=True,
    )

    with patch(
        "app.api.v1.endpoints.students.student_service.search_students",
        new_callable=AsyncMock,
        return_value=[student],
    ) as mock_search:
        # Corrected URL: added trailing slash to 'search'
        response = await test_client.get(f"/v1/students/search?name={unique_name}")
        print(response.text)

    app.dependency_overrides.clear()

    assert response.status_code == status.HTTP_200_OK
    mock_search.assert_awaited_once()
    data = response.json()
    assert len(data) >= 1
    assert any(d["profile"]["first_name"] == unique_name for d in data)


@pytest.mark.asyncio
async def test_student_soft_deletion(test_client: AsyncClient, mock_admin_profile: Profile, db_session: AsyncSession):
    """
    Happy Path & Sad Path: Test soft deletion of a student by mocking the service layer.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # 1. Mock the successful deletion call
    with patch(
        "app.api.v1.endpoints.students.student_service.soft_delete_student",
        new_callable=AsyncMock,
        return_value=MagicMock(),  # A successful delete returns an object
    ) as mock_delete:
        delete_response = await test_client.delete("/v1/students/101")
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT
        mock_delete.assert_awaited_once_with(db=db_session, student_id=101)

    # 2. Mock the case where the student is not found
    with patch(
        "app.api.v1.endpoints.students.student_service.soft_delete_student",
        new_callable=AsyncMock,
        return_value=None,  # A failed delete returns None
    ) as mock_delete_fail:
        delete_non_existent_response = await test_client.delete("/v1/students/99999")
        assert delete_non_existent_response.status_code == status.HTTP_404_NOT_FOUND
        mock_delete_fail.assert_awaited_once_with(db=db_session, student_id=99999)

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_bulk_promote_students(test_client: AsyncClient, mock_admin_profile: Profile, db_session: AsyncSession):
    """
    Happy Path: Test bulk promotion of students to a new class by mocking the service.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    mock_response = {"status": "success", "promoted_count": 2}

    with patch(
        "app.api.v1.endpoints.students.student_service.bulk_promote_students",
        new_callable=AsyncMock,
        return_value=mock_response,
    ) as mock_promote:
        promotion_payload = {"student_ids": [1, 2], "target_class_id": 2}
        # Corrected URL: added trailing slash to 'promote'
        response = await test_client.post("/v1/students/promote", json=promotion_payload)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "success"
        assert data["promoted_count"] == 2
        mock_promote.assert_awaited_once()

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_enroll_student_as_non_admin_fails(test_client: AsyncClient, mock_normal_user_profile: Profile):
    """
    Sad Path: Test that a non-admin cannot enroll a student. This tests the endpoint's
    `require_role` dependency directly.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_normal_user_profile
    response = await test_client.post(
        "/v1/students/",
        json={
            "email": f"forbidden.{uuid.uuid4()}@example.com",
            "password": "password",
            "first_name": "Forbidden",
            "last_name": "User",
            "school_id": 1,
            "current_class_id": 1,
            "enrollment_date": "2025-09-01",
        },
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_all_students(test_client: AsyncClient, mock_admin_profile: Profile):
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    with patch(
        "app.api.v1.endpoints.students.student_service.search_students",
        new_callable=AsyncMock,
        return_value=[
            {
                "student_id": 1,
                "user_id": str(uuid.uuid4()),
                "current_class_id": 2,
                "is_active": True,
                "profile": {"first_name": "Alice", "last_name": "Doe"},
            },
            {
                "student_id": 2,
                "user_id": str(uuid.uuid4()),
                "current_class_id": 3,
                "is_active": True,
                "profile": {"first_name": "Bob", "last_name": "Lee"},
            },
        ],
    ):
        response = await test_client.get("/v1/students/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert data[0]["profile"]["first_name"] == "Alice"

    app.dependency_overrides.clear()
