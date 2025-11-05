from datetime import date
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.models.achievementPointRules import AchievementPointRule
from app.models.student_achievement import StudentAchievement
from app.schemas.achievement_schema import AchievementPointRuleCreate, AchievementPointRuleUpdate, StudentAchievementCreate, StudentAchievementUpdate
from app.schemas.enums import AchievementType
from app.services.achievement_service import AchievementService

# --- Constants for Mock Data ---
SCHOOL_ID = 1
ACADEMIC_YEAR_ID = 1
STUDENT_ID = 1
TEACHER_USER_ID = uuid4()
PRINCIPAL_USER_ID = uuid4()

# --- Fixtures ---


@pytest.fixture
def mock_db_session():
    """Mocks the AsyncSession."""
    session = AsyncMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.delete = AsyncMock()
    session.execute = AsyncMock()
    return session


@pytest.fixture
def achievement_service(mock_db_session):
    """Provides an instance of the AchievementService with a mocked db."""
    return AchievementService(db_session=mock_db_session)


# --- Tests for Achievement Point Rules ---


@pytest.mark.asyncio
async def test_create_rule(achievement_service: AchievementService, mock_db_session):
    rule_data = AchievementPointRuleCreate(achievement_type=AchievementType.ACADEMIC, category_name="Olympiad", base_points=100)

    await achievement_service.create_rule(rule_data, SCHOOL_ID)

    # Check that add, commit, and refresh were called
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()
    mock_db_session.refresh.assert_called_once()

    # Check the object passed to 'add'
    added_object = mock_db_session.add.call_args[0][0]
    assert isinstance(added_object, AchievementPointRule)
    assert added_object.category_name == "Olympiad"
    assert added_object.base_points == 100
    assert added_object.school_id == SCHOOL_ID


@pytest.mark.asyncio
async def test_get_rule_found(achievement_service: AchievementService, mock_db_session):
    mock_rule = AchievementPointRule(id=1, school_id=SCHOOL_ID, achievement_type=AchievementType.ACADEMIC, category_name="Olympiad", base_points=100)

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_rule
    mock_db_session.execute.return_value = mock_result

    rule = await achievement_service.get_rule(1, SCHOOL_ID)

    assert rule is not None
    assert rule.id == 1
    assert rule.category_name == "Olympiad"


@pytest.mark.asyncio
async def test_get_rule_not_found(achievement_service: AchievementService, mock_db_session):
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_db_session.execute.return_value = mock_result

    rule = await achievement_service.get_rule(99, SCHOOL_ID)

    assert rule is None


@pytest.mark.asyncio
async def test_update_rule(achievement_service: AchievementService, mock_db_session):
    mock_rule = AchievementPointRule(id=1, school_id=SCHOOL_ID, achievement_type=AchievementType.ACADEMIC, category_name="Olympiad", base_points=100, is_active=True)

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_rule
    mock_db_session.execute.return_value = mock_result

    update_data = AchievementPointRuleUpdate(base_points=150, is_active=False)

    updated_rule = await achievement_service.update_rule(1, update_data, SCHOOL_ID)

    assert updated_rule is not None
    assert updated_rule.base_points == 150
    assert updated_rule.is_active is False
    mock_db_session.commit.assert_called_once()
    mock_db_session.refresh.assert_called_once()


# --- Tests for Student Achievements ---


@pytest.mark.asyncio
async def test_add_achievement(achievement_service: AchievementService, mock_db_session):
    ach_data = StudentAchievementCreate(student_id=STUDENT_ID, academic_year_id=ACADEMIC_YEAR_ID, achievement_type=AchievementType.SPORTS, title="100m Dash Winner", achievement_category="Athletics", date_awarded=date(2023, 5, 1))

    await achievement_service.add_achievement(ach_data, TEACHER_USER_ID, SCHOOL_ID)

    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()
    mock_db_session.refresh.assert_called_once()

    added_object = mock_db_session.add.call_args[0][0]
    assert isinstance(added_object, StudentAchievement)
    assert added_object.title == "100m Dash Winner"
    assert added_object.school_id == SCHOOL_ID
    assert added_object.awarded_by_user_id == TEACHER_USER_ID
    assert added_object.is_verified is False
    assert added_object.points_awarded == 0


@pytest.mark.asyncio
async def test_verify_achievement_success_with_rule(achievement_service: AchievementService, mock_db_session):
    unverified_ach = StudentAchievement(
        id=1,
        student_id=STUDENT_ID,
        school_id=SCHOOL_ID,
        academic_year_id=ACADEMIC_YEAR_ID,
        achievement_type=AchievementType.ACADEMIC,
        achievement_category="Math Olympiad",
        title="Rank 1",
        date_awarded=date(2023, 5, 1),
        awarded_by_user_id=TEACHER_USER_ID,
        is_verified=False,
        points_awarded=0,
    )

    matching_rule = AchievementPointRule(id=1, school_id=SCHOOL_ID, achievement_type=AchievementType.ACADEMIC, category_name="Math Olympiad", base_points=50)

    # Mock the internal calls
    # We use patch.object to mock methods on the *instance* of the service
    with patch.object(achievement_service, "get_achievement_by_id", new=AsyncMock(return_value=unverified_ach)):
        with patch.object(achievement_service, "_get_rule_by_type_and_category", new=AsyncMock(return_value=matching_rule)):
            verified_ach = await achievement_service.verify_achievement(1, PRINCIPAL_USER_ID, SCHOOL_ID)

            assert verified_ach is not None
            assert verified_ach.is_verified is True
            assert verified_ach.points_awarded == 50
            assert verified_ach.verified_by_user_id == PRINCIPAL_USER_ID
            assert verified_ach.verified_at is not None
            mock_db_session.commit.assert_called_once()
            mock_db_session.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_verify_achievement_success_no_rule(achievement_service: AchievementService, mock_db_session):
    unverified_ach = StudentAchievement(
        id=1,
        student_id=STUDENT_ID,
        school_id=SCHOOL_ID,
        academic_year_id=ACADEMIC_YEAR_ID,
        achievement_type=AchievementType.CULTURAL,
        achievement_category="Singing",
        title="Solo Performance",
        date_awarded=date(2023, 5, 1),
        awarded_by_user_id=TEACHER_USER_ID,
        is_verified=False,
        points_awarded=0,
    )

    # Mock the internal calls
    with patch.object(achievement_service, "get_achievement_by_id", new=AsyncMock(return_value=unverified_ach)):
        with patch.object(achievement_service, "_get_rule_by_type_and_category", new=AsyncMock(return_value=None)):  # No matching rule
            verified_ach = await achievement_service.verify_achievement(1, PRINCIPAL_USER_ID, SCHOOL_ID)

            assert verified_ach is not None
            assert verified_ach.is_verified is True
            assert verified_ach.points_awarded == 0  # Points are 0 as no rule was found
            assert verified_ach.verified_by_user_id == PRINCIPAL_USER_ID
            mock_db_session.commit.assert_called_once()
            mock_db_session.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_verify_achievement_already_verified(achievement_service: AchievementService, mock_db_session):
    verified_ach = StudentAchievement(id=1, student_id=STUDENT_ID, school_id=SCHOOL_ID, is_verified=True, points_awarded=50, verified_by_user_id=PRINCIPAL_USER_ID)

    with patch.object(achievement_service, "get_achievement_by_id", new=AsyncMock(return_value=verified_ach)):
        result = await achievement_service.verify_achievement(1, PRINCIPAL_USER_ID, SCHOOL_ID)

        assert result is not None
        assert result.points_awarded == 50
        # Ensure no changes were made
        mock_db_session.commit.assert_not_called()
        mock_db_session.refresh.assert_not_called()


@pytest.mark.asyncio
async def test_update_achievement_unverified(achievement_service: AchievementService, mock_db_session):
    unverified_ach = StudentAchievement(id=1, student_id=STUDENT_ID, school_id=SCHOOL_ID, title="Old Title", is_verified=False)
    update_data = StudentAchievementUpdate(title="New Title")

    with patch.object(achievement_service, "get_achievement_by_id", new=AsyncMock(return_value=unverified_ach)):
        result = await achievement_service.update_achievement(1, update_data, SCHOOL_ID)

        assert result is not None
        assert result.title == "New Title"
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_update_achievement_fail_if_verified(achievement_service: AchievementService, mock_db_session):
    verified_ach = StudentAchievement(id=1, student_id=STUDENT_ID, school_id=SCHOOL_ID, title="Verified Title", is_verified=True)
    update_data = StudentAchievementUpdate(title="New Title Attempt")

    with patch.object(achievement_service, "get_achievement_by_id", new=AsyncMock(return_value=verified_ach)):
        result = await achievement_service.update_achievement(1, update_data, SCHOOL_ID)

        assert result is None  # Service logic should return None
        mock_db_session.commit.assert_not_called()


@pytest.mark.asyncio
async def test_delete_achievement_unverified(achievement_service: AchievementService, mock_db_session):
    unverified_ach = StudentAchievement(id=1, school_id=SCHOOL_ID, is_verified=False)

    with patch.object(achievement_service, "get_achievement_by_id", new=AsyncMock(return_value=unverified_ach)):
        success = await achievement_service.delete_achievement(1, SCHOOL_ID)

        assert success is True
        mock_db_session.delete.assert_called_with(unverified_ach)
        mock_db_session.commit.assert_called_once()


@pytest.mark.asyncio
async def test_delete_achievement_fail_if_verified(achievement_service: AchievementService, mock_db_session):
    verified_ach = StudentAchievement(id=1, school_id=SCHOOL_ID, is_verified=True)

    with patch.object(achievement_service, "get_achievement_by_id", new=AsyncMock(return_value=verified_ach)):
        success = await achievement_service.delete_achievement(1, SCHOOL_ID)

        assert success is False
        mock_db_session.delete.assert_not_called()
        mock_db_session.commit.assert_not_called()


# --- Tests for Leaderboards ---


@pytest.mark.asyncio
async def test_get_school_leaderboard(achievement_service: AchievementService, mock_db_session):
    # Mock the complex query result from `_get_student_base_query`
    mock_leaderboard_data = [
        {"student_id": 1, "student_name": "Student Alpha", "class_id": 10, "class_name": "10 A", "achievement_points": 100, "exam_points": 500, "club_points": 20, "total_points": 620},
        {"student_id": 2, "student_name": "Student Beta", "class_id": 11, "class_name": "11 B", "achievement_points": 50, "exam_points": 400, "club_points": 10, "total_points": 460},
    ]

    mock_result = MagicMock()
    mock_result.mappings.return_value = mock_leaderboard_data
    mock_db_session.execute.return_value = mock_result

    leaderboard = await achievement_service.get_school_leaderboard(SCHOOL_ID, ACADEMIC_YEAR_ID)

    assert leaderboard is not None
    assert len(leaderboard) == 2
    assert leaderboard[0].student_name == "Student Alpha"
    assert leaderboard[0].total_points == 620
    assert leaderboard[1].student_name == "Student Beta"
    assert leaderboard[1].total_points == 460

    # Check that the service called `execute`
    mock_db_session.execute.assert_called_once()


@pytest.mark.asyncio
async def test_get_class_leaderboard(achievement_service: AchievementService, mock_db_session):
    # Mock the complex query result
    mock_leaderboard_data = [{"student_id": 1, "student_name": "Student Alpha", "class_id": 10, "class_name": "10 A", "achievement_points": 100, "exam_points": 500, "club_points": 20, "total_points": 620}]

    mock_result = MagicMock()
    mock_result.mappings.return_value = mock_leaderboard_data
    mock_db_session.execute.return_value = mock_result

    class_id = 10
    leaderboard = await achievement_service.get_class_leaderboard(class_id, SCHOOL_ID, ACADEMIC_YEAR_ID)

    assert leaderboard is not None
    assert len(leaderboard) == 1
    assert leaderboard[0].student_name == "Student Alpha"
    assert leaderboard[0].total_points == 620

    mock_db_session.execute.assert_called_once()


@pytest.mark.asyncio
async def test_get_club_leaderboard(achievement_service: AchievementService, mock_db_session):
    mock_club_data = [{"club_id": 1, "club_name": "Debate Club", "total_points": 150}, {"club_id": 2, "club_name": "Science Club", "total_points": 120}]

    mock_result = MagicMock()
    mock_result.mappings.return_value = mock_club_data
    mock_db_session.execute.return_value = mock_result

    club_leaderboard = await achievement_service.get_club_leaderboard(SCHOOL_ID, ACADEMIC_YEAR_ID)

    assert club_leaderboard is not None
    assert len(club_leaderboard) == 2
    assert club_leaderboard[0].club_name == "Debate Club"
    assert club_leaderboard[0].total_points == 150
    mock_db_session.execute.assert_called_once()
