from datetime import date
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.models.timetable import Timetable
from app.schemas.timetable_schema import TimetableEntryCreate, TimetableEntryUpdate
from app.services import timetable_service


@pytest.mark.asyncio
async def test_create_timetable_entry_unit():
    """UNIT TEST (Happy Path): Verifies that the service function correctly
    instantiates a Timetable model and calls the re-fetch helper."""
    mock_db = AsyncMock()
    timetable_in = TimetableEntryCreate(
        school_id=1,
        class_id=1,
        subject_id=1,
        teacher_id=1,
        period_id=1,
        day_of_week=1,
        academic_year_id=1,
    )

    # We patch the Timetable model to spy on its creation
    with patch("app.services.timetable_service.Timetable", autospec=True) as mock_timetable_model:
        # We patch the re-fetch helper function that is called at the end
        with patch(
            "app.services.timetable_service.get_entry_with_details",
            new_callable=AsyncMock,
        ) as mock_get_entry:
            await timetable_service.create_timetable_entry(db=mock_db, timetable_in=timetable_in)

    # Assert that the Timetable model was instantiated with the correct data
    mock_timetable_model.assert_called_once()
    mock_db.commit.assert_awaited_once()
    # Assert that our re-fetch helper was called to ensure a complete object is returned
    mock_get_entry.assert_awaited_once()


# --- NEW: Test for update_timetable_entry ---
@pytest.mark.asyncio
async def test_update_timetable_entry_unit():
    """UNIT TEST (Happy Path): Verifies setattr logic for updates."""
    mock_db = AsyncMock()
    mock_db_obj = MagicMock(spec=Timetable)
    timetable_in = TimetableEntryUpdate(teacher_id=99)

    with patch("app.services.timetable_service.get_entry_with_details", new_callable=AsyncMock) as mock_get_entry:
        result = await timetable_service.update_timetable_entry(db=mock_db, db_obj=mock_db_obj, timetable_in=timetable_in)

    assert mock_db_obj.teacher_id == 99
    mock_db.commit.assert_awaited_once()
    assert result == mock_get_entry.return_value


# --- NEW: Test for soft_delete_timetable_entry ---
@pytest.mark.asyncio
async def test_soft_delete_timetable_entry_not_found_unit():
    """UNIT TEST (Sad Path): Verifies soft_delete handles non-existent IDs."""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    result = await timetable_service.soft_delete_timetable_entry(db=mock_db, entry_id=999)

    assert result is None
    mock_db.commit.assert_awaited_once()


# --- NEW: Test for get_class_timetable ---
@pytest.mark.asyncio
async def test_get_class_timetable_empty_case_unit():
    """UNIT TEST (Edge Case): Verifies it returns
    an empty list if no entries are found."""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_result

    result = await timetable_service.get_class_timetable(db=mock_db, class_id=1)

    assert result == []
    mock_db.execute.assert_awaited_once()


# --- Comprehensive tests for get_schedule_for_day ---
@pytest.mark.parametrize("target_type", ["class", "teacher"])
@pytest.mark.asyncio
async def test_get_schedule_for_day_class_and_teacher_targets(target_type: str):
    """
    UNIT TEST (Happy Path): Verifies the simple query
    logic for 'class' and 'teacher' targets.
    """
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [MagicMock(spec=Timetable)]
    mock_db.execute.return_value = mock_result

    result = await timetable_service.get_schedule_for_day(
        db=mock_db,
        school_id=1,
        target_type=target_type,
        target_id=1,
        schedule_date=date(2025, 10, 6),
    )

    assert len(result) == 1
    mock_db.execute.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_schedule_for_day_for_student_happy_path():
    """
    UNIT TEST (Happy Path): Verifies the logic for fetching a student's schedule,
    including the initial lookup for the student's class.
    """
    mock_db = AsyncMock()

    # 1. Mock the first DB call: finding the student's class_id
    mock_student_result = MagicMock()
    mock_student_result.scalar_one_or_none.return_value = 101  # The student is in class 101

    # 2. Mock the second DB call: finding the timetable entries for that class
    mock_timetable_result = MagicMock()
    mock_timetable_result.scalars.return_value.all.return_value = [MagicMock(spec=Timetable)]

    # Configure the mock to return these results in sequence
    mock_db.execute.side_effect = [mock_student_result, mock_timetable_result]

    # Act
    result = await timetable_service.get_schedule_for_day(
        db=mock_db,
        school_id=1,
        target_type="student",
        target_id=1,
        schedule_date=date(2025, 10, 6),
    )

    # Assert
    assert len(result) == 1
    # Verify that two separate database queries were executed
    assert mock_db.execute.call_count == 2


@pytest.mark.asyncio
async def test_get_schedule_for_day_student_not_in_class():
    """
    UNIT TEST (Sad Path): Verifies that the function returns an empty list
    if the student is not enrolled in any class.
    """
    mock_db = AsyncMock()

    # Mock the first DB call to simulate the student not having a current_class_id
    mock_student_result = MagicMock()
    mock_student_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_student_result

    # Act
    result = await timetable_service.get_schedule_for_day(
        db=mock_db,
        school_id=1,
        target_type="student",
        target_id=1,
        schedule_date=date(2025, 10, 6),
    )

    # Assert
    assert result == []
    # CRITICAL: Assert that only the first query (for the student) was run,
    # and no attempt was made to find timetable entries.
    mock_db.execute.assert_awaited_once()
