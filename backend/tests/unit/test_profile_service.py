# backend/tests/unit/test_profile_service.py
import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.models.profile import Profile
from app.schemas.profile_schema import ProfileUpdate
from app.services import profile_service

# --- Happy Path Tests ---


@pytest.mark.asyncio
async def test_get_profile_happy_path():
    """
    Happy Path: Unit test for get_profile when the profile is found.
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


@pytest.mark.asyncio
async def test_get_all_profiles_for_school_no_filters():
    """
    Happy Path: Unit test for get_all_profiles_for_school without filters.
    """
    mock_db = AsyncMock()
    school_id = 1
    mock_profiles = [Profile(user_id=uuid.uuid4(), school_id=school_id)]

    mock_result = MagicMock()
    # This chained call was the long line. It has been broken up correctly now.
    (
        mock_result.scalars.return_value.unique.return_value.all.return_value
    ) = mock_profiles
    mock_db.execute.return_value = mock_result

    result = await profile_service.get_all_profiles_for_school(
        db=mock_db, school_id=school_id
    )

    mock_db.execute.assert_awaited_once()
    assert len(result) == 1


@pytest.mark.asyncio
async def test_soft_delete_profile_happy_path(monkeypatch):
    """
    Happy Path: Unit test for soft_delete_profile when the profile is active and valid.
    """
    mock_db = AsyncMock()
    user_id = uuid.uuid4()
    school_id = 1

    mock_profile = MagicMock(spec=Profile)
    mock_profile.school_id = school_id
    mock_profile.is_active = True

    # Use monkeypatch to temporarily replace the get_profile function
    mock_get_profile = AsyncMock(return_value=mock_profile)
    monkeypatch.setattr(profile_service, "get_profile", mock_get_profile)

    result = await profile_service.soft_delete_profile(
        db=mock_db, user_id=user_id, school_id=school_id
    )

    mock_get_profile.assert_awaited_once_with(mock_db, user_id=user_id)
    assert mock_profile.is_active is False
    mock_db.add.assert_called_with(mock_profile)
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(mock_profile)
    assert result == mock_profile


@pytest.mark.asyncio
async def test_admin_update_profile():
    """
    Happy Path: Unit test for admin_update_profile to ensure attributes are set.
    """
    mock_db = AsyncMock()
    mock_db_profile = MagicMock(spec=Profile)
    update_schema = ProfileUpdate(first_name="John", last_name="Doe")

    updated_profile = await profile_service.admin_update_profile(
        db=mock_db, db_obj=mock_db_profile, profile_in=update_schema
    )

    assert mock_db_profile.first_name == "John"
    assert mock_db_profile.last_name == "Doe"
    mock_db.add.assert_called_with(mock_db_profile)
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(mock_db_profile)
    assert updated_profile == mock_db_profile


# --- Sad Path Tests ---


@pytest.mark.asyncio
async def test_get_profile_not_found():
    """
    Sad Path: Unit test for get_profile when the user_id does not exist.
    """
    mock_db = AsyncMock()
    user_id = uuid.uuid4()

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_db.execute.return_value = mock_result

    result_profile = await profile_service.get_profile(db=mock_db, user_id=user_id)

    mock_db.execute.assert_awaited_once()
    assert result_profile is None


@pytest.mark.asyncio
async def test_soft_delete_profile_not_found(monkeypatch):
    """
    Sad Path: Unit test for soft_delete_profile when the profile doesn't exist.
    """
    mock_db = AsyncMock()
    mock_get_profile = AsyncMock(return_value=None)
    monkeypatch.setattr(profile_service, "get_profile", mock_get_profile)

    result = await profile_service.soft_delete_profile(
        db=mock_db, user_id=uuid.uuid4(), school_id=1
    )

    assert result is None
    mock_db.commit.assert_not_called()


@pytest.mark.asyncio
async def test_soft_delete_profile_wrong_school(monkeypatch):
    """
    Sad Path: Unit test for soft_delete_profile when admin tries
    to delete a user from another school.
    """
    mock_db = AsyncMock()
    mock_profile = MagicMock(spec=Profile, school_id=99, is_active=True)
    mock_get_profile = AsyncMock(return_value=mock_profile)
    monkeypatch.setattr(profile_service, "get_profile", mock_get_profile)

    result = await profile_service.soft_delete_profile(
        db=mock_db, user_id=uuid.uuid4(), school_id=1
    )

    assert result is None
    mock_db.commit.assert_not_called()


@pytest.mark.asyncio
async def test_soft_delete_profile_already_inactive(monkeypatch):
    """
    Sad Path: Unit test for soft_delete_profile when the profile is already inactive.
    """
    mock_db = AsyncMock()
    mock_profile = MagicMock(spec=Profile, school_id=1, is_active=False)
    mock_get_profile = AsyncMock(return_value=mock_profile)
    monkeypatch.setattr(profile_service, "get_profile", mock_get_profile)

    result = await profile_service.soft_delete_profile(
        db=mock_db, user_id=uuid.uuid4(), school_id=1
    )

    assert result is None
    mock_db.commit.assert_not_called()
