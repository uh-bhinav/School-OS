# tests/unit/test_album_service.py

import uuid
from unittest.mock import AsyncMock, MagicMock, patch  # For mocking

import pytest
from sqlalchemy.ext.asyncio import AsyncSession  # We'll mock this async session

from app.models.album import Album
from app.schemas.album_schema import AccessScope, AlbumCreate, AlbumType
from app.schemas.album_target_schema import AlbumTargetCreate, AlbumTargetType

# Import the service and schemas being tested
from app.services.album_service import AlbumService


# Mock the dependent service
# Patch the instance used within album_service.py
@patch("app.services.album_service.album_target_service", autospec=True)
@pytest.mark.asyncio
async def test_create_album_with_targets_success(
    mock_album_target_service: MagicMock,
):
    """
    Unit Test: Test successful creation of an album with its targets.
    Verifies that the album is created and the target service is called correctly.
    """
    # --- Arrange ---
    mock_db = AsyncMock(spec=AsyncSession)  # Mock the asynchronous session
    added_album: dict[str, Album] = {}

    def add_stub(obj: Album) -> None:
        added_album["instance"] = obj

    async def flush_stub() -> None:
        album = added_album.get("instance")
        if album is not None:
            album.id = 123

    async def execute_stub(_stmt):
        album = added_album.get("instance")
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = album
        return mock_result

    mock_db.add.side_effect = add_stub
    mock_db.flush.side_effect = flush_stub
    mock_db.execute.side_effect = execute_stub
    mock_db.commit = AsyncMock()
    mock_db.rollback = AsyncMock()
    mock_db.refresh = AsyncMock()
    album_data = AlbumCreate(
        title="Unit Test Album",
        is_public=False,
        album_type=AlbumType.CULTURAL,
        access_scope=AccessScope.TARGETED,
        school_id=1,
        # targets list within AlbumCreate is often just for input validation,
        # the actual targets might be passed separately depending on endpoint
        targets=[],  # Assuming targets are passed separately to the service method
    )
    targets_input = [AlbumTargetCreate(target_type=AlbumTargetType.GRADE, target_id=5)]
    publisher_id = uuid.uuid4()
    school_id_input = 1

    # Configure mock DB methods (add, flush, commit, refresh) if needed,
    # though often just checking calls is sufficient for unit tests.
    # mock_db.add.return_value = None
    # mock_db.flush.return_value = None
    # mock_db.commit.return_value = None
    # mock_db.refresh.return_value = None # Can configure to simulate refresh if needed

    # Mock the return value of the dependent service call
    # mock_album_target_service.create_targets.return_value = [...] # Mocked AlbumTarget objects if needed

    # Instantiate the service (or use the global instance if preferred)
    service = AlbumService()

    mock_album_target_service.create_targets = AsyncMock()

    # --- Act ---
    created_album = await service.create_album_with_targets(db=mock_db, album_data=album_data, targets=targets_input, published_by_id=publisher_id, school_id=school_id_input)

    # --- Assert ---
    # 1. Check if the DB session methods were called as expected
    mock_db.add.assert_called_once()  # Check that an object was added
    mock_db.flush.assert_awaited_once()  # Flush should occur before target creation
    mock_db.commit.assert_awaited_once()  # Commit happens after targets
    mock_db.execute.assert_awaited()  # Ensure the final query executed

    # Get the album object that was added to the session
    added_object = mock_db.add.call_args[0][0]
    assert isinstance(added_object, Album)
    assert added_object.title == album_data.title
    assert added_object.school_id == school_id_input
    assert added_object.published_by_id == publisher_id
    assert added_object.album_type == album_data.album_type.value
    assert added_object.access_scope == album_data.access_scope.value

    # 2. Check if the dependent service (album_target_service.create_targets) was called correctly
    mock_album_target_service.create_targets.assert_awaited_once()
    # Check the arguments passed to the mock service
    awaited_call = mock_album_target_service.create_targets.await_args
    assert awaited_call.args[0] == mock_db
    assert awaited_call.kwargs.get("album_id") == added_object.id
    assert awaited_call.kwargs.get("targets") == targets_input

    # 3. Check the returned object (optional, depends on mocking refresh)
    assert isinstance(created_album, Album)
    assert created_album.title == album_data.title
    # Note: If db.refresh isn't mocked specifically, the returned object might
    # just be the instance created before commit/refresh.


def create_mock_album(album_id: int, title: str, school_id: int, access_scope: str) -> Album:
    """Helper to create a mock Album object."""
    album = Album(id=album_id, title=title, school_id=school_id, access_scope=access_scope)
    # Mock relationship attributes if needed, e.g., album.targets = []
    return album


@pytest.mark.asyncio
async def test_get_accessible_albums_student_sees_public_and_targeted() -> None:
    """
    Unit Test: Test get_accessible_albums for a student.
    Verifies that the correct query is constructed and returns expected albums.
    """
    # --- Arrange ---
    mock_db = AsyncMock(spec=AsyncSession)
    service = AlbumService()

    user_context = {"school_id": 1, "grade_level": 7, "current_class_id": 101, "user_id": uuid.uuid4()}  # Mock student user ID
    mock_student_id = 50  # Mock student_id corresponding to user_id

    # Mock Albums expected to be returned
    public_album_1 = create_mock_album(1, "Public Event", 1, AccessScope.PUBLIC.value)
    grade_album_7 = create_mock_album(2, "Grade 7 Stuff", 1, AccessScope.TARGETED.value)
    class_album_101 = create_mock_album(3, "Class 101 News", 1, AccessScope.TARGETED.value)
    student_album_50 = create_mock_album(4, "My Award", 1, AccessScope.TARGETED.value)
    # Mock the database execute method's behavior
    mock_result_student = MagicMock()
    mock_result_student.scalar_one_or_none.return_value = mock_student_id

    mock_scalar_result = MagicMock()
    mock_scalar_result.unique.return_value.all.return_value = [
        public_album_1,
        grade_album_7,
        class_album_101,
        student_album_50,
    ]

    mock_result_albums = MagicMock()
    mock_result_albums.scalars.return_value = mock_scalar_result

    # Configure mock_db.execute to return different results based on the query structure
    async def execute_side_effect(statement):
        # Rough check to differentiate the student query from the album query
        if "students" in str(statement).lower():
            return mock_result_student
        if "albums" in str(statement).lower():
            return mock_result_albums
        return MagicMock()

    mock_db.execute.side_effect = execute_side_effect

    # --- Act ---
    accessible_albums = await service.get_accessible_albums(db=mock_db, user_context=user_context)

    # --- Assert ---
    # 1. Check database calls
    # Should execute once for student lookup, once for albums
    assert mock_db.execute.call_count == 2

    # Verify the student lookup call (check statement structure if needed)
    # student_call = mock_db.execute.call_args_list[0]
    # More rigorous check: assert 'WHERE students.user_id =' in str(student_call.args[0])

    # Verify the album query call (check statement structure if needed)
    # album_call = mock_db.execute.call_args_list[1]
    # More rigorous check: assert 'WHERE albums.school_id =' in str(album_call.args[0])
    # assert 'OR albums.access_scope = ' in str(album_call.args[0]) # Check for public filter
    # assert 'OR albums.id IN (' in str(album_call.args[0]) # Check for targeted filter subquery

    # 2. Check the returned list
    assert len(accessible_albums) == 4
    returned_ids = {album.id for album in accessible_albums}
    assert returned_ids == {1, 2, 3, 4}
    assert 5 not in returned_ids  # Ensure the Grade 8 album wasn't included

    # 3. Check the student mock was called correctly
    mock_result_student.scalar_one_or_none.assert_called_once()
