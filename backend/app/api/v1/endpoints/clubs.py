from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db_session
from app.core.security import RoleChecker
from app.models.profile import Profile
from app.schemas.club_schema import AgentAddMember, AgentClubCreate, ClubActivityCreate, ClubActivityRead, ClubActivityUpdate, ClubCreate, ClubMembershipCreate, ClubMembershipRead, ClubMembershipUpdate, ClubRead, ClubUpdate
from app.schemas.profile_schema import ProfileOut
from app.services.club_service import ClubService

router = APIRouter()

# --- Role Checkers ---
# Define roles. Adjust "Teacher" to "Teacher-in-charge" if you have such a role.
admin_or_teacher_roles = ["Admin", "Teacher"]
admin_role = ["Admin"]
student_role = ["Student"]

# --- Club Management Endpoints ---


@router.post("/", response_model=ClubRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(RoleChecker(admin_or_teacher_roles))])
async def create_club(club_in: ClubCreate, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    Create a new club. (Admin or Teacher)
    """
    service = ClubService(db)
    return await service.create_club(club_in, school_id=current_user.school_id)


@router.put("/{club_id}", response_model=ClubRead, dependencies=[Depends(RoleChecker(admin_or_teacher_roles))])
async def update_club(club_id: int, club_in: ClubUpdate, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    Update a club's details. (Admin or Teacher-in-charge)
    TODO: Add logic to check if current_user is the teacher_in_charge.
    """
    service = ClubService(db)
    updated_club = await service.update_club(club_id, club_in, current_user.school_id)
    if not updated_club:
        raise HTTPException(status_code=404, detail="Club not found")
    return updated_club


@router.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(RoleChecker(admin_role))])
async def delete_club(club_id: int, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    Delete a club. (Admin only)
    """
    service = ClubService(db)
    if not await service.delete_club(club_id, current_user.school_id):
        raise HTTPException(status_code=404, detail="Club not found")
    return


@router.get("/", response_model=list[ClubRead])
async def get_all_clubs(academic_year_id: Optional[int] = None, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    Get all active clubs for the user's school.
    """
    service = ClubService(db)
    return await service.get_clubs_by_school(current_user.school_id, academic_year_id, is_active=True)


@router.get("/my-clubs", response_model=list[ClubMembershipRead])
async def get_my_clubs(db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    Get all clubs the currently authenticated student is a member of.
    """
    if not current_user.student:
        raise HTTPException(status_code=403, detail="User is not a student")

    student_id = current_user.student.student_id
    service = ClubService(db)
    return await service.get_student_clubs(student_id, current_user.school_id)


@router.get("/{club_id}", response_model=ClubRead)
async def get_club_details(club_id: int, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    Get detailed information for a single club.
    """
    service = ClubService(db)
    club = await service.get_club_by_id(club_id, current_user.school_id)
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    return club


# --- Club Membership Endpoints ---


@router.post("/{club_id}/members", response_model=ClubMembershipRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(RoleChecker(admin_or_teacher_roles))])
async def add_club_member(club_id: int, member_in: ClubMembershipCreate, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):  # Schema only needs student_id
    """
    Add a student to a club. (Admin or Teacher-in-charge)
    TODO: Add logic to check if current_user is the teacher_in_charge.
    """
    if member_in.club_id != club_id:
        raise HTTPException(status_code=400, detail="Club ID mismatch")

    service = ClubService(db)
    membership = await service.add_student_to_club(member_in, approver_user_id=current_user.user_id, school_id=current_user.school_id)
    if not membership:
        raise HTTPException(status_code=400, detail="Could not add student. Club may be full or student is already a member.")
    return membership


@router.put("/members/{membership_id}", response_model=ClubMembershipRead, dependencies=[Depends(RoleChecker(admin_or_teacher_roles))])
async def update_club_member(membership_id: int, member_in: ClubMembershipUpdate, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    Update a member's role, status, score, etc. (Admin or Teacher-in-charge)
    TODO: Add logic to check if current_user is the teacher_in_charge.
    """
    service = ClubService(db)
    updated_member = await service.update_membership(membership_id, member_in, current_user.school_id)
    if not updated_member:
        raise HTTPException(status_code=404, detail="Membership not found")
    return updated_member


@router.delete("/members/{membership_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(RoleChecker(admin_or_teacher_roles))])
async def remove_club_member(membership_id: int, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    Remove a student from a club. (Admin or Teacher-in-charge)
    TODO: Add logic to check if current_user is the teacher_in_charge.
    """
    service = ClubService(db)
    if not await service.remove_member(membership_id, current_user.school_id):
        raise HTTPException(status_code=404, detail="Membership not found")
    return


@router.delete("/{club_id}/members/by-student/{student_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(RoleChecker(admin_or_teacher_roles))])
async def remove_club_member_by_student(club_id: int, student_id: int, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """Remove a student from a club using the student identifier."""
    service = ClubService(db)
    if not await service.remove_member_by_student(club_id, student_id, current_user.school_id):
        raise HTTPException(status_code=404, detail="Membership not found")
    return


@router.get("/{club_id}/members", response_model=list[ProfileOut])
async def get_club_members(club_id: int, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    Get a list of all active members (as student profiles) in a club.
    """
    service = ClubService(db)
    return await service.get_club_members(club_id, current_user.school_id)


# --- Club Activity Endpoints ---


@router.post("/{club_id}/activities", response_model=ClubActivityRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(RoleChecker(admin_or_teacher_roles))])
async def create_club_activity(club_id: int, activity_in: ClubActivityCreate, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    Create a new activity for a club. (Admin or Teacher-in-charge)
    TODO: Add logic to check if current_user is the teacher_in_charge.
    """
    service = ClubService(db)
    activity = await service.create_activity(club_id, activity_in, current_user.school_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Club not found")
    return activity


@router.put("/activities/{activity_id}", response_model=ClubActivityRead, dependencies=[Depends(RoleChecker(admin_or_teacher_roles))])
async def update_club_activity(activity_id: int, activity_in: ClubActivityUpdate, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    Update a club activity. (Admin or Teacher-in-charge)
    TODO: Add logic to check if current_user is the teacher_in_charge.
    """
    service = ClubService(db)
    activity = await service.update_activity(activity_id, activity_in, current_user.school_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity


@router.delete("/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(RoleChecker(admin_or_teacher_roles))])
async def delete_club_activity(activity_id: int, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    Delete a club activity. (Admin or Teacher-in-charge)
    TODO: Add logic to check if current_user is the teacher_in_charge.
    """
    service = ClubService(db)
    if not await service.delete_activity(activity_id, current_user.school_id):
        raise HTTPException(status_code=404, detail="Activity not found")
    return


@router.get("/{club_id}/activities", response_model=list[ClubActivityRead])
async def get_club_activities(club_id: int, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    Get all activities for a specific club.
    """
    service = ClubService(db)
    return await service.get_club_activities(club_id, current_user.school_id)


@router.get("/activities/upcoming", response_model=list[ClubActivityRead])
async def get_all_upcoming_activities(db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    Get all upcoming club activities for the entire school.
    """
    service = ClubService(db)
    return await service.get_upcoming_activities(current_user.school_id)


@router.post("/agent/create-club", response_model=ClubRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(RoleChecker(admin_or_teacher_roles))], summary="[AGENT] Create a club using names")
async def agent_create_club(club_in: AgentClubCreate, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    (ROBUST) Agent endpoint to create a club using teacher and club names.
    Translates names to IDs before calling the create service.
    """
    service = ClubService(db)
    school_id = current_user.school_id

    # 1. Translate Teacher Name to ID
    teacher = await service.get_teacher_by_name(club_in.teacher_coordinator_name, school_id)
    if not teacher:
        raise HTTPException(status_code=404, detail=f"Teacher '{club_in.teacher_coordinator_name}' not found.")

    # 2. Get Active Academic Year
    # This is a placeholder. Implement this service function.
    active_year_id = await service.get_active_academic_year(school_id)
    if not active_year_id:
        raise HTTPException(status_code=404, detail="No active academic year found.")

    # 3. Build the backend-compatible schema
    internal_club_create = ClubCreate(
        name=club_in.club_name,
        description=club_in.description,
        club_type=club_in.club_type,
        teacher_in_charge_id=teacher.id,
        academic_year_id=active_year_id,
        # Set other defaults as needed
    )

    # 4. Call the original, secure service
    return await service.create_club(internal_club_create, school_id=school_id)


@router.post("/agent/add-member", response_model=ClubMembershipRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(RoleChecker(admin_or_teacher_roles))], summary="[AGENT] Add student to club using names")
async def agent_add_member(member_in: AgentAddMember, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    (ROBUST) Agent endpoint to add a student to a club using names.
    Translates names to IDs.
    """
    service = ClubService(db)
    school_id = current_user.school_id

    # 1. Translate Club Name to ID
    club = await service.get_club_by_name(member_in.club_name, school_id)
    if not club:
        raise HTTPException(status_code=404, detail=f"Club '{member_in.club_name}' not found.")

    # 2. Translate Student Name to ID
    student = await service.get_student_by_name(member_in.student_name, school_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{member_in.student_name}' not found.")

    # 3. Build the backend-compatible schema
    internal_member_create = ClubMembershipCreate(student_id=student.student_id, club_id=club.id)

    # 4. Call the original, secure service
    membership = await service.add_student_to_club(internal_member_create, approver_user_id=current_user.user_id, school_id=school_id)
    if not membership:
        raise HTTPException(status_code=400, detail="Could not add student. Club may be full or student is already a member.")
    return membership


@router.get("/agent/club-members/{club_name}", response_model=list[ProfileOut], summary="[AGENT] Get club members using club name")
async def agent_get_club_members(club_name: str, db: AsyncSession = Depends(get_db_session), current_user: Profile = Depends(get_current_user)):
    """
    (ROBUST) Agent endpoint to get club members using the club's name.
    """
    service = ClubService(db)
    school_id = current_user.school_id

    # 1. Translate Club Name to ID
    club = await service.get_club_by_name(club_name, school_id)
    if not club:
        raise HTTPException(status_code=404, detail=f"Club '{club_name}' not found.")

    # 2. Call the original, secure service
    return await service.get_club_members(club.id, school_id)
