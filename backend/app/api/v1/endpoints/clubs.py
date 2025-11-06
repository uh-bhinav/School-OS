from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db_session
from app.core.security import RoleChecker
from app.models.profile import Profile
from app.schemas.club_schema import ClubActivityCreate, ClubActivityRead, ClubActivityUpdate, ClubCreate, ClubMembershipCreate, ClubMembershipRead, ClubMembershipUpdate, ClubRead, ClubUpdate
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
