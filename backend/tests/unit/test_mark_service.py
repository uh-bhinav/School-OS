from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlalchemy.exc import SQLAlchemyError

from app.schemas.mark_schema import MarkCreate
from app.services.mark_service import bulk_create_marks, create_mark


@pytest.mark.asyncio
async def test_create_mark_happy_path():
    """
    UNIT TEST (Happy Path): Verifies the successful creation of a single mark entry.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()
    mock_db_session.add = MagicMock()

    # Input data from the Pydantic schema
    mark_in = MarkCreate(
        school_id=10,
        student_id=1,
        exam_id=1,
        subject_id=2,
        marks_obtained=88.5,
    )

    # 2. Act
    # We patch the Mark model to isolate the service logic
    with (
        patch("app.services.mark_service.Mark", autospec=True) as mock_mark_model,
        patch(
            "app.services.mark_service.get_mark_by_id",
            new_callable=AsyncMock,
        ) as mock_get_mark_by_id,
    ):
        mock_instance = mock_mark_model.return_value
        mock_instance.id = 99
        mock_get_mark_by_id.return_value = object()

        result = await create_mark(
            db=mock_db_session,
            mark_in=mark_in,
        )

    # 3. Assert
    # Verify the Mark model was instantiated with all required data
    mock_mark_model.assert_called_once_with(**mark_in.model_dump())

    # Verify the database transaction was handled correctly
    mock_db_session.add.assert_called_once_with(mock_instance)
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.refresh.assert_awaited_once_with(mock_instance)

    # Ensure we refetched the mark with relationships
    mock_get_mark_by_id.assert_awaited_once_with(mock_db_session, 99)

    # Ensure the function returns the created instance
    assert result is mock_get_mark_by_id.return_value


@pytest.mark.asyncio
async def test_create_mark_sad_path_db_error():
    """
    UNIT TEST (Sad Path): Verifies a DB error during mark creation triggers a rollback.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()
    mock_db_session.add = MagicMock()
    mock_db_session.commit.side_effect = SQLAlchemyError(
        "Simulated foreign key violation"
    )

    mark_in = MarkCreate(
        school_id=10,
        student_id=999,  # Non-existent student
        exam_id=1,
        subject_id=2,
        marks_obtained=88.5,
    )

    with (
        patch("app.services.mark_service.Mark", autospec=True),
        patch(
            "app.services.mark_service.get_mark_by_id",
            new_callable=AsyncMock,
        ) as mock_get_mark_by_id,
    ):
        with pytest.raises(SQLAlchemyError):
            await create_mark(
                db=mock_db_session,
                mark_in=mark_in,
            )

    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.rollback.assert_awaited_once()
    mock_db_session.refresh.assert_not_awaited()
    mock_get_mark_by_id.assert_not_awaited()


@pytest.mark.asyncio
async def test_bulk_create_marks_happy_path():
    """
    UNIT TEST (Happy Path): Verifies the successful creation of
      multiple mark entries in bulk.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()
    mock_db_session.add_all = MagicMock()
    mock_db_session.flush = AsyncMock()
    mock_db_session.commit = AsyncMock()
    mock_db_session.execute = AsyncMock()

    marks_in = [
        MarkCreate(
            school_id=1,
            student_id=1,
            exam_id=101,
            subject_id=5,
            marks_obtained=95.0,
        ),
        MarkCreate(
            school_id=1,
            student_id=2,
            exam_id=101,
            subject_id=5,
            marks_obtained=88.0,
        ),
        MarkCreate(
            school_id=1,
            student_id=3,
            exam_id=101,
            subject_id=5,
            marks_obtained=76.5,
        ),
    ]

    reloaded_marks = [object(), object(), object()]
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = reloaded_marks
    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    mock_db_session.execute.return_value = mock_result

    # 2. Act
    result = await bulk_create_marks(db=mock_db_session, marks_in=marks_in)

    # 3. Assert
    mock_db_session.add_all.assert_called_once()
    added_marks = mock_db_session.add_all.call_args[0][0]
    assert len(added_marks) == len(marks_in)
    assert [mark.student_id for mark in added_marks] == [
        mark.student_id for mark in marks_in
    ]

    mock_db_session.flush.assert_awaited_once()
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.execute.assert_awaited_once()

    assert result == reloaded_marks


@pytest.mark.asyncio
async def test_bulk_create_marks_sad_path_db_error():
    """
    UNIT TEST (Sad Path): Verifies a DB error during bulk mark
    creation triggers a rollback.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()
    mock_db_session.add_all = MagicMock()
    mock_db_session.flush = AsyncMock(
        side_effect=SQLAlchemyError("Simulated bulk insert violation")
    )
    mock_db_session.commit = AsyncMock()
    mock_db_session.rollback = AsyncMock()
    mock_db_session.execute = AsyncMock()

    marks_in = [
        MarkCreate(
            school_id=1, student_id=1, exam_id=101, subject_id=5, marks_obtained=95.0
        ),
        # This record might be invalid in a real scenario, triggering the error
        MarkCreate(
            school_id=1, student_id=999, exam_id=101, subject_id=5, marks_obtained=88.0
        ),
    ]

    # 2. Act & 3. Assert
    # We expect the service to raise the SQLAlchemyError it received from the DB
    with pytest.raises(SQLAlchemyError):
        await bulk_create_marks(db=mock_db_session, marks_in=marks_in)

    # Verify the database transaction handling
    mock_db_session.add_all.assert_called_once()
    mock_db_session.flush.assert_awaited_once()

    # Ensure a rollback is attempted after the failure
    mock_db_session.rollback.assert_awaited_once()

    # Commit should not be called if flush fails
    mock_db_session.commit.assert_not_awaited()
    mock_db_session.execute.assert_not_awaited()
