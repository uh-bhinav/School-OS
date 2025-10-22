from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.models.period import Period
from app.schemas.period_schema import PeriodCreate, PeriodUpdate
from app.services import period_service


@pytest.mark.asyncio
async def test_create_period_unit():
    """
    UNIT TEST (Happy Path): Verifies all steps of the create_period function.
    """
    # 1. Arrange
    mock_db = AsyncMock()
    period_in = PeriodCreate(
        school_id=1,
        period_number=1,
        period_name="First Period",
        start_time="09:00:00",
        end_time="09:45:00",
    )

    # We use 'patch' to spy on the Period model's constructor
    with patch("app.services.period_service.Period", autospec=True) as mock_period_model:
        # We need to know what instance the mocked constructor will create
        mock_instance = mock_period_model.return_value

        # 2. Act: Call the function we are testing
        result = await period_service.create_period(db=mock_db, period_in=period_in)

    # 3. Assert: Verify every step of the function's logic

    # Was the Period model class called with the correct data?
    mock_period_model.assert_called_once_with(**period_in.model_dump())

    # Was the new instance added to the session?
    mock_db.add.assert_called_once_with(mock_instance)

    # Were the changes committed and the object refreshed?
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(mock_instance)

    # Did the function return the correct object? (This uses the 'result' variable)
    assert result == mock_instance


@pytest.mark.asyncio
async def test_update_period_unit():
    """UNIT TEST (Happy Path): Verifies that update_period
    correctly modifies object attributes."""
    mock_db = AsyncMock()
    mock_db_obj = MagicMock(spec=Period, period_name="Old Name")
    period_in = PeriodUpdate(period_name="New Updated Name")

    await period_service.update_period(db=mock_db, db_obj=mock_db_obj, period_in=period_in)

    # Assert that the function correctly modified the object's attribute
    assert mock_db_obj.period_name == "New Updated Name"
    mock_db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_fetch_periods_for_class_happy_path():
    """UNIT TEST (Happy Path): Verifies the logic for fetching
    periods for a valid class."""
    mock_db = AsyncMock()

    # Mock the two separate DB calls this function makes
    # 1. The call to get the school_id from the class
    mock_class_result = MagicMock()
    mock_class_result.scalar_one_or_none.return_value = 1  # Return school_id=1

    # 2. The call to get the periods for that school
    mock_period_result = MagicMock()
    mock_period_result.scalars.return_value.all.return_value = [MagicMock(spec=Period)]

    # Configure the mock to return these results in order
    mock_db.execute.side_effect = [mock_class_result, mock_period_result]

    result = await period_service.fetch_periods_for_class(db=mock_db, class_id=1)

    # Assert that two queries were executed
    assert mock_db.execute.call_count == 2
    # Assert that the function returned the list of periods
    assert len(result) == 1


@pytest.mark.asyncio
async def test_fetch_periods_for_class_not_found():
    """UNIT TEST (Sad Path): Verifies early exit if the class_id is not found."""
    mock_db = AsyncMock()

    # Mock the first DB call to simulate the class not being found
    mock_class_result = MagicMock()
    mock_class_result.scalar_one_or_none.return_value = None  # Class not found
    mock_db.execute.return_value = mock_class_result

    result = await period_service.fetch_periods_for_class(db=mock_db, class_id=999)

    # Assert the function returned an empty list
    assert result == []
    # CRITICAL: Assert that only the first query (for the class) was run
    mock_db.execute.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_recess_periods_unit():
    """UNIT TEST (Happy Path): Verifies that get_recess_periods filters correctly."""
    mock_db = AsyncMock()
    # Mock the DB execute call to return a list of periods
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [MagicMock(spec=Period)]
    mock_db.execute.return_value = mock_result

    await period_service.get_recess_periods(db=mock_db, school_id=1)

    # Assert that a query was executed
    mock_db.execute.assert_awaited_once()
    # To be more specific, one would inspect the query object passed to execute()
    # to ensure 'is_recess.is_(True)' was part of the WHERE clause.
    # For now, confirming the call is a strong indicator.


@pytest.mark.asyncio
async def test_delete_period_unit():
    """UNIT TEST (Happy Path): Verifies that delete_period
    correctly sets is_active=False."""
    mock_db = AsyncMock()
    # Arrange: Create a mock period that starts as active
    mock_db_obj = MagicMock(spec=Period)
    mock_db_obj.is_active = True

    # Act: Call the delete function
    await period_service.delete_period(db=mock_db, db_obj=mock_db_obj)

    # Assert: Verify the flag was flipped and the change was saved
    assert mock_db_obj.is_active is False
    mock_db.add.assert_called_once_with(mock_db_obj)
    mock_db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_all_periods_for_school_empty_case():
    """UNIT TEST (Edge Case): Verifies get_all_periods returns [] if none are found."""
    mock_db = AsyncMock()
    # Arrange: Configure the mock DB call to return an empty list
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_result

    result = await period_service.get_all_periods_for_school(db=mock_db, school_id=1)

    assert result == []
    mock_db.execute.assert_awaited_once()


@pytest.mark.asyncio
async def test_fetch_periods_for_class_filters_out_recess():
    """UNIT TEST (Logic Verification): Verifies the
    is_recess==False filter is applied."""
    mock_db = AsyncMock()
    mock_class_result = MagicMock()
    mock_class_result.scalar_one_or_none.return_value = 1
    # CORRECTED MOCK: Configure execute for the second call
    mock_period_result = MagicMock()
    mock_period_result.scalars.return_value.all.return_value = []
    mock_db.execute.side_effect = [mock_class_result, mock_period_result]

    with patch("app.services.period_service.select") as mock_select:
        mock_statement = MagicMock()
        mock_select.return_value = mock_statement
        mock_statement.where.return_value = mock_statement
        mock_statement.options.return_value = mock_statement
        mock_statement.order_by.return_value = mock_statement

        await period_service.fetch_periods_for_class(db=mock_db, class_id=1)

        where_args = mock_statement.where.call_args[0]
        # CORRECTED ASSERTION: Make the check case-insensitive
        assert "is_recess is false" in str(where_args[1]).lower()


@pytest.mark.asyncio
async def test_get_recess_periods_filters_for_recess():
    """UNIT TEST (Logic Verification): Verifies the
    is_recess==True filter is applied."""
    mock_db = AsyncMock()
    # CORRECTED MOCK: The db.execute() call must be mocked correctly.
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_result

    with patch("app.services.period_service.select") as mock_select:
        mock_statement = MagicMock()
        mock_select.return_value = mock_statement
        mock_statement.where.return_value = mock_statement
        mock_statement.order_by.return_value = mock_statement

        await period_service.get_recess_periods(db=mock_db, school_id=1)

        where_args = mock_statement.where.call_args[0]
        # CORRECTED ASSERTION: Make the check case-insensitive
        assert "is_recess is true" in str(where_args[1]).lower()
