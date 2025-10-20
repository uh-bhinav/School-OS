from typing import Any

import pytest
import pytest_asyncio
from fastapi import status
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.main import app
from app.models.album import Album
from app.models.profile import Profile
from app.schemas.album_schema import AccessScope, AlbumType
from app.schemas.album_target_schema import AlbumTargetType
from tests.utils.albums import (
    clear_school_albums,
    create_album_record,
    ensure_school,
    get_profile_with_role,
    get_student_context,
)

SCHOOL_ID = 1


@pytest_asyncio.fixture
async def teacher_profile(db_session: AsyncSession) -> Profile:
    return await get_profile_with_role(db_session, "Teacher", school_id=SCHOOL_ID)


@pytest_asyncio.fixture
async def student_setup(db_session: AsyncSession) -> dict[str, Any]:
    profile, student, class_obj = await get_student_context(db_session, SCHOOL_ID)
    return {
        "profile": profile,
        "student": student,
        "class": class_obj,
        "grade_level": class_obj.grade_level,
        "school_id": profile.school_id,
    }


@pytest_asyncio.fixture
async def clean_school_album_data(db_session: AsyncSession) -> None:
    await clear_school_albums(db_session, school_id=SCHOOL_ID)


@pytest.mark.asyncio
async def test_create_album_as_teacher_success(
    test_client: AsyncClient,
    db_session: AsyncSession,
    teacher_profile: Profile,
    clean_school_album_data: None,
) -> None:
    teacher_school_id = teacher_profile.school_id
    teacher_user_id = teacher_profile.user_id

    async def override_current_user() -> Profile:
        return teacher_profile

    app.dependency_overrides[get_current_user_profile] = override_current_user

    payload = {
        "title": "Grade 7 Field Trip Photos",
        "is_public": False,
        "album_type": AlbumType.CULTURAL.value,
        "access_scope": AccessScope.TARGETED.value,
        "school_id": teacher_school_id,
        "targets": [
            {"target_type": AlbumTargetType.GRADE.value, "target_id": 7},
        ],
    }

    response = await test_client.post("/v1/albums/", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["album_type"] == AlbumType.CULTURAL.value
    assert data["access_scope"] == AccessScope.TARGETED.value
    assert data["school_id"] == teacher_school_id
    assert len(data["targets"]) == 1
    assert data["targets"][0]["target_type"] == AlbumTargetType.GRADE.value
    assert data["targets"][0]["target_id"] == 7

    stmt = select(Album).where(Album.id == data["id"])
    result = await db_session.execute(stmt)
    persisted = result.scalar_one_or_none()
    assert persisted is not None
    assert persisted.published_by_id == teacher_user_id

    app.dependency_overrides.pop(get_current_user_profile, None)


@pytest.mark.asyncio
async def test_create_album_as_student_forbidden(
    test_client: AsyncClient,
    student_setup: dict[str, Any],
) -> None:
    student_profile: Profile = student_setup["profile"]

    async def override_current_user() -> Profile:
        return student_profile

    app.dependency_overrides[get_current_user_profile] = override_current_user

    payload = {
        "title": "Student Secret Album",
        "is_public": False,
        "album_type": AlbumType.CULTURAL.value,
        "access_scope": AccessScope.PRIVATE.value,
        "school_id": student_profile.school_id,
        "targets": [],
    }

    response = await test_client.post("/v1/albums/", json=payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json()["detail"] == "Not authorized to create albums"

    app.dependency_overrides.pop(get_current_user_profile, None)


@pytest.mark.asyncio
async def test_list_accessible_albums_as_student(
    test_client: AsyncClient,
    db_session: AsyncSession,
    teacher_profile: Profile,
    student_setup: dict[str, Any],
    clean_school_album_data: None,
) -> None:
    student_profile: Profile = student_setup["profile"]
    student = student_setup["student"]
    class_obj = student_setup["class"]
    grade_level = student_setup["grade_level"]

    school_id = student_setup["school_id"]

    public_album = await create_album_record(
        db_session,
        school_id=school_id,
        published_by_id=teacher_profile.user_id,
        title="Public Album",
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.PUBLIC,
    )

    grade_album = await create_album_record(
        db_session,
        school_id=school_id,
        published_by_id=teacher_profile.user_id,
        title="Grade Targeted",
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.TARGETED,
        targets=[
            {
                "target_type": AlbumTargetType.GRADE.value,
                "target_id": grade_level,
            }
        ],
    )

    class_album = await create_album_record(
        db_session,
        school_id=school_id,
        published_by_id=teacher_profile.user_id,
        title="Class Targeted",
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.TARGETED,
        targets=[
            {
                "target_type": AlbumTargetType.CLASS.value,
                "target_id": class_obj.class_id,
            }
        ],
    )

    student_album = await create_album_record(
        db_session,
        school_id=school_id,
        published_by_id=teacher_profile.user_id,
        title="Individual Student",
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.TARGETED,
        targets=[
            {
                "target_type": AlbumTargetType.INDIVIDUAL_STUDENT.value,
                "target_id": student.student_id,
            }
        ],
    )

    await create_album_record(
        db_session,
        school_id=school_id,
        published_by_id=teacher_profile.user_id,
        title="Different Grade",
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.TARGETED,
        targets=[
            {
                "target_type": AlbumTargetType.GRADE.value,
                "target_id": grade_level + 1,
            }
        ],
    )

    async def override_current_user() -> Profile:
        return student_profile

    app.dependency_overrides[get_current_user_profile] = override_current_user
    response = await test_client.get("/v1/albums/")
    app.dependency_overrides.pop(get_current_user_profile, None)

    assert response.status_code == status.HTTP_200_OK
    accessible_albums = response.json()
    assert isinstance(accessible_albums, list)

    accessible_ids = {album["id"] for album in accessible_albums}
    assert public_album.id in accessible_ids
    assert grade_album.id in accessible_ids
    assert class_album.id in accessible_ids
    assert student_album.id in accessible_ids
    assert len(accessible_albums) == 4


@pytest.mark.asyncio
async def test_get_album_details_as_student_success(
    test_client: AsyncClient,
    db_session: AsyncSession,
    teacher_profile: Profile,
    student_setup: dict[str, Any],
    clean_school_album_data: None,
) -> None:
    student_profile: Profile = student_setup["profile"]
    student = student_setup["student"]

    school_id = student_setup["school_id"]

    album = await create_album_record(
        db_session,
        school_id=school_id,
        published_by_id=teacher_profile.user_id,
        title="Accessible Album",
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.TARGETED,
        targets=[
            {
                "target_type": AlbumTargetType.INDIVIDUAL_STUDENT.value,
                "target_id": student.student_id,
            }
        ],
    )

    async def override_current_user() -> Profile:
        return student_profile

    app.dependency_overrides[get_current_user_profile] = override_current_user
    response = await test_client.get(f"/v1/albums/{album.id}")
    app.dependency_overrides.pop(get_current_user_profile, None)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == album.id
    assert data["title"] == "Accessible Album"
    assert data["school_id"] == school_id
    assert data["access_scope"] == AccessScope.TARGETED.value


@pytest.mark.asyncio
async def test_get_album_details_as_student_forbidden(
    test_client: AsyncClient,
    db_session: AsyncSession,
    teacher_profile: Profile,
    student_setup: dict[str, Any],
    clean_school_album_data: None,
) -> None:
    student_profile: Profile = student_setup["profile"]
    grade_level = student_setup["grade_level"]

    school_id = student_setup["school_id"]

    wrong_grade_album = await create_album_record(
        db_session,
        school_id=school_id,
        published_by_id=teacher_profile.user_id,
        title="Wrong Grade",
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.TARGETED,
        targets=[
            {
                "target_type": AlbumTargetType.GRADE.value,
                "target_id": grade_level + 1,
            }
        ],
    )

    other_school = await ensure_school(db_session, school_id=school_id + 1)
    other_school_album = await create_album_record(
        db_session,
        school_id=other_school.school_id,
        published_by_id=teacher_profile.user_id,
        title="Other School",
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.PUBLIC,
    )

    async def override_current_user() -> Profile:
        return student_profile

    app.dependency_overrides[get_current_user_profile] = override_current_user

    response_wrong_grade = await test_client.get(f"/v1/albums/{wrong_grade_album.id}")
    assert response_wrong_grade.status_code == status.HTTP_403_FORBIDDEN
    assert response_wrong_grade.json()["detail"] == "Not authorized to view this album"

    response_wrong_school = await test_client.get(f"/v1/albums/{other_school_album.id}")
    assert response_wrong_school.status_code == status.HTTP_404_NOT_FOUND
    assert response_wrong_school.json()["detail"] == "Album not found"

    app.dependency_overrides.pop(get_current_user_profile, None)
