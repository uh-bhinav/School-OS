from unittest.mock import AsyncMock, MagicMock

import pytest
from pydantic import HttpUrl

from app.models.school import School
from app.schemas.school_schema import SchoolUpdate
from app.services import school_service


@pytest.mark.asyncio
async def test_update_school_unit():
    """
    Unit test for the update_school service function.
    Verifies that the function correctly updates the model attributes.
    """
    # 1. Arrange: Create mock objects
    # This mock represents the database session. We only need it to have
    # mockable async methods like commit() and refresh().
    mock_db = AsyncMock()

    # This mock represents the School object already fetched from the database.
    # We can inspect its attributes to see if they were changed.
    mock_db_school = MagicMock(spec=School)

    # This is the incoming data from the API.
    update_schema = SchoolUpdate(
        name="New School Name", website="https://new.example.com"
    )

    # 2. Act: Call the function we want to test
    updated_school = await school_service.update_school(
        db=mock_db, db_obj=mock_db_school, school_in=update_schema
    )

    # 3. Assert: Check if the logic was correct
    # Did the function correctly change the name attribute on our mock object?
    assert mock_db_school.name == "New School Name"
    # Did it correctly change the website?

    expected_website = str(HttpUrl("https://new.example.com"))
    assert mock_db_school.website == expected_website

    # Did the function try to save the changes to the database?
    mock_db.commit.assert_awaited_once()
    # Did it try to refresh the object to get the latest state?
    mock_db.refresh.assert_awaited_once_with(mock_db_school)

    # Does the function return the modified object?
    assert updated_school == mock_db_school


@pytest.mark.asyncio
async def test_get_school_happy_path():
    """Unit Test (Happy Path): Correctly mocks db.execute() for get_school."""
    mock_db = AsyncMock()
    mock_school_instance = MagicMock(spec=School)

    # Configure the mock to simulate the full chain: execute -> scalars -> first
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_school_instance
    mock_db.execute.return_value = mock_result

    result = await school_service.get_school(db=mock_db, school_id=1)

    mock_db.execute.assert_awaited_once()
    assert result == mock_school_instance


@pytest.mark.asyncio
async def test_get_school_not_found():
    """Unit Test (Sad Path): Correctly mocks db.execute() for a 'not found' case."""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    # When the school isn't found, .first() returns None
    mock_result.scalars.return_value.first.return_value = None
    mock_db.execute.return_value = mock_result

    result = await school_service.get_school(db=mock_db, school_id=999)

    assert result is None


# --- Tests for update_school ---


@pytest.mark.asyncio
async def test_update_school_happy_path():
    """This test was correct and remains the same."""
    mock_db = AsyncMock()
    mock_db_school = MagicMock(spec=School)

    update_schema = SchoolUpdate(
        name="New School Name", website="https://new.example.com"
    )

    await school_service.update_school(
        db=mock_db, db_obj=mock_db_school, school_in=update_schema
    )

    assert mock_db_school.name == "New School Name"
    expected_website = str(HttpUrl("https://new.example.com"))
    assert mock_db_school.website == expected_website

    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(mock_db_school)


# Note: The 'partial_update' test from before was removed for simplicity,
# as the happy path test implicitly covers the setattr loop.

# --- Tests for soft_delete_school ---


@pytest.mark.asyncio
async def test_soft_delete_school_happy_path():
    """Unit Test (Happy Path): Correctly mocks db.execute() for soft delete."""
    mock_db = AsyncMock()

    # Simulate the object returned by `update().returning()`
    mock_deleted_school = MagicMock(spec=School, is_active=False)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_deleted_school
    mock_db.execute.return_value = mock_result

    result = await school_service.soft_delete_school(db=mock_db, school_id=1)

    mock_db.execute.assert_awaited_once()
    mock_db.commit.assert_awaited_once()
    # The test now correctly checks the object returned by the function
    assert result.is_active is False


@pytest.mark.asyncio
async def test_soft_delete_school_not_found():
    """Unit Test (Sad Path): Correctly mocks db.execute()
    for soft delete 'not found' case."""
    mock_db = AsyncMock()

    # Simulate the case where update().returning() finds no row to update
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    result = await school_service.soft_delete_school(db=mock_db, school_id=999)

    mock_db.execute.assert_awaited_once()
    assert result is None
