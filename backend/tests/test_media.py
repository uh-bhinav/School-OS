from __future__ import annotations

import io
from typing import Any

import pytest
import pytest_asyncio
from fastapi import status
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.core.storage import storage_client
from app.main import app
from app.models.media_item import MediaItem
from app.models.profile import Profile
from app.schemas.album_schema import AccessScope, AlbumType
from app.schemas.album_target_schema import AlbumTargetType
from tests.utils.albums import create_album_record, get_profile_with_role, get_student_context

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


def _override_user(profile: Profile) -> None:
    async def dependency() -> Profile:
        return profile

    app.dependency_overrides[get_current_user_profile] = dependency


def _clear_user_override() -> None:
    app.dependency_overrides.pop(get_current_user_profile, None)


@pytest.mark.asyncio
async def test_upload_media_to_album_success(
    test_client: AsyncClient,
    db_session: AsyncSession,
    teacher_profile: Profile,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    album = await create_album_record(
        db_session,
        school_id=teacher_profile.school_id,
        published_by_id=teacher_profile.user_id,
        title="Teacher Upload Album",
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.PUBLIC,
    )

    monkeypatch.setattr(
        storage_client,
        "upload_file",
        lambda bucket, path, file, mime_type: path,
    )

    _override_user(teacher_profile)
    try:
        file_content = b"sample media bytes"
        response = await test_client.post(
            "/v1/media/upload",
            data={"album_id": str(album.id)},
            files={"file": ("field_trip.jpg", io.BytesIO(file_content), "image/jpeg")},
        )
    finally:
        _clear_user_override()

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["album_id"] == album.id
    assert data["mime_type"] == "image/jpeg"
    assert data["file_size_bytes"] == len(file_content)
    assert data["signed_url"] is None

    stmt = select(MediaItem).where(MediaItem.id == data["id"])
    result = await db_session.execute(stmt)
    media_item = result.scalar_one_or_none()
    assert media_item is not None
    assert media_item.uploaded_by_id == str(teacher_profile.user_id)
    assert media_item.storage_path.startswith(f"{album.id}/")


@pytest.mark.asyncio
async def test_upload_media_as_student_forbidden(
    test_client: AsyncClient,
    db_session: AsyncSession,
    teacher_profile: Profile,
    student_setup: dict[str, Any],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    album = await create_album_record(
        db_session,
        school_id=teacher_profile.school_id,
        published_by_id=teacher_profile.user_id,
        title="Restricted Album",
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.PUBLIC,
    )

    upload_invoked = False

    def fake_upload(*args, **kwargs):
        nonlocal upload_invoked
        upload_invoked = True
        return "ignored/path"

    monkeypatch.setattr(storage_client, "upload_file", fake_upload)

    _override_user(student_setup["profile"])
    try:
        response = await test_client.post(
            "/v1/media/upload",
            data={"album_id": str(album.id)},
            files={"file": ("unauthorized.txt", io.BytesIO(b"blocked"), "text/plain")},
        )
    finally:
        _clear_user_override()

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json()["detail"] == "Not authorized to upload media"
    assert upload_invoked is False


@pytest.mark.asyncio
async def test_get_signed_url_success(
    test_client: AsyncClient,
    db_session: AsyncSession,
    teacher_profile: Profile,
    student_setup: dict[str, Any],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    grade_level = student_setup["grade_level"]
    class_obj = student_setup["class"]
    student_profile: Profile = student_setup["profile"]

    album = await create_album_record(
        db_session,
        school_id=student_profile.school_id,
        published_by_id=teacher_profile.user_id,
        title="Grade Album",
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.TARGETED,
        targets=[
            {
                "target_type": AlbumTargetType.GRADE.value,
                "target_id": grade_level,
            },
            {
                "target_type": AlbumTargetType.CLASS.value,
                "target_id": class_obj.class_id,
            },
        ],
    )

    monkeypatch.setattr(
        storage_client,
        "upload_file",
        lambda bucket, path, file, mime_type: path,
    )

    expected_url = "https://example.com/signed/path"
    monkeypatch.setattr(
        storage_client,
        "generate_signed_url",
        lambda bucket, path, expires_in: expected_url,
    )

    _override_user(teacher_profile)
    try:
        upload_response = await test_client.post(
            "/v1/media/upload",
            data={"album_id": str(album.id)},
            files={"file": ("class_photo.png", io.BytesIO(b"photo-bytes"), "image/png")},
        )
    finally:
        _clear_user_override()

    assert upload_response.status_code == status.HTTP_201_CREATED
    media_item_id = upload_response.json()["id"]

    _override_user(student_profile)
    try:
        response = await test_client.get(f"/v1/media/{media_item_id}/signed-url")
    finally:
        _clear_user_override()

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["signed_url"] == expected_url
    assert data["expires_in"] == 3600


# tests/integration/test_media.py

# ... (previous imports, helpers, tests ...)


@pytest.mark.asyncio
async def test_get_signed_url_forbidden(
    test_client: AsyncClient,
    db_session: AsyncSession,
    teacher_profile: Profile,
    student_setup: dict[str, Any],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """
    Test Case: Student attempts to get a signed URL for a media item in an album
               they do NOT have access to (e.g., wrong grade target).
    """
    # --- Test Setup ---
    student_profile: Profile = student_setup["profile"]
    student_grade_level = student_setup["grade_level"]
    wrong_grade_level = student_grade_level + 1  # Target a different grade

    # 1. Create an album targeted at a different grade
    inaccessible_album = await create_album_record(
        db_session,
        school_id=student_profile.school_id,
        published_by_id=teacher_profile.user_id,
        title=f"Grade {wrong_grade_level} Album - Restricted",
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.TARGETED,
        targets=[
            {
                "target_type": AlbumTargetType.GRADE.value,
                "target_id": wrong_grade_level,
            }
        ],
    )

    # Mock storage client upload for setup
    monkeypatch.setattr(
        storage_client,
        "upload_file",
        lambda bucket, path, file, mime_type: path,
    )

    # 2. Upload a media item to this inaccessible album (as teacher)
    _override_user(teacher_profile)
    try:
        upload_response = await test_client.post(
            "/v1/media/upload",
            data={"album_id": str(inaccessible_album.id)},
            files={"file": ("restricted_photo.png", io.BytesIO(b"photo-bytes"), "image/png")},
        )
    finally:
        _clear_user_override()

    assert upload_response.status_code == status.HTTP_201_CREATED
    media_item_id = upload_response.json()["id"]

    # Mock generate_signed_url (it shouldn't be called, but mock defensively)
    generate_url_invoked = False

    def fake_generate_url(*args, **kwargs):
        nonlocal generate_url_invoked
        generate_url_invoked = True
        return "https://should-not-be-generated.com/signed/path"

    monkeypatch.setattr(storage_client, "generate_signed_url", fake_generate_url)

    # --- API Call (as Student) ---
    _override_user(student_profile)  # Act as the student
    try:
        response = await test_client.get(f"/v1/media/{media_item_id}/signed-url")
    finally:
        _clear_user_override()

    # --- Assertions ---
    assert response.status_code == status.HTTP_403_FORBIDDEN
    data = response.json()
    # Check the detail message from UnauthorizedAccessError in media_service
    assert data["detail"] == "User does not have access to this resource"
    assert generate_url_invoked is False  # Ensure the storage client wasn't actually called


@pytest.mark.asyncio
async def test_delete_own_media_item_success(
    test_client: AsyncClient,
    db_session: AsyncSession,
    teacher_profile: Profile,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """
    Test Case: Teacher successfully deletes a media item they uploaded.
    """
    # --- Test Setup ---
    # 1. Create an album
    album = await create_album_record(
        db_session,
        school_id=teacher_profile.school_id,
        published_by_id=teacher_profile.user_id,
        title="Album for Deletion Test",
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.PUBLIC,
    )

    # Mock storage client upload for setup
    monkeypatch.setattr(
        storage_client,
        "upload_file",
        lambda bucket, path, file, mime_type: path,  # Return path on upload
    )

    # 2. Upload a media item (as the teacher)
    _override_user(teacher_profile)
    try:
        upload_response = await test_client.post(
            "/v1/media/upload",
            data={"album_id": str(album.id)},
            files={"file": ("to_be_deleted.jpg", io.BytesIO(b"delete-me"), "image/jpeg")},
        )
    finally:
        _clear_user_override()

    assert upload_response.status_code == status.HTTP_201_CREATED
    media_item_id = upload_response.json()["id"]

    # Verify item exists in DB before delete
    media_item_before = await db_session.get(MediaItem, media_item_id)
    assert media_item_before is not None
    stored_path = media_item_before.storage_path  # Get path for delete mock check

    # 3. Mock storage client delete
    delete_invoked_path = None
    delete_invoked_bucket = None

    def fake_delete_file(bucket: str, path: str):
        nonlocal delete_invoked_path, delete_invoked_bucket
        delete_invoked_bucket = bucket
        delete_invoked_path = path
        # print(f"Mock delete called: bucket={bucket}, path={path}") # For debugging

    monkeypatch.setattr(storage_client, "delete_file", fake_delete_file)

    # --- API Call (as the same teacher) ---
    _override_user(teacher_profile)  # Act as the uploader
    try:
        response = await test_client.delete(f"/v1/media/{media_item_id}")
    finally:
        _clear_user_override()

    # --- Assertions ---
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify item is deleted from DB
    await db_session.flush()  # Ensure session reflects the deletion
    media_item_after = await db_session.get(MediaItem, media_item_id)
    assert media_item_after is None

    # Verify storage client delete was called with correct parameters
    assert delete_invoked_bucket is not None  # Check it was called
    assert delete_invoked_path == stored_path
    # You might want a more specific check on the bucket name if easily derivable
    # album_type = album.album_type
    # expected_bucket = BUCKET_MAP.get(album_type) # Assuming BUCKET_MAP is accessible
    # assert delete_invoked_bucket == expected_bucket


@pytest.mark.asyncio
async def test_delete_others_media_item_forbidden(
    test_client: AsyncClient,
    db_session: AsyncSession,
    teacher_profile: Profile,
    student_setup: dict[str, Any],  # Use student profile for delete attempt
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """
    Test Case: Student attempts to delete a media item uploaded by a teacher and is forbidden.
    """
    # --- Test Setup ---
    # 1. Create an album (publisher doesn't matter much here)
    album = await create_album_record(
        db_session,
        school_id=teacher_profile.school_id,
        published_by_id=teacher_profile.user_id,
        title="Album for Forbidden Deletion Test",
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.PUBLIC,
    )

    # Mock storage client upload for setup
    monkeypatch.setattr(
        storage_client,
        "upload_file",
        lambda bucket, path, file, mime_type: path,
    )

    # 2. Upload a media item (as the TEACHER)
    _override_user(teacher_profile)
    try:
        upload_response = await test_client.post(
            "/v1/media/upload",
            data={"album_id": str(album.id)},
            files={"file": ("teacher_file.jpg", io.BytesIO(b"teacher-content"), "image/jpeg")},
        )
    finally:
        _clear_user_override()

    assert upload_response.status_code == status.HTTP_201_CREATED
    media_item_id = upload_response.json()["id"]

    # Verify item exists
    media_item_before = await db_session.get(MediaItem, media_item_id)
    assert media_item_before is not None
    assert str(media_item_before.uploaded_by_id) == str(teacher_profile.user_id)  # Verify uploader

    # 3. Mock storage client delete (it should NOT be called)
    delete_invoked = False

    def fake_delete_file(bucket: str, path: str):
        nonlocal delete_invoked
        delete_invoked = True

    monkeypatch.setattr(storage_client, "delete_file", fake_delete_file)

    # --- API Call (as STUDENT) ---
    student_profile: Profile = student_setup["profile"]
    _override_user(student_profile)  # Act as the student
    try:
        response = await test_client.delete(f"/v1/media/{media_item_id}")
    finally:
        _clear_user_override()

    # --- Assertions ---
    assert response.status_code == status.HTTP_403_FORBIDDEN
    data = response.json()
    # Check the specific error message from UnauthorizedAccessError in media_service
    assert data["detail"] == "You can only delete your own media."

    # Verify item STILL exists in DB
    await db_session.flush()
    media_item_after = await db_session.get(MediaItem, media_item_id)
    assert media_item_after is not None

    # Verify storage client delete was NOT called
    assert delete_invoked is False
