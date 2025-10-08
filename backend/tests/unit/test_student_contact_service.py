# backend/tests/unit/test_student_contact_service.py
import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.models.student_contact import StudentContact
from app.schemas.student_contact_schema import (
    StudentContactCreate,
    StudentContactUpdate,
)
from app.services import student_contact_service

# --- Happy Path Tests ---


@pytest.mark.asyncio
async def test_get_contact_by_id_happy_path():
    """
    Happy Path: Unit test for get_contact_by_id when the contact is found.
    """
    mock_db = AsyncMock()
    contact_id = 1
    mock_contact_instance = StudentContact(
        id=contact_id,
        student_id=1,
        name="Test Guardian",
        phone="1234567890",
        relationship_type="Guardian",
        is_active=True,
    )

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_contact_instance
    mock_db.execute.return_value = mock_result

    result_contact = await student_contact_service.get_contact_by_id(db=mock_db, contact_id=contact_id)

    mock_db.execute.assert_awaited_once()
    assert result_contact is not None
    assert result_contact.id == contact_id


@pytest.mark.asyncio
async def test_is_user_linked_to_student_happy_path():
    """
    Happy Path: Unit test for is_user_linked_to_student when link exists.
    """
    mock_db = AsyncMock()
    user_id = uuid.uuid4()
    student_id = 1

    mock_contact = StudentContact(
        id=1,
        student_id=student_id,
        profile_user_id=user_id,
        name="Parent",
        phone="1234567890",
        relationship_type="Parent",
        is_active=True,
    )

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_contact
    mock_db.execute.return_value = mock_result

    result = await student_contact_service.is_user_linked_to_student(db=mock_db, user_id=user_id, student_id=student_id)

    mock_db.execute.assert_awaited_once()
    assert result is True


@pytest.mark.asyncio
async def test_create_contact_happy_path():
    """
    Happy Path: Unit test for creating a student contact successfully.
    """
    mock_db = AsyncMock()
    user_id = uuid.uuid4()

    contact_in = StudentContactCreate(
        student_id=1,
        profile_user_id=user_id,
        name="Guardian Test",
        phone="1234567890",
        email="guardian@example.com",
        relationship_type="Guardian",
        is_emergency_contact=True,
    )

    created_contact = await student_contact_service.create_contact(db=mock_db, contact_in=contact_in)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(created_contact)


@pytest.mark.asyncio
async def test_get_contacts_for_student_happy_path():
    """
    Happy Path: Unit test for get_contacts_for_student.
    """
    mock_db = AsyncMock()
    student_id = 1

    mock_contacts = [
        StudentContact(
            id=1,
            student_id=student_id,
            name="Father",
            phone="1111111111",
            relationship_type="Father",
            is_active=True,
        ),
        StudentContact(
            id=2,
            student_id=student_id,
            name="Mother",
            phone="2222222222",
            relationship_type="Mother",
            is_active=True,
        ),
    ]

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_contacts
    mock_db.execute.return_value = mock_result

    result = await student_contact_service.get_contacts_for_student(db=mock_db, student_id=student_id)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 2
    assert all(c.student_id == student_id for c in result)


@pytest.mark.asyncio
async def test_update_contact_happy_path():
    """
    Happy Path: Unit test for update_contact to ensure attributes are updated.
    """
    mock_db = AsyncMock()
    mock_db_contact = MagicMock(spec=StudentContact)
    mock_db_contact.phone = "1234567890"
    mock_db_contact.is_emergency_contact = False

    update_schema = StudentContactUpdate(phone="0987654321", is_emergency_contact=True)

    updated_contact = await student_contact_service.update_contact(db=mock_db, db_obj=mock_db_contact, contact_in=update_schema)

    assert mock_db_contact.phone == "0987654321"
    assert mock_db_contact.is_emergency_contact is True
    mock_db.add.assert_called_with(mock_db_contact)
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(mock_db_contact)
    assert updated_contact == mock_db_contact


@pytest.mark.asyncio
async def test_soft_delete_contact_happy_path():
    """
    Happy Path: Unit test for soft_delete_contact.
    """
    mock_db = AsyncMock()
    mock_contact = MagicMock(spec=StudentContact)
    mock_contact.id = 1
    mock_contact.is_active = True

    result = await student_contact_service.soft_delete_contact(db=mock_db, db_obj=mock_contact)

    assert mock_contact.is_active is False
    mock_db.add.assert_called_with(mock_contact)
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(mock_contact)
    assert result == mock_contact


# --- Sad Path Tests ---


@pytest.mark.asyncio
async def test_get_contact_by_id_not_found():
    """
    Sad Path: Unit test for get_contact_by_id when the contact does not exist.
    """
    mock_db = AsyncMock()
    contact_id = 999

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_db.execute.return_value = mock_result

    result_contact = await student_contact_service.get_contact_by_id(db=mock_db, contact_id=contact_id)

    mock_db.execute.assert_awaited_once()
    assert result_contact is None


@pytest.mark.asyncio
async def test_is_user_linked_to_student_not_linked():
    """
    Sad Path: Unit test for is_user_linked_to_student when no link exists.
    """
    mock_db = AsyncMock()
    user_id = uuid.uuid4()
    student_id = 999

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_db.execute.return_value = mock_result

    result = await student_contact_service.is_user_linked_to_student(db=mock_db, user_id=user_id, student_id=student_id)

    mock_db.execute.assert_awaited_once()
    assert result is False


@pytest.mark.asyncio
async def test_get_contacts_for_student_empty():
    """
    Sad Path: Unit test for get_contacts_for_student when student has no contacts.
    """
    mock_db = AsyncMock()
    student_id = 999

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_result

    result = await student_contact_service.get_contacts_for_student(db=mock_db, student_id=student_id)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 0
