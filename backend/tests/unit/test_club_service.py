# from datetime import date, timedelta
# from unittest.mock import AsyncMock, MagicMock, patch
# from uuid import uuid4

# import pytest

# from app.models.club import Club
# from app.models.club_activity import ClubActivity
# from app.models.club_membership import ClubMembership
# from app.models.profile import Profile
# from app.schemas.club_schema import (
#     ClubActivityCreate,
#     ClubActivityUpdate,
#     ClubCreate,
#     ClubMembershipCreate,
#     ClubMembershipUpdate,
#     ClubUpdate,
# )
# from app.schemas.enums import (
#     ClubActivityStatus,
#     ClubActivityType,
#     ClubMembershipStatus,
#     ClubType,
#     MeetingFrequency,
# )
# from app.services.club_service import ClubService


# def _make_scalar_result(*, first=None, all_items=None, unique_items=None):
#     unique_mock = MagicMock()
#     unique_mock.all.return_value = unique_items or []

#     scalars_mock = MagicMock()
#     scalars_mock.first.return_value = first
#     scalars_mock.all.return_value = all_items or []
#     scalars_mock.unique.return_value = unique_mock

#     result = MagicMock()
#     result.scalars.return_value = scalars_mock
#     return result


# @pytest.fixture
# def mock_db_session():
#     session = AsyncMock()
#     session.add = MagicMock()
#     session.commit = AsyncMock()
#     session.refresh = AsyncMock()
#     session.delete = AsyncMock()
#     session.execute = AsyncMock()
#     return session


# @pytest.fixture
# def club_service(mock_db_session):
#     return ClubService(mock_db_session)


# def _build_club(*, club_id=1, school_id=1, max_members=10, current_member_count=0):
#     return Club(
#         id=club_id,
#         school_id=school_id,
#         teacher_in_charge_id=11,
#         academic_year_id=5,
#         name="Robotics Club",
#         club_type=ClubType.technical,
#         meeting_frequency=MeetingFrequency.WEEKLY,
#         is_active=True,
#         current_member_count=current_member_count,
#         max_members=max_members,
#     )


# def _build_membership(*, membership_id=1, club_id=1, student_id=101, status=ClubMembershipStatus.active):
#     return ClubMembership(
#         id=membership_id,
#         club_id=club_id,
#         student_id=student_id,
#         approved_by_user_id=uuid4(),
#         status=status,
#     )


# def _build_activity(*, activity_id=1, club_id=1, status=ClubActivityStatus.planned):
#     return ClubActivity(
#         id=activity_id,
#         club_id=club_id,
#         activity_name="Workshop",
#         activity_type=ClubActivityType.workshop,
#         scheduled_date=date.today(),
#         status=status,
#     )


# @pytest.mark.asyncio
# async def test_create_club_success(club_service, mock_db_session):
#     data = ClubCreate(
#         name="Robotics Club",
#         description="Hands-on robotics projects",
#         club_type=ClubType.technical,
#         teacher_in_charge_id=42,
#         academic_year_id=7,
#         meeting_frequency=MeetingFrequency.weekly,
#     )

#     created = await club_service.create_club(data, school_id=3)

#     mock_db_session.add.assert_called_once_with(created)
#     mock_db_session.commit.assert_awaited_once()
#     mock_db_session.refresh.assert_awaited_once_with(created)
#     assert isinstance(created, Club)
#     assert created.school_id == 3


# @pytest.mark.asyncio
# async def test_get_club_by_id_returns_club(club_service, mock_db_session):
#     club = _build_club(club_id=9, school_id=4)
#     mock_db_session.execute.return_value = _make_scalar_result(first=club)

#     result = await club_service.get_club_by_id(9, 4)

#     assert result is club
#     mock_db_session.execute.assert_awaited_once()


# @pytest.mark.asyncio
# async def test_update_club_not_found(club_service):
#     with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=None)):
#         update = ClubUpdate(name="Updated")
#         result = await club_service.update_club(1, update, 1)
#         assert result is None


# @pytest.mark.asyncio
# async def test_update_club_success(club_service, mock_db_session):
#     club = _build_club()
#     with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=club)):
#         update = ClubUpdate(description="New desc")
#         result = await club_service.update_club(1, update, 1)

#     assert result.description == "New desc"
#     mock_db_session.commit.assert_awaited_once()
#     mock_db_session.refresh.assert_awaited_once_with(club)


# @pytest.mark.asyncio
# async def test_delete_club_missing_returns_false(club_service):
#     with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=None)):
#         assert await club_service.delete_club(1, 1) is False


# @pytest.mark.asyncio
# async def test_delete_club_success(club_service, mock_db_session):
#     club = _build_club()
#     with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=club)):
#         assert await club_service.delete_club(1, 1) is True

#     mock_db_session.delete.assert_called_once_with(club)
#     mock_db_session.commit.assert_awaited_once()


# @pytest.mark.asyncio
# async def test_get_clubs_by_school_returns_list(club_service, mock_db_session):
#     clubs = [_build_club(club_id=1), _build_club(club_id=2)]
#     mock_db_session.execute.return_value = _make_scalar_result(all_items=clubs)

#     result = await club_service.get_clubs_by_school(school_id=1, academic_year_id=5)

#     assert result == clubs
#     mock_db_session.execute.assert_awaited_once()


# @pytest.mark.asyncio
# async def test_add_student_to_club_success(club_service, mock_db_session):
#     club = _build_club(current_member_count=2, max_members=5)
#     membership_data = ClubMembershipCreate(student_id=55, club_id=club.id)
#     approver = uuid4()

#     mock_db_session.execute.return_value = _make_scalar_result(first=None)

#     with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=club)):
#         membership = await club_service.add_student_to_club(membership_data, approver, club.school_id)

#     assert isinstance(membership, ClubMembership)
#     assert membership.approved_by_user_id == approver
#     mock_db_session.commit.assert_awaited_once()


# @pytest.mark.asyncio
# async def test_add_student_to_club_capacity_reached(club_service, mock_db_session):
#     club = _build_club(current_member_count=5, max_members=5)
#     membership_data = ClubMembershipCreate(student_id=55, club_id=club.id)

#     with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=club)):
#         membership = await club_service.add_student_to_club(membership_data, uuid4(), club.school_id)

#     assert membership is None
#     mock_db_session.commit.assert_not_awaited()


# @pytest.mark.asyncio
# async def test_add_student_to_club_duplicate_active_member(club_service, mock_db_session):
#     club = _build_club(current_member_count=1, max_members=5)
#     existing = _build_membership()
#     mock_db_session.execute.return_value = _make_scalar_result(first=existing)

#     with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=club)):
#         membership = await club_service.add_student_to_club(
#             ClubMembershipCreate(student_id=existing.student_id, club_id=club.id),
#             uuid4(),
#             club.school_id,
#         )

#     assert membership is None
#     mock_db_session.commit.assert_not_awaited()


# @pytest.mark.asyncio
# async def test_update_membership_not_found(club_service, mock_db_session):
#     mock_db_session.execute.return_value = _make_scalar_result(first=None)
#     update = ClubMembershipUpdate(status=ClubMembershipStatus.inactive)
#     result = await club_service.update_membership(1, update, 1)
#     assert result is None


# @pytest.mark.asyncio
# async def test_update_membership_success(club_service, mock_db_session):
#     membership = _build_membership()
#     mock_db_session.execute.return_value = _make_scalar_result(first=membership)

#     update = ClubMembershipUpdate(status=ClubMembershipStatus.suspended)
#     result = await club_service.update_membership(membership.id, update, school_id=1)

#     assert result.status == ClubMembershipStatus.suspended
#     mock_db_session.commit.assert_awaited_once()


# @pytest.mark.asyncio
# async def test_remove_member_not_found(club_service, mock_db_session):
#     mock_db_session.execute.return_value = _make_scalar_result(first=None)
#     removed = await club_service.remove_member(1, school_id=1)
#     assert removed is False


# @pytest.mark.asyncio
# async def test_remove_member_success(club_service, mock_db_session):
#     membership = _build_membership()
#     mock_db_session.execute.return_value = _make_scalar_result(first=membership)

#     removed = await club_service.remove_member(membership.id, school_id=1)

#     assert removed is True
#     mock_db_session.delete.assert_called_once_with(membership)
#     mock_db_session.commit.assert_awaited_once()


# @pytest.mark.asyncio
# async def test_get_club_members_returns_profiles(club_service, mock_db_session):
#     profile = Profile(user_id=uuid4(), school_id=1, first_name="Test", last_name="Student")
#     mock_db_session.execute.return_value = _make_scalar_result(unique_items=[profile])

#     members = await club_service.get_club_members(club_id=1, school_id=1)

#     assert members == [profile]


# @pytest.mark.asyncio
# async def test_get_student_clubs_returns_memberships(club_service, mock_db_session):
#     membership = _build_membership()
#     mock_db_session.execute.return_value = _make_scalar_result(all_items=[membership])

#     memberships = await club_service.get_student_clubs(student_id=membership.student_id, school_id=1)

#     assert memberships == [membership]


# @pytest.mark.asyncio
# async def test_create_activity_success(club_service, mock_db_session):
#     club = _build_club()
#     activity_data = ClubActivityCreate(
#         activity_name="Robotics Workshop",
#         activity_type=ClubActivityType.workshop,
#         scheduled_date=date.today(),
#     )

#     with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=club)):
#         activity = await club_service.create_activity(club.id, activity_data, club.school_id)

#     assert isinstance(activity, ClubActivity)
#     assert activity.club_id == club.id
#     mock_db_session.commit.assert_awaited_once()


# @pytest.mark.asyncio
# async def test_create_activity_missing_club_returns_none(club_service):
#     with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=None)):
#         result = await club_service.create_activity(
#             1,
#             ClubActivityCreate(
#                 activity_name="Session",
#                 activity_type=ClubActivityType.meeting,
#                 scheduled_date=date.today(),
#             ),
#             school_id=1,
#         )
#         assert result is None


# @pytest.mark.asyncio
# async def test_update_activity_not_found(club_service, mock_db_session):
#     mock_db_session.execute.return_value = _make_scalar_result(first=None)
#     update = ClubActivityUpdate(status=ClubActivityStatus.cancelled)
#     result = await club_service.update_activity(1, update, school_id=1)
#     assert result is None


# @pytest.mark.asyncio
# async def test_update_activity_success(club_service, mock_db_session):
#     activity = _build_activity()
#     mock_db_session.execute.return_value = _make_scalar_result(first=activity)

#     update = ClubActivityUpdate(status=ClubActivityStatus.completed)
#     result = await club_service.update_activity(activity.id, update, school_id=1)

#     assert result.status == ClubActivityStatus.completed
#     mock_db_session.commit.assert_awaited_once()


# @pytest.mark.asyncio
# async def test_delete_activity_not_found(club_service, mock_db_session):
#     mock_db_session.execute.return_value = _make_scalar_result(first=None)
#     deleted = await club_service.delete_activity(1, school_id=1)
#     assert deleted is False


# @pytest.mark.asyncio
# async def test_delete_activity_success(club_service, mock_db_session):
#     activity = _build_activity()
#     mock_db_session.execute.return_value = _make_scalar_result(first=activity)

#     deleted = await club_service.delete_activity(activity.id, school_id=1)

#     assert deleted is True
#     mock_db_session.delete.assert_called_once_with(activity)
#     mock_db_session.commit.assert_awaited_once()


# @pytest.mark.asyncio
# async def test_get_club_activities_returns_events(club_service, mock_db_session):
#     activities = [_build_activity(activity_id=1), _build_activity(activity_id=2)]
#     mock_db_session.execute.return_value = _make_scalar_result(all_items=activities)

#     result = await club_service.get_club_activities(club_id=1, school_id=1)

#     assert result == activities


# @pytest.mark.asyncio
# async def test_get_upcoming_activities_filters_status(club_service, mock_db_session):
#     upcoming = _build_activity(
#         activity_id=1,
#         status=ClubActivityStatus.planned,
#     )
#     upcoming.scheduled_date = date.today() + timedelta(days=2)
#     mock_db_session.execute.return_value = _make_scalar_result(all_items=[upcoming])

#     result = await club_service.get_upcoming_activities(school_id=1)

#     assert result == [upcoming]
from datetime import date, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.models.club import Club
from app.models.club_activity import ClubActivity
from app.models.club_membership import ClubMembership
from app.models.profile import Profile
from app.schemas.club_schema import (
    ClubActivityCreate,
    ClubActivityUpdate,
    ClubCreate,
    ClubMembershipCreate,
    ClubMembershipUpdate,
    ClubUpdate,
)
from app.schemas.enums import (
    ClubActivityStatus,
    ClubActivityType,
    ClubMembershipStatus,
    ClubType,
    MeetingFrequency,
)
from app.services.club_service import ClubService


def _make_scalar_result(*, first=None, all_items=None, unique_items=None):
    unique_mock = MagicMock()
    unique_mock.all.return_value = unique_items or []

    scalars_mock = MagicMock()
    scalars_mock.first.return_value = first
    scalars_mock.all.return_value = all_items or []
    scalars_mock.unique.return_value = unique_mock

    result = MagicMock()
    result.scalars.return_value = scalars_mock
    return result


@pytest.fixture
def mock_db_session():
    session = AsyncMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.delete = AsyncMock()
    session.execute = AsyncMock()
    return session


@pytest.fixture
def club_service(mock_db_session):
    return ClubService(mock_db_session)


def _build_club(*, club_id=1, school_id=1, max_members=10, current_member_count=0):
    return Club(
        id=club_id,
        school_id=school_id,
        teacher_in_charge_id=11,
        academic_year_id=5,
        name="Robotics Club",
        club_type=ClubType.technical,
        meeting_frequency=MeetingFrequency.weekly,  # ✅ Changed from WEEKLY to weekly
        is_active=True,
        current_member_count=current_member_count,
        max_members=max_members,
    )


def _build_membership(*, membership_id=1, club_id=1, student_id=101, status=ClubMembershipStatus.active):  # ✅ Changed default
    return ClubMembership(
        id=membership_id,
        club_id=club_id,
        student_id=student_id,
        approved_by_user_id=uuid4(),
        status=status,
    )


def _build_activity(*, activity_id=1, club_id=1, status=ClubActivityStatus.planned):  # ✅ Changed default
    return ClubActivity(
        id=activity_id,
        club_id=club_id,
        activity_name="Workshop",
        activity_type=ClubActivityType.workshop,
        scheduled_date=date.today(),
        status=status,
    )


@pytest.mark.asyncio
async def test_create_club_success(club_service, mock_db_session):
    data = ClubCreate(
        name="Robotics Club",
        description="Hands-on robotics projects",
        club_type=ClubType.technical,
        teacher_in_charge_id=42,
        academic_year_id=7,
        meeting_frequency=MeetingFrequency.weekly,  # ✅ Changed from WEEKLY
    )

    created = await club_service.create_club(data, school_id=3)

    mock_db_session.add.assert_called_once_with(created)
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.refresh.assert_awaited_once_with(created)
    assert isinstance(created, Club)
    assert created.school_id == 3


@pytest.mark.asyncio
async def test_get_club_by_id_returns_club(club_service, mock_db_session):
    club = _build_club(club_id=9, school_id=4)
    mock_db_session.execute.return_value = _make_scalar_result(first=club)

    result = await club_service.get_club_by_id(9, 4)

    assert result is club
    mock_db_session.execute.assert_awaited_once()


@pytest.mark.asyncio
async def test_update_club_not_found(club_service):
    with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=None)):
        update = ClubUpdate(name="Updated")
        result = await club_service.update_club(1, update, 1)
        assert result is None


@pytest.mark.asyncio
async def test_update_club_success(club_service, mock_db_session):
    club = _build_club()
    with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=club)):
        update = ClubUpdate(description="New desc")
        result = await club_service.update_club(1, update, 1)

    assert result.description == "New desc"
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.refresh.assert_awaited_once_with(club)


@pytest.mark.asyncio
async def test_delete_club_missing_returns_false(club_service):
    with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=None)):
        assert await club_service.delete_club(1, 1) is False


@pytest.mark.asyncio
async def test_delete_club_success(club_service, mock_db_session):
    club = _build_club()
    with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=club)):
        assert await club_service.delete_club(1, 1) is True

    mock_db_session.delete.assert_called_once_with(club)
    mock_db_session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_clubs_by_school_returns_list(club_service, mock_db_session):
    clubs = [_build_club(club_id=1), _build_club(club_id=2)]
    mock_db_session.execute.return_value = _make_scalar_result(all_items=clubs)

    result = await club_service.get_clubs_by_school(school_id=1, academic_year_id=5)

    assert result == clubs
    mock_db_session.execute.assert_awaited_once()


@pytest.mark.asyncio
async def test_add_student_to_club_success(club_service, mock_db_session):
    club = _build_club(current_member_count=2, max_members=5)
    membership_data = ClubMembershipCreate(student_id=55, club_id=club.id)
    approver = uuid4()

    mock_db_session.execute.return_value = _make_scalar_result(first=None)

    with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=club)):
        membership = await club_service.add_student_to_club(membership_data, approver, club.school_id)

    assert isinstance(membership, ClubMembership)
    assert membership.approved_by_user_id == approver
    mock_db_session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_add_student_to_club_capacity_reached(club_service, mock_db_session):
    club = _build_club(current_member_count=5, max_members=5)
    membership_data = ClubMembershipCreate(student_id=55, club_id=club.id)

    with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=club)):
        membership = await club_service.add_student_to_club(membership_data, uuid4(), club.school_id)

    assert membership is None
    mock_db_session.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_add_student_to_club_duplicate_active_member(club_service, mock_db_session):
    club = _build_club(current_member_count=1, max_members=5)
    existing = _build_membership()
    mock_db_session.execute.return_value = _make_scalar_result(first=existing)

    with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=club)):
        membership = await club_service.add_student_to_club(
            ClubMembershipCreate(student_id=existing.student_id, club_id=club.id),
            uuid4(),
            club.school_id,
        )

    assert membership is None
    mock_db_session.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_update_membership_not_found(club_service, mock_db_session):
    mock_db_session.execute.return_value = _make_scalar_result(first=None)
    update = ClubMembershipUpdate(status=ClubMembershipStatus.inactive)
    result = await club_service.update_membership(1, update, 1)
    assert result is None


@pytest.mark.asyncio
async def test_update_membership_success(club_service, mock_db_session):
    membership = _build_membership()
    mock_db_session.execute.return_value = _make_scalar_result(first=membership)

    update = ClubMembershipUpdate(status=ClubMembershipStatus.suspended)
    result = await club_service.update_membership(membership.id, update, school_id=1)

    assert result.status == ClubMembershipStatus.suspended
    mock_db_session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_remove_member_not_found(club_service, mock_db_session):
    mock_db_session.execute.return_value = _make_scalar_result(first=None)
    removed = await club_service.remove_member(1, school_id=1)
    assert removed is False


@pytest.mark.asyncio
async def test_remove_member_success(club_service, mock_db_session):
    membership = _build_membership()
    mock_db_session.execute.return_value = _make_scalar_result(first=membership)

    removed = await club_service.remove_member(membership.id, school_id=1)

    assert removed is True
    mock_db_session.delete.assert_called_once_with(membership)
    mock_db_session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_club_members_returns_profiles(club_service, mock_db_session):
    profile = Profile(user_id=uuid4(), school_id=1, first_name="Test", last_name="Student")
    mock_db_session.execute.return_value = _make_scalar_result(unique_items=[profile])

    members = await club_service.get_club_members(club_id=1, school_id=1)

    assert members == [profile]


@pytest.mark.asyncio
async def test_get_student_clubs_returns_memberships(club_service, mock_db_session):
    membership = _build_membership()
    mock_db_session.execute.return_value = _make_scalar_result(all_items=[membership])

    memberships = await club_service.get_student_clubs(student_id=membership.student_id, school_id=1)

    assert memberships == [membership]


@pytest.mark.asyncio
async def test_create_activity_success(club_service, mock_db_session):
    club = _build_club()
    activity_data = ClubActivityCreate(
        activity_name="Robotics Workshop",
        activity_type=ClubActivityType.workshop,
        scheduled_date=date.today(),
    )

    with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=club)):
        activity = await club_service.create_activity(club.id, activity_data, club.school_id)

    assert isinstance(activity, ClubActivity)
    assert activity.club_id == club.id
    mock_db_session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_create_activity_missing_club_returns_none(club_service):
    with patch.object(ClubService, "get_club_by_id", new=AsyncMock(return_value=None)):
        result = await club_service.create_activity(
            1,
            ClubActivityCreate(
                activity_name="Session",
                activity_type=ClubActivityType.meeting,
                scheduled_date=date.today(),
            ),
            school_id=1,
        )
        assert result is None


@pytest.mark.asyncio
async def test_update_activity_not_found(club_service, mock_db_session):
    mock_db_session.execute.return_value = _make_scalar_result(first=None)
    update = ClubActivityUpdate(status=ClubActivityStatus.cancelled)
    result = await club_service.update_activity(1, update, school_id=1)
    assert result is None


@pytest.mark.asyncio
async def test_update_activity_success(club_service, mock_db_session):
    activity = _build_activity()
    mock_db_session.execute.return_value = _make_scalar_result(first=activity)

    update = ClubActivityUpdate(status=ClubActivityStatus.completed)
    result = await club_service.update_activity(activity.id, update, school_id=1)

    assert result.status == ClubActivityStatus.completed
    mock_db_session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_delete_activity_not_found(club_service, mock_db_session):
    mock_db_session.execute.return_value = _make_scalar_result(first=None)
    deleted = await club_service.delete_activity(1, school_id=1)
    assert deleted is False


@pytest.mark.asyncio
async def test_delete_activity_success(club_service, mock_db_session):
    activity = _build_activity()
    mock_db_session.execute.return_value = _make_scalar_result(first=activity)

    deleted = await club_service.delete_activity(activity.id, school_id=1)

    assert deleted is True
    mock_db_session.delete.assert_called_once_with(activity)
    mock_db_session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_club_activities_returns_events(club_service, mock_db_session):
    activities = [_build_activity(activity_id=1), _build_activity(activity_id=2)]
    mock_db_session.execute.return_value = _make_scalar_result(all_items=activities)

    result = await club_service.get_club_activities(club_id=1, school_id=1)

    assert result == activities


@pytest.mark.asyncio
async def test_get_upcoming_activities_filters_status(club_service, mock_db_session):
    upcoming = _build_activity(
        activity_id=1,
        status=ClubActivityStatus.planned,  # ✅ Already correct
    )
    upcoming.scheduled_date = date.today() + timedelta(days=2)
    mock_db_session.execute.return_value = _make_scalar_result(all_items=[upcoming])

    result = await club_service.get_upcoming_activities(school_id=1)

    assert result == [upcoming]
