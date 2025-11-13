from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_db
from app.models.profile import Profile
from app.schemas.achievement_schema import LeaderboardClub, LeaderboardStudent
from app.services.achievement_service import AchievementService

router = APIRouter()


def get_achievement_service(db: AsyncSession = Depends(get_db)) -> AchievementService:
    return AchievementService(db)


@router.get(
    "/school/{academic_year_id}",
    response_model=list[LeaderboardStudent]
    # dependencies=[Depends(get_current_active_user)]
)
async def get_school_leaderboard(academic_year_id: int, service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    Get the school-wide student leaderboard for an academic year.
    (Requires authenticated user)
    """
    school_id = current_user.school_id
    return await service.get_school_leaderboard(school_id=school_id, academic_year_id=academic_year_id)


@router.get(
    "/class/{class_id}/{academic_year_id}",
    response_model=list[LeaderboardStudent]
    # dependencies=[Depends(get_current_active_user)]
)
async def get_class_leaderboard(class_id: int, academic_year_id: int, service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    Get the leaderboard for a specific class for an academic year.
    (Requires authenticated user)
    """
    school_id = current_user.school_id
    # TODO: Add check to ensure class_id belongs to user's school
    return await service.get_class_leaderboard(class_id=class_id, school_id=school_id, academic_year_id=academic_year_id)


@router.get(
    "/clubs/{academic_year_id}",
    response_model=list[LeaderboardClub]
    # dependencies=[Depends(get_current_active_user)]
)
async def get_club_leaderboard(academic_year_id: int, service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    Get the club leaderboard for an academic year.
    (Requires authenticated user)
    """
    school_id = current_user.school_id
    return await service.get_club_leaderboard(school_id=school_id, academic_year_id=academic_year_id)
