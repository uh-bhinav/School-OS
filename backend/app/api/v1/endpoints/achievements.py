from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_active_user,
    get_db,
    is_parent,
    is_school_admin,
    is_teacher,
)
from app.models.profile import Profile
from app.models.student import Student
from app.models.student_contact import StudentContact
from app.schemas.achievement_schema import AchievementPointRule, AchievementPointRuleCreate, AchievementPointRuleUpdate, StudentAchievement, StudentAchievementCreate, StudentAchievementUpdate
from app.services.achievement_service import AchievementService

# TODO: Implement a proper RoleChecker dependency based on your auth system
# from app.api.deps import RoleChecker
# admin_principal_roles = RoleChecker(["admin", "principal"])
# teacher_roles = RoleChecker(["admin", "principal", "teacher"])

router = APIRouter()


def get_achievement_service(db: AsyncSession = Depends(get_db)) -> AchievementService:
    return AchievementService(db)


def _ensure_admin_privileges(user: Profile) -> None:
    """Guard endpoints that require an Admin/Principal profile."""
    if not is_school_admin(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")


# --- Achievement Point Rules Endpoints (Admin/Principal) ---


@router.post(
    "/rules",
    response_model=AchievementPointRule,
    status_code=status.HTTP_201_CREATED
    # dependencies=[Depends(admin_principal_roles)]
)
async def create_achievement_point_rule(rule_in: AchievementPointRuleCreate, service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    Create a new achievement point rule.
    (Requires Admin or Principal role)
    """
    # Assuming school_id is on the user object
    school_id = current_user.school_id
    _ensure_admin_privileges(current_user)
    return await service.create_rule(rule_data=rule_in, school_id=school_id)


@router.get(
    "/rules",
    response_model=List[AchievementPointRule]
    # dependencies=[Depends(teacher_roles)]
)
async def get_all_achievement_point_rules(service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    Get all achievement point rules for the user's school.
    (Requires Teacher, Principal, or Admin role)
    """
    school_id = current_user.school_id
    return await service.get_rules_by_school(school_id=school_id)


@router.put(
    "/rules/{rule_id}",
    response_model=AchievementPointRule
    # dependencies=[Depends(admin_principal_roles)]
)
async def update_achievement_point_rule(rule_id: int, rule_in: AchievementPointRuleUpdate, service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    Update an achievement point rule.
    (Requires Admin or Principal role)
    """
    school_id = current_user.school_id
    _ensure_admin_privileges(current_user)
    updated_rule = await service.update_rule(rule_id=rule_id, rule_data=rule_in, school_id=school_id)
    if not updated_rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement point rule not found.")
    return updated_rule


# --- Student Achievement Endpoints ---


@router.post(
    "/",
    response_model=StudentAchievement,
    status_code=status.HTTP_201_CREATED
    # dependencies=[Depends(teacher_roles)]
)
async def add_student_achievement(achievement_in: StudentAchievementCreate, service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    Add a new student achievement (unverified).
    (Requires Teacher, Principal, or Admin role)
    """
    school_id = current_user.school_id
    achievement = await service.add_achievement(achievement_data=achievement_in, awarded_by_user_id=current_user.user_id, school_id=school_id)
    if not achievement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found in this school.")
    return achievement


@router.put(
    "/verify/{achievement_id}",
    response_model=StudentAchievement
    # dependencies=[Depends(admin_principal_roles)]
)
async def verify_student_achievement(achievement_id: int, service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    Verify a student achievement and award points.
    (Requires Admin or Principal role)
    """
    _ensure_admin_privileges(current_user)
    school_id = current_user.school_id
    verified_achievement = await service.verify_achievement(achievement_id=achievement_id, verified_by_user_id=current_user.user_id, school_id=school_id)
    if not verified_achievement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found or cannot be verified.")
    return verified_achievement


@router.get(
    "/student/{student_id}",
    response_model=List[StudentAchievement]
    # dependencies=[Depends(get_current_active_user)]
)
async def get_achievements_for_student(student_id: int, verified_only: bool = True, service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    Get all achievements for a specific student.
    (Requires authenticated user)
    TODO: Add role check to ensure user is admin, teacher, or parent of student
    """
    school_id = current_user.school_id
    session: AsyncSession = service.db

    if is_parent(current_user) and not (is_school_admin(current_user) or is_teacher(current_user)):
        contact_stmt = (
            select(StudentContact)
            .where(
                StudentContact.student_id == student_id,
                StudentContact.profile_user_id == current_user.user_id,
                StudentContact.is_active.is_(True),
            )
            .limit(1)
        )
        contact_result = await session.execute(contact_stmt)
        if not contact_result.scalars().first():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this student's achievements.")

        student_school_stmt = select(Profile.school_id).join(Student, Student.user_id == Profile.user_id).where(Student.student_id == student_id)
        student_school_id = (await session.execute(student_school_stmt)).scalar_one_or_none()
        if student_school_id is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

        school_id = student_school_id

    return await service.get_student_achievements(student_id=student_id, school_id=school_id, only_verified=verified_only)


@router.put(
    "/{achievement_id}",
    response_model=StudentAchievement
    # dependencies=[Depends(teacher_roles)]
)
async def update_unverified_achievement(achievement_id: int, achievement_in: StudentAchievementUpdate, service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    Update an unverified achievement.
    (Requires Teacher, Principal, or Admin role)
    TODO: Add logic to ensure only the creator or principal can edit.
    """
    school_id = current_user.school_id
    updated_achievement = await service.update_achievement(achievement_id=achievement_id, achievement_data=achievement_in, school_id=school_id)
    if not updated_achievement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found or is already verified and cannot be edited.")
    return updated_achievement


@router.delete(
    "/{achievement_id}",
    status_code=status.HTTP_204_NO_CONTENT
    # dependencies=[Depends(teacher_roles)]
)
async def delete_unverified_achievement(achievement_id: int, service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    Delete an unverified achievement.
    (Requires Teacher, Principal, or Admin role)
    TODO: Add logic to ensure only the creator or principal can delete.
    """
    school_id = current_user.school_id
    success = await service.delete_achievement(achievement_id=achievement_id, school_id=school_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found or is already verified and cannot be deleted.")
    return {"ok": True}
