from unittest.mock import AsyncMock, MagicMock

import pytest

from app.models.academic_year import AcademicYear
from app.services import academic_year_service


@pytest.mark.asyncio
async def test_set_active_academic_year_unit():
    """
    Unit test for the set_active_academic_year service function.
    Verifies the business logic of deactivating other years.
    """
    # 1. Arrange
    mock_db = AsyncMock()

    # Simulate that db.get(AcademicYear, 10) will return this mock object
    mock_year_to_activate = MagicMock(spec=AcademicYear)
    mock_year_to_activate.id = 10
    mock_year_to_activate.school_id = 1
    mock_year_to_activate.is_active = False  # Starts as inactive
    mock_db.get.return_value = mock_year_to_activate

    # 2. Act
    result = await academic_year_service.set_active_academic_year(db=mock_db, school_id=1, academic_year_id=10)

    # 3. Assert
    # Did it correctly fetch the year by its ID?
    mock_db.get.assert_awaited_once_with(AcademicYear, 10)

    # Did it try to execute a database command? (This would be the UPDATE statement)
    mock_db.execute.assert_awaited_once()

    # Did it set the target year to active?
    assert mock_year_to_activate.is_active is True

    # Did it save the changes?
    mock_db.commit.assert_awaited_once()

    # Did it return the activated year?
    assert result == mock_year_to_activate


@pytest.mark.asyncio
async def test_set_active_academic_year_not_found():
    """
    Unit test for the 'not found' edge case in set_active_academic_year.
    Verifies the function exits gracefully if the year_id is invalid.
    """
    # 1. Arrange
    mock_db = AsyncMock()

    # Configure the mock db.get() to return None, simulating that
    # the academic year was not found in the database.
    mock_db.get.return_value = None

    # 2. Act
    # Call the function with an ID that we've configured to be "not found".
    result = await academic_year_service.set_active_academic_year(db=mock_db, school_id=1, academic_year_id=999)

    # 3. Assert
    # Did the function correctly return None?
    assert result is None

    # Did the function correctly avoid making any database changes?
    # It should not have tried to execute an UPDATE or commit anything.
    mock_db.execute.assert_not_called()
    mock_db.commit.assert_not_called()


@pytest.mark.asyncio
async def test_set_active_academic_year_for_wrong_school_fails():
    """
    Unit test for set_active_academic_year when the year belongs to a different school.
    """
    # 1. Arrange
    mock_db = AsyncMock()

    # Simulate finding a year that belongs to school 99
    mock_year_from_wrong_school = MagicMock(spec=AcademicYear)
    mock_year_from_wrong_school.id = 10
    mock_year_from_wrong_school.school_id = 99
    mock_db.get.return_value = mock_year_from_wrong_school

    # 2. Act
    # Attempt to activate this year for school 1
    result = await academic_year_service.set_active_academic_year(db=mock_db, school_id=1, academic_year_id=10)

    # 3. Assert
    # Did the function correctly return None because of the school_id mismatch?
    assert result is None

    # Did it correctly avoid making any database changes?
    mock_db.execute.assert_not_called()
    mock_db.commit.assert_not_called()
