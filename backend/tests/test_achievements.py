from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.models.academic_year import AcademicYear
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.student import Student
from app.models.user_roles import UserRole


def _award_date_iso() -> str:
    """Return a date string that is never in the future for UTC-based constraints."""
    return datetime.utcnow().date().isoformat()


async def _auth_headers_for_role(session: AsyncSession, *, role_name: str, school_id: int) -> dict[str, str]:
    """Generate an auth header for an active profile with the requested role and school."""
    stmt = (
        select(Profile)
        .join(UserRole, UserRole.user_id == Profile.user_id)
        .join(RoleDefinition, RoleDefinition.role_id == UserRole.role_id)
        .where(
            Profile.school_id == school_id,
            Profile.is_active == True,  # noqa: E712
            RoleDefinition.role_name == role_name,
        )
        .limit(1)
    )
    result = await session.execute(stmt)
    profile = result.scalars().first()
    if not profile:
        raise RuntimeError(f"No active {role_name.lower()} profile seeded for school_id={school_id}.")

    token = create_access_token(subject=str(profile.user_id))
    return {"Authorization": f"Bearer {token}"}


# Fixtures from conftest.py are assumed:
# client, test_db_session, admin_auth_headers, teacher_auth_headers
# test_school, test_academic_year, test_student, test_teacher
# --- New fixtures assumed for security/multi-tenancy tests ---
# test_school_two, admin_auth_headers_two, test_student_two


@pytest.mark.asyncio
async def test_achievement_rules_crud_as_admin(client: TestClient, test_db_session: AsyncSession, test_school: dict):
    school_id = test_school["school_id"]
    admin_auth_headers = await _auth_headers_for_role(test_db_session, role_name="Admin", school_id=school_id)
    teacher_auth_headers = await _auth_headers_for_role(test_db_session, role_name="Teacher", school_id=school_id)
    # 1. Teachers cannot create rules
    rule_data = {"achievement_type": "academic", "category_name": "Math Olympiad", "base_points": 100}
    response = client.post("/api/v1/achievements/rules", headers=teacher_auth_headers, json=rule_data)
    # Assuming RoleChecker returns 403 Forbidden
    # If not implemented, this might be 401, but the endpoint is protected
    assert response.status_code in [403, 401]

    # 2. Admin creates a rule
    response = client.post("/api/v1/achievements/rules", headers=admin_auth_headers, json=rule_data)
    assert response.status_code == 201
    rule = response.json()
    assert rule["category_name"] == "Math Olympiad"
    assert rule["base_points"] == 100
    rule_id = rule["id"]

    # 3. Get all rules
    response = client.get("/api/v1/achievements/rules", headers=teacher_auth_headers)
    assert response.status_code == 200
    rules = response.json()
    assert isinstance(rules, list)
    assert len(rules) >= 1
    assert any(r["category_name"] == "Math Olympiad" for r in rules)

    # 4. Admin updates the rule
    update_data = {"base_points": 150, "is_active": False}
    response = client.put(f"/api/v1/achievements/rules/{rule_id}", headers=admin_auth_headers, json=update_data)
    assert response.status_code == 200
    updated_rule = response.json()
    assert updated_rule["base_points"] == 150
    assert updated_rule["is_active"] is False


@pytest.mark.asyncio
async def test_student_achievement_workflow(client: TestClient, test_db_session: AsyncSession, test_academic_year: AcademicYear, test_student: Student):
    admin_auth_headers = await _auth_headers_for_role(test_db_session, role_name="Admin", school_id=test_academic_year.school_id)
    teacher_auth_headers = await _auth_headers_for_role(test_db_session, role_name="Teacher", school_id=test_academic_year.school_id)
    # Capture baseline counts for existing achievements in seeded data
    student_id = test_student.student_id
    academic_year_id = test_academic_year.id

    baseline_verified_resp = client.get(
        f"/api/v1/achievements/student/{student_id}",
        headers=teacher_auth_headers,
    )
    assert baseline_verified_resp.status_code == 200
    baseline_verified = len(baseline_verified_resp.json())

    baseline_all_resp = client.get(
        f"/api/v1/achievements/student/{student_id}?verified_only=False",
        headers=teacher_auth_headers,
    )
    assert baseline_all_resp.status_code == 200
    baseline_all = len(baseline_all_resp.json())

    # 1. Create a point rule for this test
    rule_data = {"achievement_type": "sports", "category_name": "Athletics", "base_points": 75}
    response = client.post("/api/v1/achievements/rules", headers=admin_auth_headers, json=rule_data)
    assert response.status_code == 201

    # 2. Teacher adds an unverified achievement
    achievement_data = {
        "student_id": student_id,
        "academic_year_id": academic_year_id,
        "achievement_type": "sports",
        "title": "100m Dash Winner",
        "description": "District level competition",
        "achievement_category": "Athletics",  # This matches the rule
        "date_awarded": _award_date_iso(),
        "visibility": "school_only",
    }
    response = client.post("/api/v1/achievements/", headers=teacher_auth_headers, json=achievement_data)
    assert response.status_code == 201
    unverified_ach = response.json()
    ach_id = unverified_ach["id"]

    assert unverified_ach["is_verified"] is False
    assert unverified_ach["points_awarded"] == 0
    assert unverified_ach["title"] == "100m Dash Winner"

    # 3. Teacher can update the unverified achievement
    update_data = {"title": "100m Dash Gold Medalist"}
    response = client.put(f"/api/v1/achievements/{ach_id}", headers=teacher_auth_headers, json=update_data)
    assert response.status_code == 200
    assert response.json()["title"] == "100m Dash Gold Medalist"

    # 4. Admin verifies the achievement
    response = client.put(f"/api/v1/achievements/verify/{ach_id}", headers=admin_auth_headers)
    assert response.status_code == 200
    verified_ach = response.json()

    assert verified_ach["is_verified"] is True
    assert verified_ach["points_awarded"] == 75  # Points should be auto-awarded
    assert verified_ach["verified_by_user_id"] is not None

    # 5. Teacher CANNOT update a verified achievement
    update_data = {"title": "Trying to change verified title"}
    response = client.put(f"/api/v1/achievements/{ach_id}", headers=teacher_auth_headers, json=update_data)
    assert response.status_code == 404  # Service returns None, endpoint raises 404

    # 6. Teacher CANNOT delete a verified achievement
    response = client.delete(f"/api/v1/achievements/{ach_id}", headers=teacher_auth_headers)
    assert response.status_code == 404  # Service returns False, endpoint raises 404

    # 7. Add a second, unverified achievement
    ach_data_2 = {"student_id": student_id, "academic_year_id": academic_year_id, "achievement_type": "cultural", "title": "Singing Contest", "achievement_category": "Music", "date_awarded": _award_date_iso()}
    response = client.post("/api/v1/achievements/", headers=teacher_auth_headers, json=ach_data_2)
    assert response.status_code == 201
    unverified_ach_2_id = response.json()["id"]

    # 8. Get student achievements (verified only by default)
    response = client.get(f"/api/v1/achievements/student/{student_id}", headers=teacher_auth_headers)
    assert response.status_code == 200
    achievements = response.json()
    assert len(achievements) == baseline_verified + 1
    assert any(item["id"] == ach_id for item in achievements)

    # 9. Get all student achievements
    response = client.get(f"/api/v1/achievements/student/{student_id}?verified_only=False", headers=teacher_auth_headers)
    assert response.status_code == 200
    achievements = response.json()
    assert len(achievements) == baseline_all + 2
    assert any(item["id"] == ach_id for item in achievements)
    assert any(item["id"] == unverified_ach_2_id for item in achievements)

    # 10. Teacher CAN delete an unverified achievement
    response = client.delete(f"/api/v1/achievements/{unverified_ach_2_id}", headers=teacher_auth_headers)
    assert response.status_code == 204

    # Verify it's gone
    response = client.get(f"/api/v1/achievements/student/{student_id}?verified_only=False", headers=teacher_auth_headers)
    assert response.status_code == 200
    achievements = response.json()
    assert len(achievements) == baseline_all + 1
    assert any(item["id"] == ach_id for item in achievements)


# --- NEW TESTS for Errors, Validation, and Security ---


@pytest.mark.asyncio
async def test_errors_and_validation(client: TestClient, test_db_session: AsyncSession, test_student: Student, test_academic_year: AcademicYear):
    admin_auth_headers = await _auth_headers_for_role(test_db_session, role_name="Admin", school_id=test_academic_year.school_id)
    teacher_auth_headers = await _auth_headers_for_role(test_db_session, role_name="Teacher", school_id=test_academic_year.school_id)
    # 1. Test 404 Not Found
    response = client.put("/api/v1/achievements/verify/999999", headers=admin_auth_headers)
    assert response.status_code == 404

    response = client.put("/api/v1/achievements/999999", headers=teacher_auth_headers, json={"title": "test"})
    assert response.status_code == 404

    response = client.delete("/api/v1/achievements/999999", headers=teacher_auth_headers)
    assert response.status_code == 404

    response = client.put("/api/v1/achievements/rules/999999", headers=admin_auth_headers, json={"base_points": 10})
    assert response.status_code == 404

    # 2. Test 422 Unprocessable Entity (Invalid Data)
    invalid_rule_data = {"achievement_type": "academic", "category_name": "Invalid Rule", "base_points": -50}  # Invalid, must be >= 0
    response = client.post("/api/v1/achievements/rules", headers=admin_auth_headers, json=invalid_rule_data)
    assert response.status_code == 422

    invalid_achievement_data = {"student_id": test_student.student_id, "academic_year_id": 999, "achievement_type": "invalid_type", "title": "Test", "achievement_category": "Test", "date_awarded": _award_date_iso()}  # Invalid enum
    response = client.post("/api/v1/achievements/", headers=teacher_auth_headers, json=invalid_achievement_data)
    assert response.status_code == 422

    missing_student_data = {
        "student_id": 999999,
        "academic_year_id": test_academic_year.id,
        "achievement_type": "academic",
        "title": "Ghost Entry",
        "achievement_category": "Competition",
        "date_awarded": _award_date_iso(),
        "visibility": "school_only",
    }
    response = client.post("/api/v1/achievements/", headers=teacher_auth_headers, json=missing_student_data)
    assert response.status_code == 404
    assert response.json()["detail"] == "Student not found in this school."


@pytest.mark.asyncio
async def test_teacher_cannot_verify_achievement(client: TestClient, test_db_session: AsyncSession, test_student: Student, test_academic_year: AcademicYear):
    teacher_auth_headers = await _auth_headers_for_role(test_db_session, role_name="Teacher", school_id=test_academic_year.school_id)
    admin_auth_headers = await _auth_headers_for_role(test_db_session, role_name="Admin", school_id=test_academic_year.school_id)
    # 1. Teacher adds an achievement
    achievement_data = {"student_id": test_student.student_id, "academic_year_id": test_academic_year.id, "achievement_type": "leadership", "title": "Class Captain", "achievement_category": "Responsibility", "date_awarded": _award_date_iso()}
    response = client.post("/api/v1/achievements/", headers=teacher_auth_headers, json=achievement_data)
    assert response.status_code == 201
    ach_id = response.json()["id"]

    # 2. Teacher tries to verify it
    response = client.put(f"/api/v1/achievements/verify/{ach_id}", headers=teacher_auth_headers)
    assert response.status_code in [401, 403]  # Should fail auth

    # 3. Admin *can* verify it
    response = client.put(f"/api/v1/achievements/verify/{ach_id}", headers=admin_auth_headers)
    assert response.status_code == 200
    assert response.json()["is_verified"] is True


@pytest.mark.asyncio
async def test_multi_tenancy_security(
    client: TestClient,
    admin_auth_headers_two: dict,
    test_db_session: AsyncSession,
    test_student: Student,
    test_academic_year: AcademicYear,
):
    # This test assumes 'admin_auth_headers' is for School 1
    # and 'admin_auth_headers_two' is for School 2.
    # 'test_student' belongs to School 1.

    # Capture detached identifiers up front so later sync HTTP calls don't lazily load from the async session
    student_id = test_student.student_id
    academic_year_id = test_academic_year.id

    admin_auth_headers = await _auth_headers_for_role(test_db_session, role_name="Admin", school_id=test_academic_year.school_id)
    teacher_auth_headers = await _auth_headers_for_role(test_db_session, role_name="Teacher", school_id=test_academic_year.school_id)

    # 1. Admin from School 1 creates an achievement for a student in School 1
    achievement_data = {
        "student_id": student_id,
        "academic_year_id": academic_year_id,
        "achievement_type": "community_service",
        "title": "Beach Cleanup",
        "achievement_category": "Volunteering",
        "date_awarded": _award_date_iso(),
    }
    response = client.post("/api/v1/achievements/", headers=teacher_auth_headers, json=achievement_data)
    assert response.status_code == 201
    ach_id = response.json()["id"]

    # 2. Admin from School 2 tries to verify the achievement from School 1
    response = client.put(f"/api/v1/achievements/verify/{ach_id}", headers=admin_auth_headers_two)
    # The service logic should return None, which the endpoint turns into a 404
    assert response.status_code == 404

    # 3. Admin from School 2 tries to update the achievement
    response = client.put(f"/api/v1/achievements/{ach_id}", headers=admin_auth_headers_two, json={"title": "Hacking Attempt"})
    assert response.status_code == 404

    # 4. Admin from School 2 tries to delete the achievement
    response = client.delete(f"/api/v1/achievements/{ach_id}", headers=admin_auth_headers_two)
    assert response.status_code == 404

    # 5. Admin from School 2 tries to get achievements for the student from School 1
    response = client.get(f"/api/v1/achievements/student/{student_id}", headers=admin_auth_headers_two)
    # The query is scoped by school_id, so it should return an empty list.
    assert response.status_code == 200
    assert response.json() == []

    # 6. Admin from School 1 *can* verify it
    response = client.put(f"/api/v1/achievements/verify/{ach_id}", headers=admin_auth_headers)
    assert response.status_code == 200
    assert response.json()["is_verified"] is True


@pytest.mark.asyncio
async def test_parent_can_view_linked_student_achievements(
    client: TestClient,
    parent_profile_1: Profile,
    student_22: Student,
):
    token = create_access_token(subject=str(parent_profile_1.user_id))
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get(f"/api/v1/achievements/student/{student_22.student_id}", headers=headers)
    assert response.status_code == 200
    achievements = response.json()
    assert isinstance(achievements, list)
    assert any(item["student_id"] == student_22.student_id for item in achievements)


@pytest.mark.asyncio
async def test_parent_cannot_view_unlinked_student_achievements(
    client: TestClient,
    parent_profile_2: Profile,
    student_22: Student,
):
    token = create_access_token(subject=str(parent_profile_2.user_id))
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get(f"/api/v1/achievements/student/{student_22.student_id}", headers=headers)
    assert response.status_code == 403
    assert response.json()["detail"] == "Not authorized to view this student's achievements."
