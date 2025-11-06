import uuid
from datetime import date, timedelta
from types import SimpleNamespace

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import get_current_user_profile
from app.main import app
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user_roles import UserRole
from app.schemas.enums import (
    ClubActivityStatus,
    ClubActivityType,
    ClubMembershipRole,
    ClubMembershipStatus,
    ClubType,
    MeetingFrequency,
)


async def _get_profile_with_role(db_session: AsyncSession, school_id: int, role_name: str) -> Profile:
    stmt = (
        select(Profile)
        .join(UserRole, UserRole.user_id == Profile.user_id)
        .join(RoleDefinition, RoleDefinition.role_id == UserRole.role_id)
        .where(
            Profile.school_id == school_id,
            Profile.is_active == True,  # noqa: E712
            RoleDefinition.role_name == role_name,
        )
        .options(
            selectinload(Profile.roles).selectinload(UserRole.role_definition),
            selectinload(Profile.student),
            selectinload(Profile.teacher),
        )
        .limit(1)
    )
    result = await db_session.execute(stmt)
    profile = result.scalars().first()
    assert profile is not None, f"Expected an active {role_name} profile for school_id={school_id}"
    return profile


async def _get_teacher_with_profile(db_session: AsyncSession, school_id: int) -> Teacher:
    stmt = (
        select(Teacher)
        .where(Teacher.school_id == school_id, Teacher.is_active == True)  # noqa: E712
        .options(
            selectinload(Teacher.profile).selectinload(Profile.roles).selectinload(UserRole.role_definition),
        )
        .limit(1)
    )
    result = await db_session.execute(stmt)
    teacher = result.scalars().first()
    assert teacher is not None, f"Expected at least one teacher for school_id={school_id}"
    assert teacher.profile is not None, "Teacher record is missing an associated profile"
    return teacher


def _normalize_profile(profile: Profile | SimpleNamespace) -> SimpleNamespace:
    if isinstance(profile, SimpleNamespace):
        return profile
    profile_state = getattr(profile, "__dict__", {})
    return SimpleNamespace(
        user_id=str(getattr(profile, "user_id", "")),
        school_id=getattr(profile, "school_id", None),
        is_active=getattr(profile, "is_active", True),
        roles=list(getattr(profile, "roles", []) or []),
        student=profile_state.get("student"),
        teacher=profile_state.get("teacher"),
    )


def _authenticate_as(profile: Profile | SimpleNamespace) -> None:
    normalized_profile = _normalize_profile(profile)

    async def _override_current_user() -> SimpleNamespace:
        return normalized_profile

    app.dependency_overrides[get_current_user_profile] = _override_current_user


@pytest.mark.asyncio
async def test_club_crud_flow(
    test_client: AsyncClient,
    db_session: AsyncSession,
    test_school: dict[str, int],
    test_academic_year,
):
    school_id = test_school["school_id"]
    admin_profile = await _get_profile_with_role(db_session, school_id, "Admin")
    teacher = await _get_teacher_with_profile(db_session, school_id)

    _authenticate_as(admin_profile)

    club_name = f"STEM-{uuid.uuid4().hex[:6]}"
    create_payload = {
        "name": club_name,
        "description": "Robotics competitions and STEM outreach",
        "club_type": ClubType.technical.value,
        "teacher_in_charge_id": teacher.teacher_id,
        "academic_year_id": test_academic_year.id,
        "meeting_schedule": {"weekday": "Friday", "time": "15:30"},
        "meeting_frequency": MeetingFrequency.weekly.value,
        "max_members": 30,
        "objectives": ["Compete in robotics challenges", "Mentor junior students"],
    }

    create_response = await test_client.post("/api/v1/clubs/", json=create_payload)
    assert create_response.status_code == status.HTTP_201_CREATED
    created_club = create_response.json()
    club_id = created_club["id"]
    assert created_club["name"] == club_name
    assert created_club["teacher_in_charge_id"] == teacher.teacher_id
    assert created_club["current_member_count"] == 0

    list_response = await test_client.get("/api/v1/clubs/")
    assert list_response.status_code == status.HTTP_200_OK
    assert any(item["id"] == club_id for item in list_response.json())

    detail_response = await test_client.get(f"/api/v1/clubs/{club_id}")
    assert detail_response.status_code == status.HTTP_200_OK
    assert detail_response.json()["meeting_frequency"] == MeetingFrequency.weekly.value

    update_payload = {
        "description": "Updated robotics focus",
        "registration_open": False,
        "objectives": ["Host regional events", "Build advanced robots"],
    }
    update_response = await test_client.put(f"/api/v1/clubs/{club_id}", json=update_payload)
    assert update_response.status_code == status.HTTP_200_OK
    updated_club = update_response.json()
    assert updated_club["description"] == update_payload["description"]
    assert updated_club["registration_open"] is False
    assert updated_club["objectives"] == update_payload["objectives"]

    delete_response = await test_client.delete(f"/api/v1/clubs/{club_id}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    missing_response = await test_client.get(f"/api/v1/clubs/{club_id}")
    assert missing_response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_club_membership_workflow_and_student_views(
    test_client: AsyncClient,
    db_session: AsyncSession,
    test_school: dict[str, int],
    test_academic_year,
    test_student: Student,
):
    school_id = test_school["school_id"]
    admin_profile = await _get_profile_with_role(db_session, school_id, "Admin")
    teacher = await _get_teacher_with_profile(db_session, school_id)

    _authenticate_as(admin_profile)

    club_payload = {
        "name": f"Arts-{uuid.uuid4().hex[:6]}",
        "description": "Creative arts and performances",
        "club_type": ClubType.arts.value,
        "teacher_in_charge_id": teacher.teacher_id,
        "academic_year_id": test_academic_year.id,
    }
    create_response = await test_client.post("/api/v1/clubs/", json=club_payload)
    assert create_response.status_code == status.HTTP_201_CREATED
    club_id = create_response.json()["id"]

    teacher_profile = teacher.profile
    _authenticate_as(teacher_profile)

    membership_payload = {
        "club_id": club_id,
        "student_id": test_student.student_id,
        "role": ClubMembershipRole.member.value,
        "status": ClubMembershipStatus.active.value,
    }
    add_member_response = await test_client.post(
        f"/api/v1/clubs/{club_id}/members",
        json=membership_payload,
    )
    assert add_member_response.status_code == status.HTTP_201_CREATED
    membership = add_member_response.json()
    membership_id = membership["id"]
    assert membership["student_id"] == test_student.student_id

    duplicate_response = await test_client.post(
        f"/api/v1/clubs/{club_id}/members",
        json=membership_payload,
    )
    assert duplicate_response.status_code == status.HTTP_400_BAD_REQUEST

    _authenticate_as(admin_profile)
    members_response = await test_client.get(f"/api/v1/clubs/{club_id}/members")
    assert members_response.status_code == status.HTTP_200_OK
    members = members_response.json()
    assert any(member.get("student") and member["student"]["student_id"] == test_student.student_id for member in members)

    _authenticate_as(teacher_profile)
    update_membership_payload = {
        "role": ClubMembershipRole.president.value,
        "contribution_score": 12,
    }
    update_member_response = await test_client.put(
        f"/api/v1/clubs/members/{membership_id}",
        json=update_membership_payload,
    )
    assert update_member_response.status_code == status.HTTP_200_OK
    updated_membership = update_member_response.json()
    assert updated_membership["role"] == ClubMembershipRole.president.value
    assert updated_membership["contribution_score"] == 12

    student_profile_stmt = (
        select(Profile)
        .where(Profile.user_id == test_student.user_id)
        .options(
            selectinload(Profile.student),
            selectinload(Profile.roles).selectinload(UserRole.role_definition),
        )
    )
    student_profile_result = await db_session.execute(student_profile_stmt)
    student_profile = student_profile_result.scalars().first() or test_student.profile
    assert student_profile is not None and student_profile.student is not None

    _authenticate_as(student_profile)
    my_clubs_response = await test_client.get("/api/v1/clubs/my-clubs")
    assert my_clubs_response.status_code == status.HTTP_200_OK, my_clubs_response.json()
    my_clubs = my_clubs_response.json()
    assert any(item["club_id"] == club_id for item in my_clubs)

    _authenticate_as(admin_profile)
    remove_response = await test_client.delete(f"/api/v1/clubs/members/{membership_id}")
    assert remove_response.status_code == status.HTTP_204_NO_CONTENT

    remove_again_response = await test_client.delete(f"/api/v1/clubs/members/{membership_id}")
    assert remove_again_response.status_code == status.HTTP_404_NOT_FOUND

    members_after_delete = await test_client.get(f"/api/v1/clubs/{club_id}/members")
    assert members_after_delete.status_code == status.HTTP_200_OK
    assert not any(member.get("student") and member["student"]["student_id"] == test_student.student_id for member in members_after_delete.json())

    _authenticate_as(student_profile)
    my_clubs_after_delete = await test_client.get("/api/v1/clubs/my-clubs")
    assert my_clubs_after_delete.status_code == status.HTTP_200_OK
    assert all(item["club_id"] != club_id for item in my_clubs_after_delete.json())


@pytest.mark.asyncio
async def test_remove_member_by_student_identifier(
    test_client: AsyncClient,
    db_session: AsyncSession,
    test_school: dict[str, int],
    test_academic_year,
    test_student: Student,
):
    school_id = test_school["school_id"]
    admin_profile = await _get_profile_with_role(db_session, school_id, "Admin")
    teacher = await _get_teacher_with_profile(db_session, school_id)

    _authenticate_as(admin_profile)
    club_payload = {
        "name": f"Science-{uuid.uuid4().hex[:6]}",
        "description": "Hands-on experiments",
        "club_type": ClubType.technical.value,
        "teacher_in_charge_id": teacher.teacher_id,
        "academic_year_id": test_academic_year.id,
    }
    create_response = await test_client.post("/api/v1/clubs/", json=club_payload)
    assert create_response.status_code == status.HTTP_201_CREATED
    club_id = create_response.json()["id"]

    _authenticate_as(teacher.profile)
    membership_payload = {
        "club_id": club_id,
        "student_id": test_student.student_id,
        "role": ClubMembershipRole.member.value,
    }
    add_member_response = await test_client.post(
        f"/api/v1/clubs/{club_id}/members",
        json=membership_payload,
    )
    assert add_member_response.status_code == status.HTTP_201_CREATED

    delete_response = await test_client.delete(f"/api/v1/clubs/{club_id}/members/by-student/{test_student.student_id}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    delete_again_response = await test_client.delete(f"/api/v1/clubs/{club_id}/members/by-student/{test_student.student_id}")
    assert delete_again_response.status_code == status.HTTP_404_NOT_FOUND

    _authenticate_as(admin_profile)
    members_response = await test_client.get(f"/api/v1/clubs/{club_id}/members")
    assert members_response.status_code == status.HTTP_200_OK
    members = members_response.json()
    assert not any(member.get("student") and member["student"]["student_id"] == test_student.student_id for member in members)


@pytest.mark.asyncio
async def test_student_cannot_create_club(
    test_client: AsyncClient,
    db_session: AsyncSession,
    test_school: dict[str, int],
    test_academic_year,
    test_student: Student,
):
    school_id = test_school["school_id"]
    teacher = await _get_teacher_with_profile(db_session, school_id)

    student_profile_stmt = (
        select(Profile)
        .where(Profile.user_id == test_student.user_id)
        .options(
            selectinload(Profile.student),
            selectinload(Profile.roles).selectinload(UserRole.role_definition),
        )
    )
    student_profile_result = await db_session.execute(student_profile_stmt)
    student_profile = student_profile_result.scalars().first() or test_student.profile
    assert student_profile is not None

    _authenticate_as(student_profile)

    create_payload = {
        "name": "Unauthorized Club",
        "description": "Should not be created",
        "club_type": ClubType.social.value,
        "teacher_in_charge_id": teacher.teacher_id,
        "academic_year_id": test_academic_year.id,
    }

    response = await test_client.post("/api/v1/clubs/", json=create_payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_membership_requires_matching_club_id(
    test_client: AsyncClient,
    db_session: AsyncSession,
    test_school: dict[str, int],
    test_academic_year,
    test_student: Student,
):
    school_id = test_school["school_id"]
    admin_profile = await _get_profile_with_role(db_session, school_id, "Admin")
    teacher = await _get_teacher_with_profile(db_session, school_id)

    _authenticate_as(admin_profile)

    create_payload = {
        "name": f"Music-{uuid.uuid4().hex[:6]}",
        "club_type": ClubType.arts.value,
        "teacher_in_charge_id": teacher.teacher_id,
        "academic_year_id": test_academic_year.id,
    }
    create_response = await test_client.post("/api/v1/clubs/", json=create_payload)
    assert create_response.status_code == status.HTTP_201_CREATED
    club_id = create_response.json()["id"]

    membership_payload = {
        "club_id": club_id + 1,
        "student_id": test_student.student_id,
        "role": ClubMembershipRole.member.value,
        "status": ClubMembershipStatus.active.value,
    }

    mismatch_response = await test_client.post(
        f"/api/v1/clubs/{club_id}/members",
        json=membership_payload,
    )
    assert mismatch_response.status_code == status.HTTP_400_BAD_REQUEST
    assert mismatch_response.json()["detail"] == "Club ID mismatch"


@pytest.mark.asyncio
async def test_club_activity_lifecycle(
    test_client: AsyncClient,
    db_session: AsyncSession,
    test_school: dict[str, int],
    test_academic_year,
):
    school_id = test_school["school_id"]
    admin_profile = await _get_profile_with_role(db_session, school_id, "Admin")
    teacher = await _get_teacher_with_profile(db_session, school_id)

    _authenticate_as(admin_profile)

    create_payload = {
        "name": f"Science-{uuid.uuid4().hex[:6]}",
        "description": "Hands-on science experiments",
        "club_type": ClubType.academic.value,
        "teacher_in_charge_id": teacher.teacher_id,
        "academic_year_id": test_academic_year.id,
    }
    create_response = await test_client.post("/api/v1/clubs/", json=create_payload)
    assert create_response.status_code == status.HTTP_201_CREATED
    club_id = create_response.json()["id"]

    activity_payload = {
        "activity_name": "Robotics Workshop",
        "activity_type": ClubActivityType.workshop.value,
        "description": "Intro to robotics fundamentals",
        "scheduled_date": (date.today() + timedelta(days=2)).isoformat(),
        "venue": "Lab 3",
        "attendance_mandatory": True,
        "status": ClubActivityStatus.planned.value,
    }

    create_activity_response = await test_client.post(
        f"/api/v1/clubs/{club_id}/activities",
        json=activity_payload,
    )
    assert create_activity_response.status_code == status.HTTP_201_CREATED
    activity = create_activity_response.json()
    activity_id = activity["id"]
    assert activity["activity_type"] == ClubActivityType.workshop.value

    list_response = await test_client.get(f"/api/v1/clubs/{club_id}/activities")
    assert list_response.status_code == status.HTTP_200_OK
    assert any(item["id"] == activity_id for item in list_response.json())

    upcoming_response = await test_client.get("/api/v1/clubs/activities/upcoming")
    assert upcoming_response.status_code == status.HTTP_200_OK
    assert any(item["id"] == activity_id for item in upcoming_response.json())

    update_activity_payload = {
        "status": ClubActivityStatus.ongoing.value,
        "venue": "Innovation Hub",
    }
    update_activity_response = await test_client.put(
        f"/api/v1/clubs/activities/{activity_id}",
        json=update_activity_payload,
    )
    assert update_activity_response.status_code == status.HTTP_200_OK
    updated_activity = update_activity_response.json()
    assert updated_activity["status"] == ClubActivityStatus.ongoing.value
    assert updated_activity["venue"] == "Innovation Hub"

    delete_activity_response = await test_client.delete(f"/api/v1/clubs/activities/{activity_id}")
    assert delete_activity_response.status_code == status.HTTP_204_NO_CONTENT

    delete_again_response = await test_client.delete(f"/api/v1/clubs/activities/{activity_id}")
    assert delete_again_response.status_code == status.HTTP_404_NOT_FOUND

    activities_after_delete = await test_client.get(f"/api/v1/clubs/{club_id}/activities")
    assert activities_after_delete.status_code == status.HTTP_200_OK
    assert all(item["id"] != activity_id for item in activities_after_delete.json())

    upcoming_after_delete = await test_client.get("/api/v1/clubs/activities/upcoming")
    assert upcoming_after_delete.status_code == status.HTTP_200_OK
    assert all(item["id"] != activity_id for item in upcoming_after_delete.json())


@pytest.mark.asyncio
async def test_club_isolated_from_other_schools(
    test_client: AsyncClient,
    db_session: AsyncSession,
    test_school: dict[str, int],
    test_school_two: dict[str, int],
    test_academic_year,
):
    school_one_id = test_school["school_id"]
    school_two_id = test_school_two["school_id"]

    admin_school_one = await _get_profile_with_role(db_session, school_one_id, "Admin")
    admin_school_two = await _get_profile_with_role(db_session, school_two_id, "Admin")
    teacher_school_one = await _get_teacher_with_profile(db_session, school_one_id)

    _authenticate_as(admin_school_one)
    create_payload = {
        "name": f"Eco-{uuid.uuid4().hex[:6]}",
        "club_type": ClubType.social.value,
        "teacher_in_charge_id": teacher_school_one.teacher_id,
        "academic_year_id": test_academic_year.id,
    }
    club_response = await test_client.post("/api/v1/clubs/", json=create_payload)
    assert club_response.status_code == status.HTTP_201_CREATED
    club_id = club_response.json()["id"]

    _authenticate_as(admin_school_two)
    detail_response = await test_client.get(f"/api/v1/clubs/{club_id}")
    assert detail_response.status_code == status.HTTP_404_NOT_FOUND

    update_response = await test_client.put(
        f"/api/v1/clubs/{club_id}",
        json={"description": "Unauthorized update"},
    )
    assert update_response.status_code == status.HTTP_404_NOT_FOUND

    delete_response = await test_client.delete(f"/api/v1/clubs/{club_id}")
    assert delete_response.status_code == status.HTTP_404_NOT_FOUND
