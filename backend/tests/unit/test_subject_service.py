from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.models.subject import Subject
from app.models.teacher import Teacher
from app.schemas.subject_schema import SubjectCreate, SubjectUpdate
from app.services import subject_service


@pytest.mark.asyncio
async def test_create_subject_unit():
    """
    UNIT TEST (Happy Path): Verifies that create_subject correctly
    instantiates a Subject model and calls the database.
    """
    # 1. Arrange: Set up our mocks
    mock_db = AsyncMock()

    # Mock the incoming Pydantic schema
    subject_in_schema = SubjectCreate(
        name="Unit Test Subject", school_id=1, short_code="UTS101"
    )

    # We use 'patch' to temporarily replace the real Subject model with a mock.
    # This lets us check if it was called correctly.
    with patch(
        "app.services.subject_service.Subject", autospec=True
    ) as mock_subject_model:
        # Mock the re-fetch call that happens at the end of the service function
        with patch(
            "app.services.subject_service.get_subject_with_streams",
            new_callable=AsyncMock,
        ) as mock_get_subject:
            # 2. Act: Call the function we are testing
            await subject_service.create_subject(
                db=mock_db, subject_in=subject_in_schema
            )

    # 3. Assert: Verify the logic
    # Was the Subject model class called with the data from the schema?
    mock_subject_model.assert_called_once_with(
        name="Unit Test Subject",
        school_id=1,
        short_code="UTS101",
        description=None,  # Pydantic defaults optional fields to None
        category=None,
    )

    # Was the transaction committed?
    mock_db.commit.assert_awaited_once()

    # Was the re-fetch function called at the end?
    mock_get_subject.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_teachers_for_subject_happy_path():
    """
    UNIT TEST (Happy Path): Verifies get_teachers_for_subject correctly
    builds the query with a join.
    """
    mock_db = AsyncMock()
    mock_subject = MagicMock(spec=Subject, name="Physics")

    # Mock the final db.execute call as before
    mock_teacher_result = MagicMock()
    mock_teacher_result.scalars.return_value.all.return_value = [
        MagicMock(spec=Teacher)
    ]
    mock_db.execute.return_value = mock_teacher_result

    # Mock the internal get_subject call as before
    with patch(
        "app.services.subject_service.get_subject",
        new_callable=AsyncMock,
        return_value=mock_subject,
    ) as mock_get_subject:
        # FIX: We now also patch 'select' to spy on the query builder
        with patch("app.services.subject_service.select") as mock_select:
            # Configure the mock statement to handle the chained
            # .join() and .where() calls
            mock_statement = MagicMock()
            mock_select.return_value = mock_statement
            mock_statement.join.return_value = (
                mock_statement  # <-- Handle the .join() call
            )
            mock_statement.where.return_value = mock_statement

            await subject_service.get_teachers_for_subject(
                db=mock_db, school_id=1, subject_id=10
            )

    # Assert that the .join() method was called on our query statement
    mock_get_subject.assert_awaited_once_with(mock_db, subject_id=10)
    mock_statement.join.assert_called_once_with(Teacher.profile)
    # Assert that a query was executed
    mock_db.execute.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_teachers_for_subject_not_found():
    """
    UNIT TEST (Sad Path): Verifies that the function returns an empty list
    if the subject ID does not exist.
    """
    # 1. Arrange
    mock_db = AsyncMock()

    # Use 'patch' to make the internal 'get_subject' call return None
    with patch(
        "app.services.subject_service.get_subject", new_callable=AsyncMock
    ) as mock_get_subject:
        mock_get_subject.return_value = None

        # 2. Act
        result = await subject_service.get_teachers_for_subject(
            db=mock_db, school_id=1, subject_id=999
        )

    # 3. Assert
    # Did the function correctly return an empty list?
    assert result == []

    # Did it correctly avoid making any further database calls to find teachers?
    mock_db.execute.assert_not_called()


@pytest.mark.asyncio
async def test_get_subjects_for_class():
    """
    UNIT TEST (Happy Path): Verifies that get_subjects_for_class executes a query.
    """
    mock_db = AsyncMock()
    mock_subject = MagicMock(spec=Subject)

    # Mock the db.execute call to return a list with one subject
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_subject]
    mock_db.execute.return_value = mock_result

    result = await subject_service.get_subjects_for_class(db=mock_db, class_id=1)

    # Assert that a database query was executed
    mock_db.execute.assert_awaited_once()
    # Assert that the function returned the list of subjects from the query
    assert result == [mock_subject]


@pytest.mark.asyncio
async def test_update_subject_unit():
    """UNIT TEST (Happy Path): Verifies setattr logic for updates."""
    mock_db = AsyncMock()
    mock_db_obj = MagicMock(spec=Subject)
    subject_in = SubjectUpdate(name="Updated Name")

    with patch(
        "app.services.subject_service.get_subject_with_streams", new_callable=AsyncMock
    ) as mock_get_subject:
        await subject_service.update_subject(
            db=mock_db, db_obj=mock_db_obj, subject_in=subject_in
        )

    assert mock_db_obj.name == "Updated Name"
    mock_db.commit.assert_awaited_once()
    mock_get_subject.assert_awaited_once()


# --- NEW: Test for soft_delete_subject ---
@pytest.mark.asyncio
async def test_soft_delete_subject_not_found_unit():
    """UNIT TEST (Sad Path): Verifies soft_delete handles non-existent IDs."""
    mock_db = AsyncMock()
    # Simulate the case where update().returning() finds nothing
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    result = await subject_service.soft_delete_subject(db=mock_db, subject_id=999)

    assert result is None
    mock_db.commit.assert_awaited_once()  # Commit is still called in the service


# --- Tests for get_teachers_for_subject ---
@pytest.mark.asyncio
async def test_get_teachers_for_subject_no_teacher_match():
    """UNIT TEST(Edge Case):Verifies behavior when subject exists
    but no teachers match."""
    mock_db = AsyncMock()
    mock_subject = MagicMock(spec=Subject, name="Quantum Computing")

    # Mock the DB execute call to return an empty list of teachers
    mock_teacher_result = MagicMock()
    mock_teacher_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_teacher_result

    with patch(
        "app.services.subject_service.get_subject",
        new_callable=AsyncMock,
        return_value=mock_subject,
    ):
        result = await subject_service.get_teachers_for_subject(
            db=mock_db, school_id=1, subject_id=10
        )

    assert result == []
    mock_db.execute.assert_awaited_once()  # The query for teachers was still run


@pytest.mark.asyncio
async def test_get_subjects_for_class_no_subjects_assigned():
    """UNIT TEST (Edge Case): Verifies it returns an
    empty list for a class with no subjects."""
    mock_db = AsyncMock()
    # Mock the DB execute call to return an empty list of subjects
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_result

    result = await subject_service.get_subjects_for_class(db=mock_db, class_id=1)

    assert result == []
    mock_db.execute.assert_awaited_once()
