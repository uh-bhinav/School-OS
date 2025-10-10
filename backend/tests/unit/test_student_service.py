from datetime import date
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from app.models.student import Student
from app.schemas.student_schema import (
    StudentBulkPromoteIn,
    StudentCreate,
)
from app.services import student_service

# --- Happy Path Tests ---


@pytest.mark.asyncio
async def test_get_student_by_id_happy_path():
    """
    Happy Path: Unit test for get_student_by_id when the student is found.
    """
    mock_db = AsyncMock()
    student_id = 1
    mock_student_instance = Student(student_id=student_id, user_id=uuid4())

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_student_instance
    mock_db.execute.return_value = mock_result

    result_student = await student_service.get_student_by_id(db=mock_db, student_id=student_id)

    mock_db.execute.assert_awaited_once()
    assert result_student is not None
    assert result_student.student_id == student_id


@pytest.mark.asyncio
async def test_create_student_happy_path():
    """
    Happy Path: Unit test for creating a student successfully, including profile and role creation.
    """
    mock_db = AsyncMock()
    # FIX: Configure 'add' as a synchronous MagicMock to resolve RuntimeWarning
    mock_db.add = MagicMock()
    mock_supabase = MagicMock()
    mock_user = MagicMock(id=uuid4())

    mock_supabase.auth.admin.list_users = AsyncMock(return_value=MagicMock(users=[mock_user]))

    # Simulate that the profile doesn't exist, so it gets created
    mock_db.get.return_value = None

    student_in = StudentCreate(
        email="test.student@example.com",
        password="password123",
        first_name="Test",
        last_name="Student",
        school_id=1,
        current_class_id=1,
        enrollment_date=date.today(),
    )

    created_student = await student_service.create_student(db=mock_db, supabase=mock_supabase, student_in=student_in)

    # Profile, Student, and UserRole should be added
    assert mock_db.add.call_count == 3
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(created_student)
    assert created_student.user_id == mock_user.id


@pytest.mark.asyncio
async def test_soft_delete_student_happy_path(monkeypatch):
    """
    Happy Path: Unit test for soft-deleting an active student.
    """
    mock_db = AsyncMock()
    student_id = 1
    mock_student = MagicMock(spec=Student)
    mock_student.student_id = student_id
    mock_student.user_id = uuid4()

    mock_get_student_by_id = AsyncMock(return_value=mock_student)
    monkeypatch.setattr(student_service, "get_student_by_id", mock_get_student_by_id)

    result = await student_service.soft_delete_student(db=mock_db, student_id=student_id)

    # FIX: Assert with positional arguments to match the actual call in the service
    mock_get_student_by_id.assert_awaited_once_with(mock_db, student_id)
    assert mock_db.execute.call_count == 2  # one for student, one for profile
    mock_db.commit.assert_awaited_once()
    assert result == mock_student


@pytest.mark.asyncio
async def test_bulk_promote_students():
    """
    Happy Path: Unit test for bulk promoting students to a new class.
    """
    mock_db = AsyncMock()
    promotion_data = StudentBulkPromoteIn(student_ids=[1, 2], target_class_id=5)

    mock_result = MagicMock()
    mock_result.rowcount = 2
    mock_db.execute.return_value = mock_result

    result = await student_service.bulk_promote_students(db=mock_db, promotion_data=promotion_data)

    assert result["status"] == "success"
    assert result["promoted_count"] == 2
    mock_db.execute.assert_awaited_once()
    mock_db.commit.assert_awaited_once()


# --- Sad Path Tests ---


@pytest.mark.asyncio
async def test_get_student_by_id_not_found():
    """
    Sad Path: Unit test for get_student_by_id when the student does not exist.
    """
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_db.execute.return_value = mock_result

    result_student = await student_service.get_student_by_id(db=mock_db, student_id=999)

    mock_db.execute.assert_awaited_once()
    assert result_student is None


@pytest.mark.asyncio
async def test_create_student_supabase_fails():
    """
    Sad Path: Unit test for when Supabase user lookup fails during student creation.
    """
    mock_db = AsyncMock()
    mock_db.add = MagicMock()  # Also configure 'add' here
    mock_supabase = MagicMock()
    mock_supabase.auth.admin.list_users = AsyncMock(return_value=MagicMock(users=[]))
    student_in = StudentCreate(
        email="fail@example.com",
        password="p",
        first_name="f",
        last_name="l",
        school_id=1,
        current_class_id=1,
        enrollment_date=date.today(),
    )

    result = await student_service.create_student(db=mock_db, supabase=mock_supabase, student_in=student_in)

    assert result is None
    mock_db.add.assert_not_called()


@pytest.mark.asyncio
async def test_soft_delete_student_not_found(monkeypatch):
    """
    Sad Path: Unit test for soft_delete_student when the student doesn't exist.
    """
    mock_db = AsyncMock()
    mock_get_student_by_id = AsyncMock(return_value=None)
    monkeypatch.setattr(student_service, "get_student_by_id", mock_get_student_by_id)

    result = await student_service.soft_delete_student(db=mock_db, student_id=999)

    assert result is None
    mock_db.commit.assert_not_called()
