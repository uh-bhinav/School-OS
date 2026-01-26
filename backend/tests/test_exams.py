import uuid

import pytest
from fastapi import status
from fastapi.routing import APIRoute
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.main import app
from app.models.profile import Profile

# A hardcoded school ID to be used across tests
SCHOOL_ID = 1


@pytest.mark.asyncio
async def test_create_exam_type_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Tests that an Admin can successfully create a new exam type.
    """
    # Override the dependency to simulate an authenticated admin user
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # Define the payload for the new exam type
    payload = {
        "school_id": SCHOOL_ID,
        "type_name": f"Unit Test {uuid.uuid4()}",  # Use UUID to ensure uniqueness
    }

    # Make the API call to create the exam type
    response = await test_client.post("/api/v1/exam-types/", json=payload)

    # Assert that the creation was successful (HTTP 201 Created)
    assert response.status_code == status.HTTP_201_CREATED

    # Assert that the response data matches the payload
    data = response.json()
    assert data["school_id"] == payload["school_id"]
    assert data["type_name"] == payload["type_name"]
    assert "exam_type_id" in data

    # Clean up the dependency override after the test
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_all_exam_types_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Tests that an Admin can successfully retrieve all exam types for their school.
    """
    # Override the dependency to simulate an authenticated admin user
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # First, create a unique exam type to ensure it exists in the list we retrieve
    unique_type_name = f"Annual Exam {uuid.uuid4()}"
    payload = {"school_id": SCHOOL_ID, "type_name": unique_type_name}
    await test_client.post("/api/v1/exam-types/", json=payload)

    # Now, make the API call to get all exam types for the school
    response = await test_client.get(f"/api/v1/exam-types/{SCHOOL_ID}/all")

    # Assert that the request was successful (HTTP 200 OK)
    assert response.status_code == status.HTTP_200_OK

    # Assert that the response is a list
    data = response.json()
    assert isinstance(data, list)
    # Ensure the list is not empty
    assert len(data) > 0

    # Check if our newly created exam type is present in the response list
    assert any(item["type_name"] == unique_type_name for item in data)

    # Clean up the dependency override
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_exam_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Tests that an Admin can successfully create a new exam,
    ensuring all dependencies (academic year, exam type) are handled.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # --- Step 1: Create dependencies first ---

    # Create a unique Academic Year to associate with the exam
    ay_payload = {
        "school_id": SCHOOL_ID,
        "name": f"AY {uuid.uuid4()}",
        "start_date": "2025-04-01",
        "end_date": "2026-03-31",
    }
    ay_response = await test_client.post("/api/v1/academic-years/", json=ay_payload)
    assert ay_response.status_code == status.HTTP_201_CREATED
    academic_year_id = ay_response.json()["id"]

    # Create a unique Exam Type
    et_payload = {
        "school_id": SCHOOL_ID,
        "type_name": f"Final Term {uuid.uuid4()}",
    }
    et_response = await test_client.post("/api/v1/exam-types/", json=et_payload)
    assert et_response.status_code == status.HTTP_201_CREATED
    exam_type_id = et_response.json()["exam_type_id"]

    # --- Step 2: Create the Exam ---

    exam_payload = {
        "school_id": SCHOOL_ID,
        "exam_name": "Annual Examination 2026",
        "exam_type_id": exam_type_id,
        "start_date": "2026-03-10",
        "end_date": "2026-03-25",
        "marks": 100.0,
        "academic_year_id": academic_year_id,
    }

    response = await test_client.post("/api/v1/exams/", json=exam_payload)

    # --- Step 3: Assert the results ---

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["school_id"] == exam_payload["school_id"]
    assert data["exam_name"] == exam_payload["exam_name"]
    assert data["exam_type_id"] == exam_payload["exam_type_id"]
    assert data["academic_year_id"] == exam_payload["academic_year_id"]
    assert "id" in data

    app.dependency_overrides.clear()


for route in app.routes:
    if isinstance(route, APIRoute):
        print(route.path)


@pytest.mark.asyncio
async def test_get_all_exams(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Tests that any authenticated user can retrieve a list of all active exams
    for a specific school.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # --- Step 1: Create a unique exam to ensure it appears in the list ---
    # (Dependencies are created for this specific test)
    ay_payload = {
        "school_id": SCHOOL_ID,
        "name": f"AY for Get All {uuid.uuid4()}",
        "start_date": "2025-04-01",
        "end_date": "2026-03-31",
    }
    ay_response = await test_client.post("/api/v1/academic-years/", json=ay_payload)
    academic_year_id = ay_response.json()["id"]

    et_payload = {"school_id": SCHOOL_ID, "type_name": f"Quarterly {uuid.uuid4()}"}
    et_response = await test_client.post("/api/v1/exam-types/", json=et_payload)
    exam_type_id = et_response.json()["exam_type_id"]

    unique_exam_name = f"Quarterly Exam {uuid.uuid4()}"
    exam_payload = {
        "school_id": SCHOOL_ID,
        "exam_name": unique_exam_name,
        "exam_type_id": exam_type_id,
        "start_date": "2025-09-15",
        "end_date": "2025-09-25",
        "marks": 100.0,
        "academic_year_id": academic_year_id,
    }
    await test_client.post("/api/v1/exams/", json=exam_payload)

    # --- Step 2: Make the API call to get all exams ---
    response = await test_client.get(f"/api/v1/exams/all/{SCHOOL_ID}")

    # --- Step 3: Assert the results ---
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    # Verify that our newly created, active exam is in the list
    assert any(item["exam_name"] == unique_exam_name for item in data)

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_teacher_cannot_view_other_school_exams(test_client: AsyncClient, mock_teacher_profile: Profile):
    """Teacher tokens should be scoped to their own school."""

    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile

    response = await test_client.get("/api/v1/exams/all/2")

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json()["detail"] == ("Access to exams for other schools is not permitted.")

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_parent_can_view_their_school_exams(test_client: AsyncClient, mock_parent_profile: Profile):
    """Parent profile should read their school's exams."""

    app.dependency_overrides[get_current_user_profile] = lambda: mock_parent_profile

    response = await test_client.get(f"/api/v1/exams/all/{mock_parent_profile.school_id}")

    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_parent_blocked_from_other_school_exams(test_client: AsyncClient, mock_parent_profile: Profile):
    """Parent should hit 403 when requesting another school's exams."""

    app.dependency_overrides[get_current_user_profile] = lambda: mock_parent_profile

    response = await test_client.get("/api/v1/exams/all/2")

    assert response.status_code == status.HTTP_403_FORBIDDEN

    app.dependency_overrides.clear()


# @pytest.mark.asyncio
# async def test_update_exam_as_admin(
#     test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile
# ):
#     """
#     Tests that an Admin can successfully update an existing exam.
#     """
#     app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

#     # --- Step 1: Create an exam to update ---
#     ay_payload = {
#         "school_id": SCHOOL_ID,
#         "name": f"AY for Update {uuid.uuid4()}",
#         "start_date": "2026-04-01",
#         "end_date": "2027-03-31",
#     }
#     ay_response = await test_client.post("/api/v1/academic-years/", json=ay_payload)
#     academic_year_id = ay_response.json()["id"]

#     et_payload = {"school_id": SCHOOL_ID, "type_name": f"Mid-Term {uuid.uuid4()}"}
#     et_response = await test_client.post("/api/v1/exam-types/", json=et_payload)
#     exam_type_id = et_response.json()["exam_type_id"]

#     exam_payload = {
#         "school_id": SCHOOL_ID,
#         "exam_name": "Original Exam Name",
#         "exam_type_id": exam_type_id,
#         "start_date": "2026-09-15",
#         "end_date": "2026-09-25",
#         "marks": 100.0,
#         "academic_year_id": academic_year_id,
#     }
#     create_response = await test_client.post("/api/v1/exams/", json=exam_payload)
#     exam_id_to_update = create_response.json()["id"]

#     # --- Step 2: Update the exam ---
#     update_payload = {"exam_name": "Updated Exam Name"}
#     response = await test_client.put(
#         f"/api/v1/exams/{exam_id_to_update}", json=update_payload
#     )

#     # --- Step 3: Assert the results ---
#     assert response.status_code == status.HTTP_200_OK
#     data = response.json()
#     assert data["exam_name"] == "Updated Exam Name"
#     assert data["id"] == exam_id_to_update

#     app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_exam_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Tests that an Admin can successfully update an existing exam.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # --- Step 1: Create an exam to update ---
    ay_payload = {
        "school_id": SCHOOL_ID,
        "name": f"AY for Update {uuid.uuid4()}",
        "start_date": "2026-04-01",
        "end_date": "2027-03-31",
    }
    ay_response = await test_client.post("/api/v1/academic-years/", json=ay_payload)
    academic_year_id = ay_response.json()["id"]

    et_payload = {"school_id": SCHOOL_ID, "type_name": f"Mid-Term {uuid.uuid4()}"}
    et_response = await test_client.post("/api/v1/exam-types/", json=et_payload)
    exam_type_id = et_response.json()["exam_type_id"]

    exam_payload = {
        "school_id": SCHOOL_ID,
        "exam_name": "Original Exam Name",
        "exam_type_id": exam_type_id,
        "start_date": "2026-09-15",
        "end_date": "2026-09-25",
        "marks": 100.0,
        "academic_year_id": academic_year_id,
    }
    create_response = await test_client.post("/api/v1/exams/", json=exam_payload)
    exam_id_to_update = create_response.json()["id"]

    # --- Step 2: Update the exam ---
    update_payload = {"exam_name": "Updated Exam Name"}
    response = await test_client.put(f"/api/v1/exams/{exam_id_to_update}", json=update_payload)

    # --- Step 3: Assert the results ---
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["exam_name"] == "Updated Exam Name"
    assert data["id"] == exam_id_to_update

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_soft_delete_exam_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Tests that an Admin can successfully soft-delete an exam.
    The exam should no longer be retrievable via standard 'get' methods
    that filter for active records.
    """
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # --- Step 1: Create an exam to delete ---
    ay_payload = {
        "school_id": SCHOOL_ID,
        "name": f"AY for Delete {uuid.uuid4()}",
        "start_date": "2027-04-01",
        "end_date": "2028-03-31",
    }
    ay_response = await test_client.post("/api/v1/academic-years/", json=ay_payload)
    academic_year_id = ay_response.json()["id"]

    et_payload = {"school_id": SCHOOL_ID, "type_name": f"Final {uuid.uuid4()}"}
    et_response = await test_client.post("/api/v1/exam-types/", json=et_payload)
    exam_type_id = et_response.json()["exam_type_id"]

    exam_payload = {
        "school_id": SCHOOL_ID,
        "exam_name": "To Be Deleted",
        "exam_type_id": exam_type_id,
        "start_date": "2028-03-10",
        "end_date": "2028-03-25",
        "marks": 100.0,
        "academic_year_id": academic_year_id,
    }
    create_response = await test_client.post("/api/v1/exams/", json=exam_payload)
    exam_id_to_delete = create_response.json()["id"]

    # --- Step 2: Delete the exam ---
    delete_response = await test_client.delete(f"/api/v1/exams/{exam_id_to_delete}")

    # --- Step 3: Assert the results ---
    # Assert that the delete request was successful (HTTP 204 No Content)
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    # Verify the exam is "gone" by trying to fetch it via the GET endpoint,
    # which should only return active exams. This should result in a 404.
    # Note: We need to use the service directly for this
    # check as there's no GET /exams/{id} endpoint.
    from app.services import exam_service

    deleted_exam = await exam_service.get_exam_by_id(db=db_session, exam_id=exam_id_to_delete)
    assert deleted_exam is None

    app.dependency_overrides.clear()
