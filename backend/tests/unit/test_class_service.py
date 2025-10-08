from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.class_model import Class
from app.models.profile import Profile
from app.models.subject import Subject
from app.services import class_service


@pytest.mark.asyncio
async def test_assign_subjects_to_class_unit():
    """
    Unit Test (Happy Path): Verifies the logic of assigning subjects.
    """
    # 1. Arrange: Set up all the mock objects we need
    mock_db = AsyncMock()

    # This represents the existing class object passed into the function
    mock_db_class = MagicMock(spec=Class)
    mock_db_class.class_id = 1
    mock_db_class.school_id = 1

    # These represent the Subject objects we will find in the database
    mock_subject_1 = MagicMock(spec=Subject)
    mock_subject_2 = MagicMock(spec=Subject)

    # Configure the mock db.execute to return our mock subjects
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_subject_1, mock_subject_2]
    mock_db.execute.return_value = mock_result

    # Since the service function calls another service function (get_class) at the end,
    # we use 'patch' to replace it with a mock for this test.
    with patch("app.services.class_service.get_class", new_callable=AsyncMock) as mock_get_class:
        # 2. Act: Call the function we are testing
        await class_service.assign_subjects_to_class(db=mock_db, db_class=mock_db_class, subject_ids=[10, 20])

    # 3. Assert: Verify the function did what we expected
    # Did it try to find the subjects in the database?
    mock_db.execute.assert_awaited_once()

    # Did it correctly assign the found subjects to the class object?
    assert mock_db_class.subjects == [mock_subject_1, mock_subject_2]

    # Did it save the changes?
    mock_db.commit.assert_awaited_once()

    # Did it call get_class at the end to return a fresh object?
    mock_get_class.assert_awaited_once_with(db=mock_db, class_id=1, school_id=1)


@pytest.mark.asyncio
async def test_assign_subjects_to_class_with_empty_list():
    """Unit Test (Edge Case): Verifies that an empty list clears all subjects."""
    mock_db = AsyncMock()
    # Arrange: Start with a class that already has subjects
    mock_db_class = MagicMock(spec=Class, class_id=1, school_id=1)
    mock_db_class.subjects = [MagicMock(spec=Subject), MagicMock(spec=Subject)]

    # Arrange: When the DB is queried for an empty list of IDs, it will find nothing
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_result

    with patch("app.services.class_service.get_class", new_callable=AsyncMock) as mock_get_class:
        # Act: Call the function with an empty list
        await class_service.assign_subjects_to_class(db=mock_db, db_class=mock_db_class, subject_ids=[])

    # Assert: Verify the subjects list on the class is now empty
    assert mock_db_class.subjects == []
    mock_db.commit.assert_awaited_once()
    mock_get_class.assert_awaited_once_with(db=mock_db, class_id=1, school_id=1)


@pytest.mark.asyncio
async def test_search_classes_dynamic_filters(test_client: AsyncClient, db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Unit Test (Edge Case): Verifies the dynamic query building in search_classes.
    """
    mock_db = AsyncMock()
    mock_class = MagicMock(spec=Class)

    # 1. Arrange: Correctly mock the db.execute call chain
    # This is the object returned by 'await db.execute(...)'
    mock_result = MagicMock()
    # This is the object returned by '.scalars()'
    mock_scalars = MagicMock()
    # This is the final list returned by '.all()'
    mock_scalars.all.return_value = [mock_class]

    mock_result.scalars.return_value = mock_scalars
    mock_db.execute.return_value = mock_result

    # We still patch'select'to inspect the query builder,but the db mock is the key fix
    with patch("app.services.class_service.select") as mock_select:
        mock_statement = MagicMock()
        mock_select.return_value = mock_statement
        mock_statement.where.return_value = mock_statement
        mock_statement.options.return_value = mock_statement

        # 2. Act: Call the search function with a specific filter
        result_classes = await class_service.search_classes(db=mock_db, school_id=1, filters={"grade_level": 5})

    # 3. Assert
    # Did the function return the list of classes we told the mock to provide?
    assert result_classes == [mock_class]

    # Was the 'where' method called correctly, proving our dynamic filter worked?
    assert mock_statement.where.call_count == 2


@pytest.mark.asyncio
async def test_search_classes_with_multiple_filters():
    """Unit Test (Edge Case): Verifies query building with multiple filters."""
    mock_db = AsyncMock()
    # CORRECTED MOCK: Simulate the full db.execute() call chain
    mock_result = MagicMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [MagicMock(spec=Class)]
    mock_result.scalars.return_value = mock_scalars
    mock_db.execute.return_value = mock_result

    # Act: Call the search function
    result = await class_service.search_classes(db=mock_db, school_id=1, filters={"grade_level": 5, "teacher_id": 10})

    # Assert: Verify the function returned the mocked data and called the db
    assert len(result) == 1
    mock_db.execute.assert_awaited_once()


@pytest.mark.asyncio
async def test_search_classes_with_no_filters():
    """Unit Test (Edge Case): Verifies query building with no filters."""
    mock_db = AsyncMock()
    # CORRECTED MOCK: Simulate the full db.execute() call chain
    mock_result = MagicMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [MagicMock(spec=Class), MagicMock(spec=Class)]
    mock_result.scalars.return_value = mock_scalars
    mock_db.execute.return_value = mock_result

    # Act: Call the search function with an empty filters dictionary
    result = await class_service.search_classes(db=mock_db, school_id=1, filters={})

    # Assert: Verify the function returned the mocked data
    assert len(result) == 2
    mock_db.execute.assert_awaited_once()
