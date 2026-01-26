from datetime import date
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlalchemy.exc import SQLAlchemyError

from app.models.exam_type import ExamType
from app.models.exams import Exam
from app.schemas.exam_schema import ExamCreate, ExamUpdate
from app.schemas.exam_type_schema import ExamTypeCreate
from app.services import exam_type_service
from app.services.exam_service import (
    create_exam,
    delete_exam,
    get_exam_by_id,
    update_exam,
)
from app.services.exam_type_service import (
    get_all_exam_types_for_school,
    get_exam_type_id_by_name,
)


@pytest.mark.asyncio
async def test_create_exam_type_unit():
    """
    UNIT TEST (Happy Path): Verifies that the create_exam_type service
    function correctly processes a schema and calls the database.
    """
    # 1. Arrange: Set up our mocks
    mock_db_session = AsyncMock()

    exam_type_in = ExamTypeCreate(school_id=1, type_name="Unit Test Exam Type")

    # 2. Act: Call the service function with the mocked database
    # We patch the ExamType model to ensure we are not hitting the real DB
    with patch("app.services.exam_type_service.ExamType", autospec=True) as mock_exam_type_model:
        # Configure the mock model to return a specific instance
        mock_instance = mock_exam_type_model.return_value

        result = await exam_type_service.create_exam_type(db=mock_db_session, exam_type_in=exam_type_in)

    # 3. Assert: Verify the logic
    # Was the ExamType model instantiated with the correct data?
    mock_exam_type_model.assert_called_once_with(school_id=1, type_name="Unit Test Exam Type")

    # Were the correct database session methods called?
    mock_db_session.add.assert_called_once_with(mock_instance)
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.refresh.assert_awaited_once_with(mock_instance)

    # Did the function return the created instance?
    assert result == mock_instance


@pytest.mark.asyncio
async def test_create_exam_type_unit_db_error():
    """
    UNIT TEST (Sad Path): Verifies that a database error during commit
    triggers a rollback and the error is propagated.
    """
    # 1. Arrange: Set up mocks
    mock_db_session = AsyncMock()
    # Simulate a database commit failure
    mock_db_session.commit.side_effect = SQLAlchemyError("Simulated unique constraint violation")

    exam_type_in = ExamTypeCreate(school_id=1, type_name="Duplicate Exam Type")

    # 2. Act & 3. Assert: Call the service and expect an exception
    # Use patch context manager for consistency
    with patch("app.services.exam_type_service.ExamType", autospec=True):
        # We expect a SQLAlchemyError to be raised by the service
        with pytest.raises(SQLAlchemyError):
            await exam_type_service.create_exam_type(db=mock_db_session, exam_type_in=exam_type_in)

    # Verify the database transaction handling
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.rollback.assert_awaited_once()
    # Refresh should not be called if the commit fails
    mock_db_session.refresh.assert_not_awaited()


@pytest.mark.asyncio
async def test_get_all_exam_types_for_school_happy_path():
    """
    UNIT TEST (Happy Path): Verifies that all exam types
    for a specific school are retrieved.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()

    # Create mock ExamType objects that would be returned by the database
    mock_exam_types = [
        ExamType(exam_type_id=1, school_id=1, type_name="Mid-Term"),
        ExamType(exam_type_id=2, school_id=1, type_name="Final Exam"),
    ]

    # Mock the result of the database query execution
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_exam_types
    mock_db_session.execute.return_value = mock_result

    school_id_to_fetch = 1

    # 2. Act
    # Call the service function with the mocked session
    result = await get_all_exam_types_for_school(db=mock_db_session, school_id=school_id_to_fetch)

    # 3. Assert
    # Verify that the execute method was called on the session
    mock_db_session.execute.assert_awaited_once()

    # Check that the result is a list containing our mock objects
    assert isinstance(result, list)
    assert len(result) == 2
    assert result[0].type_name == "Mid-Term"
    assert result[1].school_id == school_id_to_fetch


@pytest.mark.asyncio
async def test_get_all_exam_types_for_school_sad_path_empty():
    """
    UNIT TEST (Sad Path): Verifies that an empty list is returned for a school
    with no exam types.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()

    # Mock the database result to return an empty list
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db_session.execute.return_value = mock_result

    school_id_with_no_types = 999

    # 2. Act
    # Call the service function
    result = await get_all_exam_types_for_school(db=mock_db_session, school_id=school_id_with_no_types)

    # 3. Assert
    # Verify that the database was queried
    mock_db_session.execute.assert_awaited_once()

    # Assert that the result is an empty list
    assert isinstance(result, list)
    assert len(result) == 0


@pytest.mark.asyncio
async def test_get_exam_type_id_by_name_happy_path():
    """
    UNIT TEST (Happy Path): Verifies retrieval of an exam type ID by its name.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()

    # The expected ID to be returned by the database query
    expected_exam_type_id = 123

    # Mock the database result object
    mock_result = MagicMock()
    # .scalar_one_or_none() is the method that actually returns the final value
    mock_result.scalar_one_or_none.return_value = expected_exam_type_id
    mock_db_session.execute.return_value = mock_result

    school_id = 1
    type_name_to_find = "Final Term Exam"

    # 2. Act
    # Call the service function
    result = await get_exam_type_id_by_name(db=mock_db_session, school_id=school_id, type_name=type_name_to_find)

    # 3. Assert
    # Verify that the database was queried
    mock_db_session.execute.assert_awaited_once()

    # Check that the result is the integer ID we expected
    assert result == expected_exam_type_id
    assert isinstance(result, int)


@pytest.mark.asyncio
async def test_get_exam_type_id_by_name_sad_path_not_found():
    """
    UNIT TEST (Sad Path): Verifies that None is returned when
    the exam type name is not found.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()

    # Configure the mock result to return None, simulating no record found
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db_session.execute.return_value = mock_result

    school_id = 1
    type_name_to_find = "Non-Existent Exam"

    # 2. Act
    # Call the service function
    result = await get_exam_type_id_by_name(db=mock_db_session, school_id=school_id, type_name=type_name_to_find)

    # 3. Assert
    # Verify that the database was queried
    mock_db_session.execute.assert_awaited_once()

    # Assert that the result is None
    assert result is None


@pytest.mark.asyncio
async def test_create_exam_happy_path():
    """
    UNIT TEST (Happy Path): Verifies successful creation of an exam.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()

    # Input data for creating a new exam
    exam_in = ExamCreate(
        school_id=1,
        exam_name="Annual Examination 2025",
        exam_type_id=2,
        academic_year_id=1,
        start_date=date(2025, 3, 10),
        end_date=date(2025, 3, 25),
        total_marks=100,
    )

    # 2. Act
    # Patch the Exam model to isolate the service logic
    with patch("app.services.exam_service.Exam", autospec=True) as mock_exam_model:
        # Get the mock instance that the model constructor will return
        mock_instance = mock_exam_model.return_value

        # Call the service function
        result = await create_exam(db=mock_db_session, exam_in=exam_in)

    # 3. Assert
    # Verify the Exam model was called with the correct data from the schema
    mock_exam_model.assert_called_once_with(**exam_in.model_dump())

    # Verify the correct database operations were performed
    mock_db_session.add.assert_called_once_with(mock_instance)
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.refresh.assert_awaited_once_with(mock_instance)

    # Ensure the function returns the created instance
    assert result == mock_instance


@pytest.mark.asyncio
async def test_create_exam_sad_path_db_error():
    """
    UNIT TEST (Sad Path): Verifies a database error during
    exam creation triggers a rollback.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()
    # Configure the commit method to raise an exception
    mock_db_session.commit.side_effect = SQLAlchemyError("Simulated DB error on commit")

    exam_in = ExamCreate(
        school_id=1,
        exam_name="Failed Annual Exam",
        exam_type_id=2,
        academic_year_id=1,
        start_date=date(2025, 3, 10),
        end_date=date(2025, 3, 25),
        total_marks=100,
    )

    # 2. Act & 3. Assert
    # We patch the model and expect a SQLAlchemyError to be raised from the service
    with patch("app.services.exam_service.Exam", autospec=True):
        with pytest.raises(SQLAlchemyError):
            await create_exam(db=mock_db_session, exam_in=exam_in)

    # Verify the database transaction handling
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.rollback.assert_awaited_once()
    mock_db_session.refresh.assert_not_awaited()


@pytest.mark.asyncio
async def test_get_exam_by_id_happy_path():
    """
    UNIT TEST (Happy Path): Verifies retrieving an exam by its ID.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()

    # The mock Exam object we expect the database to return
    mock_exam = Exam(
        id=101,
        school_id=1,
        exam_name="Science Mid-Term",
        exam_type_id=2,
        academic_year_id=1,
        start_date=date(2025, 9, 15),
        end_date=date(2025, 9, 20),
        total_marks=100,
    )

    # Configure the mock session's .get() method to return our mock exam
    mock_db_session.get.return_value = mock_exam

    exam_id_to_find = 101

    # 2. Act
    # Call the service function
    result = await get_exam_by_id(db=mock_db_session, exam_id=exam_id_to_find)

    # 3. Assert
    # Verify that the .get() method was called on the session with
    #  the correct model and ID
    mock_db_session.get.assert_awaited_once_with(Exam, exam_id_to_find)

    # Ensure the function returned the correct exam object
    assert result is not None
    assert result.id == exam_id_to_find
    assert result.exam_name == "Science Mid-Term"


@pytest.mark.asyncio
async def test_get_exam_by_id_sad_path_not_found():
    """
    UNIT TEST (Sad Path): Verifies that None is returned for a non-existent exam ID.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()

    # Configure the mock session's .get() method to return None,
    # simulating a lookup miss
    mock_db_session.get.return_value = None

    non_existent_exam_id = 999

    # 2. Act
    # Call the service function with the non-existent ID
    result = await get_exam_by_id(db=mock_db_session, exam_id=non_existent_exam_id)

    # 3. Assert
    # Verify that the .get() method was called correctly
    mock_db_session.get.assert_awaited_once_with(Exam, non_existent_exam_id)

    # Ensure the function returned None
    assert result is None


@pytest.mark.asyncio
async def test_update_exam_happy_path():
    """
    UNIT TEST (Happy Path): Verifies that an existing exam can be successfully updated.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()

    # The original exam object that we will "fetch" from the database
    original_exam = Exam(
        id=101,
        school_id=1,
        exam_name="Original Mid-Term Name",
        exam_type_id=2,
        academic_year_id=1,
        start_date=date(2025, 9, 15),
        end_date=date(2025, 9, 20),
        total_marks=100,
    )

    # Configure the mock session's .get() method to return our original exam
    mock_db_session.get.return_value = original_exam

    # The update data with the new name
    exam_update_data = ExamUpdate(exam_name="Updated Mid-Term Name 2025")

    exam_id_to_update = 101

    # 2. Act
    # Call the service function with the update data
    result = await update_exam(db=mock_db_session, exam_id=exam_id_to_update, exam_in=exam_update_data)

    # 3. Assert
    # Verify that the session's get method was called to fetch the object
    mock_db_session.get.assert_awaited_once_with(Exam, exam_id_to_update)

    # Verify the database transaction methods were called
    mock_db_session.add.assert_called_once_with(original_exam)
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.refresh.assert_awaited_once_with(original_exam)

    # Check that the returned object has the updated name
    assert result is not None
    assert result.exam_name == "Updated Mid-Term Name 2025"
    # Ensure other attributes remain unchanged
    assert result.id == 101
    assert result.total_marks == 100


# Import the necessary schemas and services


# ... (keep your existing tests) ...


@pytest.mark.asyncio
async def test_update_exam_sad_path_not_found():
    """
    UNIT TEST (Sad Path): Verifies that updating a non-existent exam returns None.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()

    # Configure the mock session's .get() method to return None
    mock_db_session.get.return_value = None

    exam_update_data = ExamUpdate(exam_name="This name should not be applied")

    non_existent_exam_id = 999

    # 2. Act
    # Call the service function
    result = await update_exam(db=mock_db_session, exam_id=non_existent_exam_id, exam_in=exam_update_data)

    # 3. Assert
    # Verify that the session's get method was called
    mock_db_session.get.assert_awaited_once_with(Exam, non_existent_exam_id)

    # Verify that no database write operations were attempted
    mock_db_session.add.assert_not_called()
    mock_db_session.commit.assert_not_awaited()
    mock_db_session.refresh.assert_not_awaited()

    # Ensure the function correctly returned None
    assert result is None


@pytest.mark.asyncio
async def test_update_exam_sad_path_db_error():
    """
    UNIT TEST (Sad Path): Verifies a DB error during update commit triggers a rollback.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()

    # The original exam object that will be "fetched"
    original_exam = Exam(id=101, exam_name="Original Name")
    mock_db_session.get.return_value = original_exam

    # Configure the commit method to raise a SQLAlchemyError
    mock_db_session.commit.side_effect = SQLAlchemyError("Simulated DB error on update")

    # The update data
    exam_update_data = ExamUpdate(exam_name="This Update Should Fail")

    exam_id_to_update = 101

    # 2. Act & 3. Assert
    # Expect a SQLAlchemyError to be raised from the service
    with pytest.raises(SQLAlchemyError):
        await update_exam(db=mock_db_session, exam_id=exam_id_to_update, exam_in=exam_update_data)

    # Verify the full transaction flow was attempted
    mock_db_session.get.assert_awaited_once_with(Exam, exam_id_to_update)
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_awaited_once()

    # Crucially, assert that a rollback was initiated
    mock_db_session.rollback.assert_awaited_once()

    # Refresh should not be called if the commit fails
    mock_db_session.refresh.assert_not_awaited()


@pytest.mark.asyncio
async def test_delete_exam_happy_path():
    """
    UNIT TEST (Happy Path): Verifies that an existing exam can be soft-deleted.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()

    # The existing exam object that will be "deleted"
    existing_exam = Exam(id=101, exam_name="Exam to be deleted", is_active=True)  # Initially active

    # Configure the .get() method to return our existing exam
    mock_db_session.get.return_value = existing_exam

    exam_id_to_delete = 101

    # 2. Act
    # Call the service function
    result = await delete_exam(db=mock_db_session, exam_id=exam_id_to_delete)

    # 3. Assert
    # Verify the exam was fetched from the database
    mock_db_session.get.assert_awaited_once_with(Exam, exam_id_to_delete)

    # Verify the database transaction methods were called
    mock_db_session.add.assert_called_once_with(existing_exam)
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.refresh.assert_awaited_once_with(existing_exam)

    # Crucially, assert that the is_active flag is now False
    assert result is not None
    assert result.is_active is False
    assert result.id == exam_id_to_delete


@pytest.mark.asyncio
async def test_delete_exam_sad_path_not_found():
    """
    UNIT TEST (Sad Path): Verifies that attempting to delete
      a non-existent exam returns None.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()

    # Configure the .get() method to return None, simulating that the exam was not found
    mock_db_session.get.return_value = None

    non_existent_exam_id = 999

    # 2. Act
    # Call the service function with the non-existent ID
    result = await delete_exam(db=mock_db_session, exam_id=non_existent_exam_id)

    # 3. Assert
    # Verify that the service attempted to fetch the exam
    mock_db_session.get.assert_awaited_once_with(Exam, non_existent_exam_id)

    # Verify that no write operations were called since the object was not found
    mock_db_session.add.assert_not_called()
    mock_db_session.commit.assert_not_awaited()
    mock_db_session.refresh.assert_not_awaited()

    # Ensure the function correctly returned None
    assert result is None
