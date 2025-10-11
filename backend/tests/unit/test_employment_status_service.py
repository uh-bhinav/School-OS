# backend/tests/unit/test_employment_status_service.py
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.models.employment_status import EmploymentStatus
from app.schemas.employment_status_schema import (
    EmploymentStatusCreate,
    EmploymentStatusUpdate,
)
from app.services import employment_status_service

# --- Happy Path Tests ---


@pytest.mark.asyncio
async def test_create_status_happy_path():
    """
    Happy Path: Unit test for creating an employment status successfully.
    """
    mock_db = AsyncMock()

    status_in = EmploymentStatusCreate(school_id=1, status_name="Permanent")

    created_status = await employment_status_service.create_status(db=mock_db, status_in=status_in)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(created_status)


@pytest.mark.asyncio
async def test_get_all_statuses_for_school_happy_path():
    """
    Happy Path: Unit test for get_all_statuses_for_school.
    """
    mock_db = AsyncMock()
    school_id = 1

    mock_statuses = [
        EmploymentStatus(status_id=1, school_id=school_id, status_name="Permanent"),
        EmploymentStatus(status_id=2, school_id=school_id, status_name="Contract"),
        EmploymentStatus(status_id=3, school_id=school_id, status_name="Probationary"),
    ]

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_statuses
    mock_db.execute.return_value = mock_result

    result = await employment_status_service.get_all_statuses_for_school(db=mock_db, school_id=school_id)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 3
    assert all(s.school_id == school_id for s in result)


@pytest.mark.asyncio
async def test_get_status_by_id_happy_path():
    """
    Happy Path: Unit test for get_status_by_id when the status is found.
    """
    mock_db = AsyncMock()
    status_id = 1
    mock_status_instance = EmploymentStatus(status_id=status_id, school_id=1, status_name="Permanent")

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_status_instance
    mock_db.execute.return_value = mock_result

    result_status = await employment_status_service.get_status_by_id(db=mock_db, status_id=status_id)

    mock_db.execute.assert_awaited_once()
    assert result_status is not None
    assert result_status.status_id == status_id


@pytest.mark.asyncio
async def test_update_status_happy_path():
    """
    Happy Path: Unit test for update_status to ensure attributes are updated.
    """
    mock_db = AsyncMock()
    mock_db_status = MagicMock(spec=EmploymentStatus)
    mock_db_status.status_id = 1
    mock_db_status.status_name = "Contract"

    update_schema = EmploymentStatusUpdate(status_name="Permanent")

    updated_status = await employment_status_service.update_status(db=mock_db, db_obj=mock_db_status, status_in=update_schema)

    assert mock_db_status.status_name == "Permanent"
    mock_db.add.assert_called_with(mock_db_status)
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(mock_db_status)
    assert updated_status == mock_db_status


@pytest.mark.asyncio
async def test_delete_status_happy_path():
    """
    Happy Path: Unit test for delete_status (permanent deletion).
    """
    mock_db = AsyncMock()
    mock_status = MagicMock(spec=EmploymentStatus)
    mock_status.status_id = 1

    await employment_status_service.delete_status(db=mock_db, db_obj=mock_status)

    mock_db.delete.assert_awaited_once_with(mock_status)
    mock_db.commit.assert_awaited_once()


# --- Sad Path Tests ---


@pytest.mark.asyncio
async def test_get_status_by_id_not_found():
    """
    Sad Path: Unit test for get_status_by_id when the status does not exist.
    """
    mock_db = AsyncMock()
    status_id = 999

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    result_status = await employment_status_service.get_status_by_id(db=mock_db, status_id=status_id)

    mock_db.execute.assert_awaited_once()
    assert result_status is None


@pytest.mark.asyncio
async def test_get_all_statuses_for_school_empty():
    """
    Sad Path: Unit test for get_all_statuses_for_school when no statuses exist.
    """
    mock_db = AsyncMock()
    school_id = 999

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_result

    result = await employment_status_service.get_all_statuses_for_school(db=mock_db, school_id=school_id)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 0
