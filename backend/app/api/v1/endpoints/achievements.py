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
from app.core.security import require_role
from app.models.profile import Profile
from app.models.student import Student
from app.models.student_contact import StudentContact
from app.schemas.achievement_schema import AchievementPointRule, AchievementPointRuleCreate, AchievementPointRuleUpdate, AgentAddAchievement, AgentPointsLookup, StudentAchievement, StudentAchievementCreate, StudentAchievementUpdate
from app.services.achievement_service import AchievementService

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
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
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
    response_model=list[AchievementPointRule],
    dependencies=[Depends(require_role("Teacher", "Admin"))],
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
    response_model=AchievementPointRule,
    dependencies=[Depends(require_role("Admin"))],
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
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Teacher", "Admin"))],
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
    response_model=StudentAchievement,
    dependencies=[Depends(require_role("Admin"))],
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
    response_model=list[StudentAchievement],
    dependencies=[Depends(require_role("Admin", "Teacher", "Parent"))],
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

    else:
        student_check = await service.db.get(Student, student_id)
        if not student_check:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

        # We need the student's profile to check their school_id
        student_profile = await service.db.get(Profile, student_check.user_id)
        if not student_profile or student_profile.school_id != school_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found in your school.")

    return await service.get_student_achievements(student_id=student_id, school_id=school_id, only_verified=verified_only)


@router.put(
    "/{achievement_id}",
    response_model=StudentAchievement,
    dependencies=[Depends(require_role("Teacher", "Admin"))],
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
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Teacher", "Admin"))],
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


@router.post("/agent/add-achievement", response_model=StudentAchievement, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role("Teacher", "Admin"))], summary="[AGENT] Add achievement using Student Name")
async def agent_add_student_achievement(achievement_in: AgentAddAchievement, service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    (ROBUST) Agent endpoint to add a student achievement using names.
    Translates Student Name to student_id.
    """
    school_id = current_user.school_id

    # 1. Translate Student Name to ID
    student = await service.get_student_by_name(achievement_in.student_name, school_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{achievement_in.student_name}' not found.")

    # 2. Get Active Academic Year ID
    active_year_id = await service.get_active_academic_year_id(school_id)
    if not active_year_id:
        raise HTTPException(status_code=400, detail="No active academic year is set for this school.")

    # 3. Build the internal schema
    internal_create_schema = StudentAchievementCreate(
        student_id=student.student_id,
        academic_year_id=active_year_id,
        achievement_type=achievement_in.achievement_type,
        title=achievement_in.title,
        achievement_category=achievement_in.achievement_category,
        date_awarded=achievement_in.date_awarded,
        # other fields will use defaults from schema
    )

    # 4. Call the original, secure service
    achievement = await service.add_achievement(achievement_data=internal_create_schema, awarded_by_user_id=current_user.user_id, school_id=school_id)
    if not achievement:
        # This should not happen if student was found, but as a safeguard
        raise HTTPException(status_code=500, detail="Failed to create achievement.")
    return achievement


@router.get("/agent/unverified", response_model=list[StudentAchievement], dependencies=[Depends(require_role("Admin"))], summary="[AGENT] Get all unverified achievements")
async def agent_get_unverified_achievements(service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    (ROBUST) Agent endpoint for Admins to get their "to-do list"
    of achievements pending verification.
    """
    _ensure_admin_privileges(current_user)  # Secure the endpoint
    school_id = current_user.school_id
    return await service.get_unverified_achievements(school_id=school_id)


@router.get("/agent/student-by-name/{student_name}", response_model=list[StudentAchievement], dependencies=[Depends(get_current_active_user)], summary="[AGENT] Get achievements using Student Name")
async def agent_get_achievements_for_student_by_name(student_name: str, verified_only: bool = True, service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    (ROBUST) Agent endpoint to get achievements using a student's name.
    """
    school_id = current_user.school_id

    # 1. Translate Student Name to ID
    student = await service.get_student_by_name(student_name, school_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{student_name}' not found.")

    # 2. Call the original, secure endpoint's logic
    # (We re-implement the parent check here for clarity)
    if is_parent(current_user) and not (is_school_admin(current_user) or is_teacher(current_user)):
        contact_stmt = (
            select(StudentContact)
            .where(
                StudentContact.student_id == student.student_id,
                StudentContact.profile_user_id == current_user.user_id,
                StudentContact.is_active.is_(True),
            )
            .limit(1)
        )
        contact_result = await service.db.execute(contact_stmt)
        if not contact_result.scalars().first():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this student's achievements.")
    return await service.get_student_achievements(student_id=student.student_id, school_id=school_id, only_verified=verified_only)


@router.get("/agent/points-lookup", response_model=AchievementPointRule, dependencies=[Depends(get_current_active_user)], summary="[AGENT] Look up points for an achievement")
async def agent_get_points_for_achievement(params: AgentPointsLookup = Depends(), service: AchievementService = Depends(get_achievement_service), current_user: Profile = Depends(get_current_active_user)):
    """
    (ROBUST) Agent endpoint to look up the points value for a potential achievement.
    """
    school_id = current_user.school_id
    rule = await service._get_rule_by_type_and_category(school_id=school_id, ach_type=params.achievement_type, category=params.category_name)
    if not rule:
        raise HTTPException(status_code=404, detail=f"No active point rule found for {params.achievement_type} / {params.category_name}.")
    return rule
