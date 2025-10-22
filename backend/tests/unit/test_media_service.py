# tests/unit/test_media_service.py

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.album import Album
from app.models.media_item import MediaItem
from app.schemas.album_schema import AccessScope, AlbumType
from app.services.album_target_service import UnauthorizedAccessError

# Import services, models, schemas, errors being tested or mocked
from app.services.media_service import BUCKET_MAP, MediaService


# Mock the dependencies used by MediaService
@patch("app.services.media_service.album_target_service", autospec=True)
@patch("app.services.media_service.storage_client", autospec=True)
@pytest.mark.asyncio
async def test_generate_signed_url_success_public_album(
    mock_storage_client: MagicMock,
    mock_album_target_service: MagicMock,
):
    """
    Unit Test: Successfully generate a signed URL for a public album.
    Verifies access checks pass and storage client is called.
    """
    # --- Arrange ---
    mock_db = AsyncMock(spec=AsyncSession)
    service = MediaService()

    media_item_id = 1
    user_context = {"school_id": 1, "user_id": uuid.uuid4()}  # Example context
    expected_signed_url = "https://mockstorage.com/signed/url"

    # Create mock Album and MediaItem objects
    mock_album = Album(
        id=10,
        school_id=1,
        album_type=AlbumType.CULTURAL.value,
        access_scope=AccessScope.PUBLIC.value,  # Public album
    )
    mock_media_item = MediaItem(id=media_item_id, album_id=mock_album.id, storage_path="10/some_image.jpg", mime_type="image/jpeg", album=mock_album)  # Mock the relationship

    # Configure mock DB execute to return the media item
    mock_scalar_result = MagicMock()
    mock_scalar_result.first.return_value = mock_media_item
    mock_result_media = MagicMock()
    mock_result_media.scalars.return_value = mock_scalar_result
    mock_db.execute.return_value = mock_result_media

    # Configure mock album_target_service (still invoked, but public access bypasses result)
    mock_album_target_service.validate_user_access = AsyncMock(return_value=False)

    # Configure mock storage_client
    mock_storage_client.generate_signed_url.return_value = expected_signed_url

    # --- Act ---
    signed_url = await service.generate_signed_url(db=mock_db, media_item_id=media_item_id, user_context=user_context)

    # --- Assert ---
    # 1. Check DB call
    mock_db.execute.assert_awaited_once()
    # Optionally: inspect the statement passed to execute to ensure it queried MediaItem by ID

    # 2. Ensure album_target_service was invoked and awaited with expected args
    mock_album_target_service.validate_user_access.assert_awaited_once_with(
        mock_db,
        album_id=mock_album.id,
        user_context=user_context,
    )

    # 3. Check storage_client call
    expected_bucket = BUCKET_MAP.get(mock_album.album_type)
    mock_storage_client.generate_signed_url.assert_called_once_with(bucket=expected_bucket, path=mock_media_item.storage_path, expires_in=3600)  # Default expiry

    # 4. Check return value
    assert signed_url == expected_signed_url


@patch("app.services.media_service.album_target_service", autospec=True)
@patch("app.services.media_service.storage_client", autospec=True)
@pytest.mark.asyncio
async def test_generate_signed_url_success_targeted_album(
    mock_storage_client: MagicMock,
    mock_album_target_service: MagicMock,
):
    """
    Unit Test: Successfully generate signed URL for a targeted album user has access to.
    Verifies access checks pass and storage client is called.
    """
    # --- Arrange ---
    mock_db = AsyncMock(spec=AsyncSession)
    service = MediaService()

    media_item_id = 2
    user_context = {"school_id": 1, "user_id": uuid.uuid4(), "grade_level": 7}
    expected_signed_url = "https://mockstorage.com/signed/url2"

    # Mock Album (targeted) and MediaItem
    mock_album = Album(
        id=11,
        school_id=1,
        album_type=AlbumType.ECOMMERCE.value,  # Different type
        access_scope=AccessScope.TARGETED.value,  # Targeted album
    )
    mock_media_item = MediaItem(id=media_item_id, album_id=mock_album.id, storage_path="11/product.png", mime_type="image/png", album=mock_album)

    # Mock DB execute
    mock_scalar_result = MagicMock()
    mock_scalar_result.first.return_value = mock_media_item
    mock_result_media = MagicMock()
    mock_result_media.scalars.return_value = mock_scalar_result
    mock_db.execute.return_value = mock_result_media

    # Configure mock album_target_service (SHOULD be called and return True)
    mock_album_target_service.validate_user_access = AsyncMock(return_value=True)

    # Configure mock storage_client
    mock_storage_client.generate_signed_url.return_value = expected_signed_url

    # --- Act ---
    signed_url = await service.generate_signed_url(db=mock_db, media_item_id=media_item_id, user_context=user_context)

    # --- Assert ---
    # 1. Check DB call
    mock_db.execute.assert_awaited_once()

    # 2. Check album_target_service WAS called for targeted album
    mock_album_target_service.validate_user_access.assert_awaited_once_with(
        mock_db,
        album_id=mock_album.id,
        user_context=user_context,
    )

    # 3. Check storage_client call
    expected_bucket = BUCKET_MAP.get(mock_album.album_type)
    mock_storage_client.generate_signed_url.assert_called_once_with(bucket=expected_bucket, path=mock_media_item.storage_path, expires_in=3600)

    # 4. Check return value
    assert signed_url == expected_signed_url


@patch("app.services.media_service.storage_client", autospec=True)
@patch("uuid.uuid4")  # Patch uuid4 to control generated filename
@pytest.mark.asyncio
async def test_upload_media_item_success(
    mock_uuid4: MagicMock,
    mock_storage_client: MagicMock,
):
    """
    Unit Test: Test successful upload of a media item.
    Verifies bucket determination, storage call, and DB record creation.
    """
    # --- Arrange ---
    mock_db = AsyncMock(spec=AsyncSession)
    service = MediaService()

    album_id = 15
    uploaded_by_id = uuid.UUID("11111111-1111-1111-1111-111111111111")
    album_type = AlbumType.ECOMMERCE.value
    expected_bucket = BUCKET_MAP.get(album_type)
    mock_generated_uuid = uuid.UUID("22222222-2222-2222-2222-222222222222")

    # Mock the Album object that get_bucket_for_album would query
    mock_album = Album(id=album_id, school_id=1, album_type=album_type)

    # Configure mock DB execute to return the album
    mock_result_album = MagicMock()
    mock_result_album.scalar_one_or_none.return_value = mock_album
    mock_db.execute.return_value = mock_result_album

    # Mock UploadFile
    file_content = b"ecommerce product image bytes"
    file_name = "product.jpg"
    file_mime_type = "image/jpeg"
    # Need to mock the 'read' method as awaitable
    mock_upload_file = MagicMock(spec=UploadFile)
    mock_upload_file.filename = file_name
    mock_upload_file.content_type = file_mime_type
    mock_upload_file.read = AsyncMock(return_value=file_content)  # Mock async read

    # Configure uuid4 mock
    mock_uuid4.return_value = mock_generated_uuid
    expected_storage_path = f"{album_id}/{mock_generated_uuid}.jpg"

    # Configure storage client mock (no return value needed for upload)
    mock_storage_client.upload_file.return_value = None

    # Configure DB mocks for adding the MediaItem
    added_media_item = None

    def add_stub(obj):
        nonlocal added_media_item
        if isinstance(obj, MediaItem):
            added_media_item = obj

    mock_db.add.side_effect = add_stub
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    # --- Act ---
    created_media_item = await service.upload_media_item(db=mock_db, album_id=album_id, file=mock_upload_file, uploaded_by_id=uploaded_by_id)

    # --- Assert ---
    # 1. Check DB call to get album type
    mock_db.execute.assert_awaited_once()
    # Optionally: check the specific query for the album

    # 2. Check storage client call
    mock_storage_client.upload_file.assert_called_once_with(bucket=expected_bucket, path=expected_storage_path, file=file_content, mime_type=file_mime_type)
    # Ensure uuid4 was called to generate the path component
    mock_uuid4.assert_called_once()

    # 3. Check DB calls for creating MediaItem
    mock_db.add.assert_called_once()
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(added_media_item)  # Check refresh called on the added item

    # 4. Check the MediaItem object passed to db.add
    assert added_media_item is not None
    assert isinstance(added_media_item, MediaItem)
    assert added_media_item.album_id == album_id
    assert added_media_item.storage_path == expected_storage_path
    assert added_media_item.mime_type == file_mime_type
    assert added_media_item.file_size_bytes == len(file_content)
    assert added_media_item.uploaded_by_id == str(uploaded_by_id)

    # 5. Check return value (should be the added media item)
    assert created_media_item == added_media_item


@patch("app.services.media_service.storage_client", autospec=True)
@pytest.mark.asyncio
async def test_delete_own_media_item_success(
    mock_storage_client: MagicMock,
):
    """
    Unit Test: Test successful deletion of a media item by its uploader.
    Verifies ownership check, storage deletion, and DB deletion calls.
    """
    # --- Arrange ---
    mock_db = AsyncMock(spec=AsyncSession)
    service = MediaService()

    media_item_id = 5
    uploader_user_id = uuid.uuid4()  # The user performing the delete
    album_type = AlbumType.PROFILE.value

    # Mock Album and MediaItem (including uploader ID)
    mock_album = Album(id=20, school_id=1, album_type=album_type)
    mock_media_item = MediaItem(id=media_item_id, album_id=mock_album.id, storage_path="20/profile.png", mime_type="image/png", uploaded_by_id=uploader_user_id, album=mock_album)  # This user uploaded it

    # Configure mock DB execute to return the media item
    # Use the MagicMock chain for scalars().first()
    mock_result_media = MagicMock()
    mock_scalars = MagicMock()
    mock_scalars.first.return_value = mock_media_item
    mock_result_media.scalars.return_value = mock_scalars
    mock_result_media.scalar_one_or_none.return_value = mock_media_item
    mock_db.execute.return_value = mock_result_media

    # Configure storage client mock
    mock_storage_client.delete_file.return_value = None

    # Configure DB delete and commit mocks
    mock_db.delete = AsyncMock()
    mock_db.commit = AsyncMock()

    # --- Act ---
    await service.delete_media_item(db=mock_db, media_item_id=media_item_id, user_id=uploader_user_id)  # The same user is requesting deletion

    # --- Assert ---
    # 1. Check DB query to fetch the item
    mock_db.execute.assert_awaited_once()

    # 2. Check storage client call
    expected_bucket = BUCKET_MAP.get(album_type)
    mock_storage_client.delete_file.assert_called_once_with(bucket=expected_bucket, path=mock_media_item.storage_path)

    # 3. Check DB delete and commit calls
    mock_db.delete.assert_awaited_once_with(mock_media_item)
    mock_db.commit.assert_awaited_once()


@patch("app.services.media_service.storage_client", autospec=True)
@pytest.mark.asyncio
async def test_delete_others_media_item_forbidden(
    mock_storage_client: MagicMock,
):
    """
    Unit Test: Test that deleting another user's media item raises UnauthorizedAccessError.
    Verifies ownership check fails and delete operations are not called.
    """
    # --- Arrange ---
    mock_db = AsyncMock(spec=AsyncSession)
    service = MediaService()

    media_item_id = 6
    original_uploader_id = uuid.uuid4()
    different_user_id = uuid.uuid4()  # A different user trying to delete

    # Mock Album and MediaItem
    mock_album = Album(id=21, school_id=1, album_type=AlbumType.CULTURAL.value)
    mock_media_item = MediaItem(id=media_item_id, album_id=mock_album.id, storage_path="21/event.jpg", mime_type="image/jpeg", uploaded_by_id=original_uploader_id, album=mock_album)  # Uploaded by someone else

    # Mock DB execute
    mock_result_media = MagicMock()
    mock_scalars = MagicMock()
    mock_scalars.first.return_value = mock_media_item
    mock_result_media.scalars.return_value = mock_scalars
    mock_result_media.scalar_one_or_none.return_value = mock_media_item
    mock_db.execute.return_value = mock_result_media

    # Configure storage client (should not be called)
    mock_storage_client.delete_file = MagicMock()

    # Configure DB delete/commit (should not be called)
    mock_db.delete = AsyncMock()
    mock_db.commit = AsyncMock()

    # --- Act & Assert ---
    with pytest.raises(UnauthorizedAccessError) as exc_info:
        await service.delete_media_item(db=mock_db, media_item_id=media_item_id, user_id=different_user_id)  # Different user requesting deletion

    # Check the exception details
    assert str(exc_info.value.detail) == "You can only delete your own media."

    # Verify DB query happened to fetch item
    mock_db.execute.assert_awaited_once()

    # Verify delete operations were NOT called
    mock_storage_client.delete_file.assert_not_called()
    mock_db.delete.assert_not_awaited()
    mock_db.commit.assert_not_awaited()
