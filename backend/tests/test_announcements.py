import uuid

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.main import app
from app.models.profile import Profile

SCHOOL_ID = 1


@pytest.mark.asyncio
async def test_create_school_wide_announcement_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Tests that an Admin can create an announcement targeted to the entire school.
    """
    # --- Step 1: Log in as Admin ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # --- Step 2: Create the announcement payload ---
    announcement_title = f"Annual Sports Day {uuid.uuid4()}"
    announcement_content = "The Annual Sports Day will be held on December 20th, 2025."

    announcement_payload = {
        "school_id": SCHOOL_ID,
        "title": announcement_title,
        "content": announcement_content,
        "targets": [{"target_type": "SCHOOL", "target_id": SCHOOL_ID}],
    }

    # --- Step 3: Post the announcement ---
    response = await test_client.post("/api/v1/announcements/", json=announcement_payload)

    # --- Step 4: Assertions ---
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == announcement_title
    assert data["content"] == announcement_content
    assert data["published_by_id"] == str(mock_admin_profile.user_id)

    # Verify the target was created correctly
    assert "targets" in data and len(data["targets"]) == 1
    target = data["targets"][0]
    assert target["target_type"] == "SCHOOL"
    assert target["target_id"] == SCHOOL_ID

    # --- Step 5: Verify data in the database ---
    announcement_id = data["id"]
    result = await db_session.execute(text("SELECT title FROM announcements WHERE id = :id"), {"id": announcement_id})
    db_title = result.scalar_one_or_none()
    assert db_title == announcement_title

    target_result = await db_session.execute(
        text("SELECT COUNT(*) FROM announcement_targets" " WHERE announcement_id = :id AND target_type = 'SCHOOL'"),
        {"id": announcement_id},
    )
    assert target_result.scalar_one() == 1

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_grade_targeted_announcement_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Tests that an Admin can create an announcement targeted to a specific grade.
    """
    # --- Step 1: Log in as Admin to create dependencies ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    ay_payload = {
        "school_id": SCHOOL_ID,
        "name": f"AY for Grade Announce {uuid.uuid4()}",
        "start_date": "2025-04-01",
        "end_date": "2026-03-31",
    }
    ay_response = await test_client.post("/api/v1/academic-years/", json=ay_payload)
    academic_year_id = ay_response.json()["id"]

    # Create a class to get a valid grade_level to target
    class_payload = {
        "school_id": SCHOOL_ID,
        "grade_level": 7,
        "section": "A",
        "academic_year_id": academic_year_id,
    }
    class_response = await test_client.post("/api/v1/classes/", json=class_payload)
    assert class_response.status_code == status.HTTP_201_CREATED
    grade_level_to_target = class_response.json()["grade_level"]

    # --- Step 2: Create the announcement payload ---
    announcement_title = f"Grade {grade_level_to_target} Meeting {uuid.uuid4()}"
    announcement_content = f"There will be a special meeting for all students " f"in Grade {grade_level_to_target}."

    announcement_payload = {
        "school_id": SCHOOL_ID,
        "title": announcement_title,
        "content": announcement_content,
        "targets": [{"target_type": "GRADE", "target_id": grade_level_to_target}],
    }

    # --- Step 3: Post the announcement ---
    response = await test_client.post("/api/v1/announcements/", json=announcement_payload)

    # --- Step 4: Assertions ---
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == announcement_title
    assert "targets" in data and len(data["targets"]) == 1

    target = data["targets"][0]
    assert target["target_type"] == "GRADE"
    assert target["target_id"] == grade_level_to_target

    # --- Step 5: Verify data in the database ---
    announcement_id = data["id"]
    target_result = await db_session.execute(
        text("SELECT target_id FROM announcement_targets" " WHERE announcement_id = :id AND target_type = 'GRADE'"),
        {"id": announcement_id},
    )
    db_target_id = target_result.scalar_one_or_none()
    assert db_target_id == grade_level_to_target

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_class_targeted_announcement_as_admin(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Tests that an Admin can create an announcement targeted to a specific class.
    """
    # --- Step 1: Log in as Admin to create dependencies ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    ay_payload = {
        "school_id": SCHOOL_ID,
        "name": f"AY for Class Announce {uuid.uuid4()}",
        "start_date": "2025-04-01",
        "end_date": "2026-03-31",
    }
    ay_response = await test_client.post("/api/v1/academic-years/", json=ay_payload)
    academic_year_id = ay_response.json()["id"]

    # Create a class to get a valid class_id to target
    class_payload = {
        "school_id": SCHOOL_ID,
        "grade_level": 8,
        "section": "B",
        "academic_year_id": academic_year_id,
    }
    class_response = await test_client.post("/api/v1/classes/", json=class_payload)
    assert class_response.status_code == status.HTTP_201_CREATED
    class_id_to_target = class_response.json()["class_id"]

    # --- Step 2: Create the announcement payload ---
    announcement_title = f"Class {class_id_to_target} Field Trip {uuid.uuid4()}"
    announcement_content = f"Permission slips for the upcoming field trip for class " f"{class_id_to_target} are due this Friday."

    announcement_payload = {
        "school_id": SCHOOL_ID,
        "title": announcement_title,
        "content": announcement_content,
        "targets": [{"target_type": "CLASS", "target_id": class_id_to_target}],
    }

    # --- Step 3: Post the announcement ---
    response = await test_client.post("/api/v1/announcements/", json=announcement_payload)

    # --- Step 4: Assertions ---
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == announcement_title
    assert "targets" in data and len(data["targets"]) == 1

    target = data["targets"][0]
    assert target["target_type"] == "CLASS"
    assert target["target_id"] == class_id_to_target

    # --- Step 5: Verify data in the database ---
    announcement_id = data["id"]
    target_result = await db_session.execute(
        text("SELECT target_id FROM announcement_targets " "WHERE announcement_id = :id AND target_type = 'CLASS'"),
        {"id": announcement_id},
    )
    db_target_id = target_result.scalar_one_or_none()
    assert db_target_id == class_id_to_target

    app.dependency_overrides.clear()
