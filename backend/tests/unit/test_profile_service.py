import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.models.profile import Profile
from app.services import profile_service


@pytest.mark.asyncio
async def test_get_profile():
    """
    Unit test for the get_profile service function.
    Verifies that it correctly fetches a single profile by user_id.
    """
    mock_db = AsyncMock()
    user_id = uuid.uuid4()
    mock_profile_instance = Profile(user_id=user_id, school_id=1, first_name="Test")

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_profile_instance
    mock_db.execute.return_value = mock_result

    result_profile = await profile_service.get_profile(db=mock_db, user_id=user_id)

    mock_db.execute.assert_awaited_once()
    assert result_profile is not None
    assert result_profile.user_id == user_id
    assert result_profile.first_name == "Test"


@pytest.mark.asyncio
async def test_get_all_profiles_for_school_no_filters():
    """
    Unit test for get_all_profiles_for_school without any filters.
    """
    mock_db = AsyncMock()
    school_id = 1

    mock_profiles = [
        Profile(
            user_id=uuid.uuid4(),
            school_id=school_id,
            first_name="John",
            last_name="Doe",
        ),
        Profile(
            user_id=uuid.uuid4(),
            school_id=school_id,
            first_name="Jane",
            last_name="Smith",
        ),
    ]

    mock_result = MagicMock()
    mock_result.scalars.return_value.unique.return_value.all.return_value = (
        mock_profiles
    )
    mock_db.execute.return_value = mock_result

    result_profiles = await profile_service.get_all_profiles_for_school(
        db=mock_db, school_id=school_id
    )

    mock_db.execute.assert_awaited_once()
    assert len(result_profiles) == 2
    assert result_profiles[0].first_name == "John"
    assert result_profiles[1].first_name == "Jane"


@pytest.mark.asyncio
async def test_get_all_profiles_for_school_with_role_filter():
    """
    Unit test for get_all_profiles_for_school with a role filter.
    This test verifies that the correct SQLAlchemy joins and filters are applied.
    """
    mock_db = AsyncMock()
    school_id = 1

    mock_query = MagicMock()
    mock_db.execute.return_value = mock_query
    mock_query.scalars.return_value.unique.return_value.all.return_value = []

    await profile_service.get_all_profiles_for_school(
        db=mock_db, school_id=school_id, role="Admin"
    )

    mock_db.execute.assert_awaited_once()

    executed_stmt = mock_db.execute.call_args[0][0]

    assert "JOIN user_roles ON profiles.user_id = user_roles.user_id" in str(
        executed_stmt
    )
    assert (
        "JOIN roles_definition ON roles_definition.role_id = user_roles.role_id"
        in str(executed_stmt)
    )
    assert "roles_definition.role_name = :role_name_1" in str(executed_stmt)


@pytest.mark.asyncio
async def test_get_all_profiles_for_school_with_name_filter():
    """
    Unit test for get_all_profiles_for_school with a name filter.
    Verifies that the case-insensitive filter is correctly applied.
    """
    mock_db = AsyncMock()
    school_id = 1

    mock_query = MagicMock()
    mock_db.execute.return_value = mock_query
    mock_query.scalars.return_value.unique.return_value.all.return_value = []

    await profile_service.get_all_profiles_for_school(
        db=mock_db, school_id=school_id, name="John"
    )

    mock_db.execute.assert_awaited_once()

    executed_stmt = mock_db.execute.call_args[0][0]

    # Corrected and formatted assertion
    stmt_str = str(executed_stmt)
    assert "lower(profiles.first_name) LIKE lower(:first_name_1)" in stmt_str
    assert "lower(profiles.last_name) LIKE lower(:last_name_1)" in stmt_str
