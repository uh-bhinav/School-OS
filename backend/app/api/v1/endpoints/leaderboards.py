from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_db
from app.core.security import require_role
from app.models.class_model import Class
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
async def get_class_leaderboard(class_id: int, academic_year_id: int, service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """
    Get the leaderboard for a specific class for an academic year.
    (Requires authenticated user)
    """
    school_id = current_user.school_id

    target_class = await db.get(Class, class_id)
    if not target_class or target_class.school_id != school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found in your school.")

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


@router.post("/agent/compute", response_model=dict, dependencies=[Depends(require_role("Admin"))], summary="[AGENT] Trigger leaderboard computation")
async def agent_run_leaderboard_computation(service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    (ROBUST) Agent endpoint for Admins to trigger a full
    recalculation of all leaderboards.
    """
    school_id = current_user.school_id

    # 1. Get Active Academic Year ID
    active_year_id = await service.get_active_academic_year_id(school_id)
    if not active_year_id:
        raise HTTPException(status_code=400, detail="No active academic year is set.")

    # 2. Call the service
    return await service.run_leaderboard_computation(school_id=school_id, academic_year_id=active_year_id)


@router.get(
    "/agent/school",
    response_model=list[LeaderboardStudent],
    # dependencies=[Depends(get_current_active_user)],
    summary="[AGENT] Get school leaderboard for active year",
)
async def agent_get_school_leaderboard(service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    (ROBUST) Agent endpoint to get the school leaderboard.
    Automatically uses the active academic year.
    """
    school_id = current_user.school_id

    # 1. Get Active Academic Year ID
    active_year_id = await service.get_active_academic_year_id(school_id)
    if not active_year_id:
        raise HTTPException(status_code=400, detail="No active academic year is set.")

    # 2. Call the original, secure service
    return await service.get_school_leaderboard(school_id=school_id, academic_year_id=active_year_id)


@router.get(
    "/agent/class-by-name/{class_name}",
    response_model=list[LeaderboardStudent],
    # dependencies=[Depends(get_current_active_user)],
    summary="[AGENT] Get class leaderboard by name for active year",
)
async def agent_get_class_leaderboard_by_name(class_name: str, service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    (ROBUST) Agent endpoint to get a class leaderboard using the class name.
    Automatically uses the active academic year.
    """
    school_id = current_user.school_id

    # 1. Get Active Academic Year ID
    active_year_id = await service.get_active_academic_year_id(school_id)
    if not active_year_id:
        raise HTTPException(status_code=400, detail="No active academic year is set.")

    # 2. Translate Class Name to ID
    target_class = await service.get_class_by_name(class_name, school_id)
    if not target_class:
        raise HTTPException(status_code=404, detail=f"Class '{class_name}' not found.")

    # 3. Call the original, secure service
    return await service.get_class_leaderboard(class_id=target_class.class_id, school_id=school_id, academic_year_id=active_year_id)


@router.get(
    "/agent/clubs",
    response_model=list[LeaderboardClub],
    # dependencies=[Depends(get_current_active_user)],
    summary="[AGENT] Get club leaderboard for active year",
)
async def agent_get_club_leaderboard(service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    (ROBUST) Agent endpoint to get the club leaderboard.
    Automatically uses the active academic year.
    """
    school_id = current_user.school_id

    # 1. Get Active Academic Year ID
    active_year_id = await service.get_active_academic_year_id(school_id)
    if not active_year_id:
        raise HTTPException(status_code=400, detail="No active academic year is set.")

    # 2. Call the original, secure service
    return await service.get_club_leaderboard(school_id=school_id, academic_year_id=active_year_id)
