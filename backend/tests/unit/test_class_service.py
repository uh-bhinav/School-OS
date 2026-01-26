from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.class_model import Class
from app.models.profile import Profile
from app.schemas.class_schema import ClassOut
from app.schemas.subject_schema import SubjectOut
from app.services import class_service


@pytest.mark.asyncio
async def test_assign_subjects_to_class_unit():
    """
    Unit Test (Happy Path): Verifies the logic of assigning subjects.
    """
    # 1. Arrange: Set up all the mock objects we need
    mock_db = AsyncMock()
    mock_db.__contains__.return_value = False

    mock_db_class = MagicMock(spec=Class)
    mock_db_class.class_id = 1
    mock_db_class.school_id = 1

    subject1 = SimpleNamespace(
        subject_id=10,
        school_id=1,
        name="Mathematics",
        short_code=None,
        description=None,
        category=None,
        is_active=True,
        streams=[],
    )
    subject2 = SimpleNamespace(
        subject_id=20,
        school_id=1,
        name="Science",
        short_code=None,
        description=None,
        category=None,
        is_active=True,
        streams=[],
    )

    first_lookup = MagicMock()
    first_lookup.all.return_value = [(10,), (20,)]
    delete_result = MagicMock()
    insert_result = MagicMock()
    second_lookup = MagicMock()
    second_lookup.scalars.return_value.all.return_value = [10, 20]
    subjects_result = MagicMock()
    subjects_scalars = MagicMock()
    subjects_scalars.all.return_value = [subject1, subject2]
    subjects_result.scalars.return_value = subjects_scalars

    mock_db.execute.side_effect = [
        first_lookup,
        delete_result,
        insert_result,
        second_lookup,
        subjects_result,
    ]

    refreshed_class = MagicMock()
    refreshed_class.class_id = 1
    refreshed_class.school_id = 1
    refreshed_class.grade_level = 7
    refreshed_class.section = "A"
    refreshed_class.academic_year_id = 2025
    refreshed_class.class_teacher_id = 5
    refreshed_class.is_active = True

    with patch("app.services.class_service.get_class", new_callable=AsyncMock) as mock_get_class:
        mock_get_class.return_value = refreshed_class

        result = await class_service.assign_subjects_to_class(db=mock_db, db_class=mock_db_class, subject_ids=[10, 20])

    mock_db.commit.assert_awaited_once()
    mock_get_class.assert_awaited_once_with(db=mock_db, class_id=1, school_id=1)

    assert isinstance(result, ClassOut)
    assert [sub.subject_id for sub in result.subjects] == [10, 20]
    assert all(isinstance(sub, SubjectOut) for sub in result.subjects)


@pytest.mark.asyncio
async def test_assign_subjects_to_class_with_empty_list():
    """Unit Test (Edge Case): Verifies that an empty list clears all subjects."""
    mock_db = AsyncMock()
    mock_db.__contains__.return_value = False

    mock_db_class = MagicMock(spec=Class)
    mock_db_class.class_id = 1
    mock_db_class.school_id = 1

    delete_result = MagicMock()
    ids_after_delete = MagicMock()
    ids_after_delete.scalars.return_value.all.return_value = []

    mock_db.execute.side_effect = [
        delete_result,
        ids_after_delete,
    ]

    refreshed_class = MagicMock()
    refreshed_class.class_id = 1
    refreshed_class.school_id = 1
    refreshed_class.grade_level = 7
    refreshed_class.section = "A"
    refreshed_class.academic_year_id = 2025
    refreshed_class.class_teacher_id = 5
    refreshed_class.is_active = True

    with patch("app.services.class_service.get_class", new_callable=AsyncMock) as mock_get_class:
        mock_get_class.return_value = refreshed_class
        result = await class_service.assign_subjects_to_class(db=mock_db, db_class=mock_db_class, subject_ids=[])

    mock_db.commit.assert_awaited_once()
    mock_get_class.assert_awaited_once_with(db=mock_db, class_id=1, school_id=1)

    assert isinstance(result, ClassOut)
    assert result.subjects is None or result.subjects == []


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
