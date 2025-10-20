# tests/unit/test_album_target_service.py
import uuid
from unittest.mock import AsyncMock, MagicMock, call, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select
from sqlalchemy.sql.dml import Delete

from app.models.album_target import AlbumTarget  # Needed for type checking
from app.schemas.album_target_schema import AlbumTargetCreate, AlbumTargetType

# Import the service and schemas being tested
from app.services.album_target_service import AlbumTargetService


@pytest.mark.asyncio
async def test_create_targets_success():
    """
    Unit Test: Test successful creation of multiple album targets.
    Verifies that targets are added and flushed to the database session.
    """
    # --- Arrange ---
    mock_db = AsyncMock(spec=AsyncSession)
    service = AlbumTargetService()

    album_id = 10
    targets_input = [
        AlbumTargetCreate(target_type=AlbumTargetType.GRADE, target_id=7),
        AlbumTargetCreate(target_type=AlbumTargetType.CLASS, target_id=101),
    ]

    # Capture objects added via add_all
    added_objects_list = []

    def add_all_stub(objects):
        nonlocal added_objects_list
        added_objects_list.extend(objects)

    mock_db.add_all.side_effect = add_all_stub
    mock_db.flush = AsyncMock()
    mock_db.refresh = AsyncMock()

    # --- Act ---
    created_targets = await service.create_targets(db=mock_db, album_id=album_id, targets=targets_input)

    # --- Assert ---
    # 1. Check DB calls
    mock_db.add_all.assert_called_once()
    mock_db.flush.assert_awaited_once()
    # Check that refresh was called for each created target
    assert mock_db.refresh.await_count == len(targets_input)
    refresh_calls = [call(obj) for obj in added_objects_list]
    mock_db.refresh.assert_has_awaits(refresh_calls, any_order=True)

    # 2. Inspect the objects passed to add_all
    assert len(added_objects_list) == len(targets_input)
    assert all(isinstance(obj, AlbumTarget) for obj in added_objects_list)

    # Check attributes of the created objects (order might vary)
    created_target_data = {(t.target_type, t.target_id, t.album_id) for t in added_objects_list}
    expected_target_data = {
        (AlbumTargetType.GRADE.value, 7, album_id),
        (AlbumTargetType.CLASS.value, 101, album_id),
    }
    assert created_target_data == expected_target_data

    # 3. Check the return value
    # The service returns the list of objects *after* they've been added/refreshed
    assert created_targets == added_objects_list
    assert len(created_targets) == len(targets_input)


@pytest.mark.asyncio
async def test_get_targets_for_album_success():
    """
    Unit Test: Test successfully retrieving targets for a given album ID.
    Verifies that the correct query is executed and results are returned.
    """
    # --- Arrange ---
    mock_db = AsyncMock(spec=AsyncSession)
    service = AlbumTargetService()

    album_id_to_fetch = 25

    # Mock AlbumTarget objects expected to be returned by the query
    mock_target_1 = AlbumTarget(id=1, album_id=album_id_to_fetch, target_type="grade", target_id=8)
    mock_target_2 = AlbumTarget(id=2, album_id=album_id_to_fetch, target_type="class", target_id=201)
    expected_targets = [mock_target_1, mock_target_2]

    # Configure mock DB execute to return the list of targets
    # Use the MagicMock chain for scalars().all()
    mock_result = MagicMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = expected_targets  # Simulate .all() returning the list
    mock_result.scalars.return_value = mock_scalars
    mock_db.execute.return_value = mock_result

    # --- Act ---
    retrieved_targets = await service.get_targets_for_album(db=mock_db, album_id=album_id_to_fetch)

    # --- Assert ---
    # 1. Check DB call
    mock_db.execute.assert_called_once()
    executed_statement = mock_db.execute.call_args[0][0]
    assert isinstance(executed_statement, Select)

    # 2. Check the return value
    assert retrieved_targets == expected_targets
    assert len(retrieved_targets) == 2


@pytest.mark.asyncio
async def test_delete_targets_success():
    """
    Unit Test: Test successfully deleting all targets for a given album ID.
    Verifies that the correct delete query is executed and flushed.
    """
    # --- Arrange ---
    mock_db = AsyncMock(spec=AsyncSession)
    service = AlbumTargetService()

    album_id_to_delete_for = 30

    # Mock the execute method for the delete operation
    # The delete operation itself doesn't return rows, so a simple AsyncMock is often enough
    mock_db.execute.return_value = AsyncMock()
    mock_db.flush = AsyncMock()

    # --- Act ---
    await service.delete_targets(db=mock_db, album_id=album_id_to_delete_for)

    # --- Assert ---
    # 1. Check DB execute call
    mock_db.execute.assert_awaited_once()
    executed_statement = mock_db.execute.call_args[0][0]

    # Verify it's a delete statement targeting AlbumTarget
    assert isinstance(executed_statement, Delete)
    assert executed_statement.table == AlbumTarget.__table__

    # 2. Check DB flush call
    mock_db.flush.assert_awaited_once()


@pytest.mark.asyncio
async def test_validate_user_access_success_grade_match():
    """
    Unit Test: validate_user_access returns True when user context matches a grade target.
    """
    # --- Arrange ---
    mock_db = AsyncMock(spec=AsyncSession)
    service = AlbumTargetService()

    album_id_to_check = 40
    user_context = {"school_id": 1, "grade_level": 9, "current_class_id": 301, "user_id": uuid.uuid4()}  # User is in Grade 9

    # Mock targets returned by get_targets_for_album (called internally)
    mock_targets = [
        AlbumTarget(id=1, album_id=album_id_to_check, target_type="grade", target_id=9),  # Matching target
        AlbumTarget(id=2, album_id=album_id_to_check, target_type="class", target_id=305),  # Non-matching
    ]

    # Patch the service's own get_targets_for_album call to return our mocked targets
    mock_get_targets = AsyncMock(return_value=mock_targets)
    with patch.object(service, "get_targets_for_album", mock_get_targets):
        # --- Act ---
        has_access = await service.validate_user_access(db=mock_db, album_id=album_id_to_check, user_context=user_context)  # Note: db might not be strictly needed by the mocked version

        # --- Assert ---
        # 1. Check that get_targets_for_album was called
        mock_get_targets.assert_awaited_once_with(mock_db, album_id=album_id_to_check)

        # 2. Check the return value
        assert has_access is True


@pytest.mark.asyncio
async def test_validate_user_access_success_class_match():
    """
    Unit Test: validate_user_access returns True when user context matches a class target.
    """
    # --- Arrange ---
    mock_db = AsyncMock(spec=AsyncSession)
    service = AlbumTargetService()
    album_id_to_check = 41
    user_context = {"school_id": 1, "grade_level": 10, "current_class_id": 402, "user_id": uuid.uuid4()}  # User is in Class 402
    mock_targets = [
        AlbumTarget(id=3, album_id=album_id_to_check, target_type="grade", target_id=11),  # Non-matching
        AlbumTarget(id=4, album_id=album_id_to_check, target_type="class", target_id=402),  # Matching target
    ]

    mock_get_targets = AsyncMock(return_value=mock_targets)
    with patch.object(service, "get_targets_for_album", mock_get_targets):
        # --- Act ---
        has_access = await service.validate_user_access(db=mock_db, album_id=album_id_to_check, user_context=user_context)
        # --- Assert ---
        mock_get_targets.assert_awaited_once_with(mock_db, album_id=album_id_to_check)
        assert has_access is True


@pytest.mark.asyncio
async def test_validate_user_access_failure_no_match():
    """
    Unit Test: validate_user_access returns False when user context matches no targets.
    """
    # --- Arrange ---
    mock_db = AsyncMock(spec=AsyncSession)
    service = AlbumTargetService()
    album_id_to_check = 42
    user_context = {"school_id": 1, "grade_level": 5, "current_class_id": 105, "user_id": uuid.uuid4()}
    # Targets that do NOT match the user_context
    mock_targets = [
        AlbumTarget(id=5, album_id=album_id_to_check, target_type="grade", target_id=6),
        AlbumTarget(id=6, album_id=album_id_to_check, target_type="class", target_id=106),
    ]

    mock_get_targets = AsyncMock(return_value=mock_targets)
    with patch.object(service, "get_targets_for_album", mock_get_targets):
        # --- Act ---
        has_access = await service.validate_user_access(db=mock_db, album_id=album_id_to_check, user_context=user_context)
        # --- Assert ---
        mock_get_targets.assert_awaited_once_with(mock_db, album_id=album_id_to_check)
        assert has_access is False


@pytest.mark.asyncio
async def test_validate_user_access_failure_no_targets():
    """
    Unit Test: validate_user_access returns False when the album has no targets defined.
    """
    # --- Arrange ---
    mock_db = AsyncMock(spec=AsyncSession)
    service = AlbumTargetService()
    album_id_to_check = 43
    user_context = {"grade_level": 7, "current_class_id": 107}
    mock_targets = []  # Album has no targets

    mock_get_targets = AsyncMock(return_value=mock_targets)
    with patch.object(service, "get_targets_for_album", mock_get_targets):
        # --- Act ---
        has_access = await service.validate_user_access(db=mock_db, album_id=album_id_to_check, user_context=user_context)
        # --- Assert ---
        mock_get_targets.assert_awaited_once_with(mock_db, album_id=album_id_to_check)
        assert has_access is False
