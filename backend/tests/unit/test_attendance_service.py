from datetime import date
from unittest.mock import AsyncMock, MagicMock, call, patch

import pytest
from sqlalchemy.exc import SQLAlchemyError

from app.models.attendance_record import AttendanceRecord
from app.schemas.attendance_record_schema import AttendanceRecordCreate

# Import the necessary service, schema, and model
from app.services.attendance_record_service import (
    bulk_create_attendance_records,
    create_attendance_record,
)


@pytest.mark.asyncio
async def test_create_attendance_record_happy_path():
    """
    UNIT TEST (Happy Path): Verifies successful creation of a single attendance record.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()
    mock_db_session.add = MagicMock()

    # Input data for the new attendance record
    attendance_in = AttendanceRecordCreate(
        student_id=1,
        class_id=1,
        date=date(2025, 10, 5),
        status="Present",
        period_id=2,
        teacher_id=101,
    )

    # 2. Act
    # Patch the AttendanceRecord model to isolate the service from the DB model
    with (
        patch("app.services.attendance_record_service.AttendanceRecord", autospec=True) as mock_attendance_model,
        patch(
            "app.services.attendance_record_service.SQLAlchemyError",
            new=SQLAlchemyError,
        ),
    ):
        mock_instance = mock_attendance_model.return_value
        mock_instance.status = "Present"

        # Call the service function
        result = await create_attendance_record(db=mock_db_session, attendance_in=attendance_in)

    # 3. Assert
    # Verify the model was instantiated with the correct data
    mock_attendance_model.assert_called_once_with(**attendance_in.model_dump())

    # Verify the database transaction was handled correctly
    mock_db_session.add.assert_called_once_with(mock_instance)
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.refresh.assert_awaited_once_with(mock_instance)

    # Ensure the function returns the created instance
    assert result == mock_instance
    assert result.status == "Present"


@pytest.mark.asyncio
async def test_create_attendance_record_sad_path_db_error():
    """
    UNIT TEST (Sad Path): Verifies a DB error during
      attendance creation triggers a rollback.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()
    mock_db_session.add = MagicMock()
    # Configure the commit method to raise a database error
    mock_db_session.commit.side_effect = SQLAlchemyError("Simulated DB error")

    # Input data that might cause an error (e.g., non-existent student_id)
    attendance_in = AttendanceRecordCreate(
        student_id=999,
        class_id=1,
        date=date(2025, 10, 5),
        status="Present",
        period_id=2,
        teacher_id=101,
    )

    # 2. Act & 3. Assert
    # We expect the SQLAlchemyError to be raised by the service
    with (
        patch("app.services.attendance_record_service.AttendanceRecord", autospec=True),
        patch(
            "app.services.attendance_record_service.SQLAlchemyError",
            new=SQLAlchemyError,
        ),
    ):
        with pytest.raises(SQLAlchemyError):
            await create_attendance_record(db=mock_db_session, attendance_in=attendance_in)

    # Verify the database transaction was attempted and then rolled back
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.rollback.assert_awaited_once()

    # Refresh should not be called if the commit fails
    mock_db_session.refresh.assert_not_awaited()


@pytest.mark.asyncio
async def test_bulk_create_attendance_records_happy_path():
    """
    UNIT TEST (Happy Path): Verifies successful creation of
    multiple attendance records in bulk.
    """
    mock_db_session = AsyncMock()
    mock_db_session.add_all = MagicMock()
    mock_db_session.commit = AsyncMock()
    mock_db_session.refresh = AsyncMock()

    attendance_list_in = [
        AttendanceRecordCreate(
            student_id=1,
            class_id=1,
            date=date(2025, 10, 6),
            status="Present",
            period_id=1,
            teacher_id=101,
        ),
        AttendanceRecordCreate(
            student_id=2,
            class_id=1,
            date=date(2025, 10, 6),
            status="Absent",
            period_id=1,
            teacher_id=101,
        ),
        AttendanceRecordCreate(
            student_id=3,
            class_id=1,
            date=date(2025, 10, 6),
            status="Late",
            period_id=1,
            teacher_id=101,
        ),
    ]

    created_records = []

    def _make_record(**kwargs):
        record = MagicMock(spec=AttendanceRecord)
        for key, value in kwargs.items():
            setattr(record, key, value)
        created_records.append(record)
        return record

    with patch(
        "app.services.attendance_record_service.AttendanceRecord",
        side_effect=lambda **kwargs: _make_record(**kwargs),
    ) as mock_attendance_model:
        result = await bulk_create_attendance_records(db=mock_db_session, attendance_data=attendance_list_in)

    assert mock_attendance_model.call_count == len(attendance_list_in)
    for call_args, expected in zip(mock_attendance_model.call_args_list, attendance_list_in):
        assert call_args.kwargs == expected.model_dump()

    mock_db_session.add_all.assert_called_once()
    added_records = mock_db_session.add_all.call_args[0][0]
    assert added_records == created_records

    mock_db_session.commit.assert_awaited_once()
    mock_db_session.refresh.assert_has_awaits([call(record) for record in created_records])

    assert result == created_records


@pytest.mark.asyncio
async def test_bulk_create_attendance_records_sad_path_db_error():
    """
    UNIT TEST (Sad Path): Verifies a DB error during bulk
      attendance creation triggers a rollback.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()
    mock_db_session.add_all = MagicMock()
    # Simulate a database failure during the commit,
    # e.g., due to a foreign key violation
    mock_db_session.commit.side_effect = SQLAlchemyError("Simulated bulk insert error")

    # A list where one record is invalid (e.g., non-existent student_id)
    invalid_attendance_list = [
        AttendanceRecordCreate(
            student_id=1,
            class_id=1,
            date=date(2025, 10, 7),
            status="Present",
            period_id=1,
            teacher_id=101,
        ),
        AttendanceRecordCreate(
            student_id=999,
            class_id=1,
            date=date(2025, 10, 7),
            status="Present",
            period_id=1,
            teacher_id=101,
        ),
    ]

    # 2. Act & 3. Assert
    # Expect the SQLAlchemyError to be propagated by the service
    with patch("app.services.attendance_record_service.AttendanceRecord", autospec=True):
        with pytest.raises(SQLAlchemyError):
            await bulk_create_attendance_records(db=mock_db_session, attendance_data=invalid_attendance_list)

    # Verify the transaction handling
    mock_db_session.add_all.assert_called_once()
    mock_db_session.commit.assert_awaited_once()

    # Ensure the transaction was rolled back after the error
    mock_db_session.rollback.assert_awaited_once()

    # Refresh should not be called if the commit fails
    mock_db_session.refresh.assert_not_awaited()
