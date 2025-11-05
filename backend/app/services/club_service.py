from datetime import datetime
from typing import Optional, Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload, selectinload

from app.models.club import Club
from app.models.club_activity import ClubActivity
from app.models.club_membership import ClubMembership
from app.models.profile import Profile
from app.models.student import Student
from app.models.user_roles import UserRole
from app.schemas.club_schema import (
    ClubActivityCreate,
    ClubActivityStatus,
    ClubActivityUpdate,
    ClubCreate,
    ClubMembershipCreate,
    ClubMembershipUpdate,
    ClubUpdate,
)
from app.schemas.enums import ClubMembershipStatus


class ClubService:
    def __init__(self, db_session: AsyncSession):
        self.db = db_session

    # --- Club Management ---

    async def create_club(self, club_data: ClubCreate, school_id: int) -> Club:
        # Convert objectives list to JSON string if needed, or handle in model
        db_club = Club(**club_data.model_dump(), school_id=school_id)
        self.db.add(db_club)
        await self.db.commit()
        await self.db.refresh(db_club)
        return db_club

    async def get_club_by_id(self, club_id: int, school_id: int) -> Optional[Club]:
        stmt = select(Club).where(Club.id == club_id, Club.school_id == school_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def update_club(self, club_id: int, club_data: ClubUpdate, school_id: int) -> Optional[Club]:
        db_club = await self.get_club_by_id(club_id, school_id)
        if not db_club:
            return None

        update_data = club_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_club, key, value)

        await self.db.commit()
        await self.db.refresh(db_club)
        return db_club

    async def delete_club(self, club_id: int, school_id: int) -> bool:
        db_club = await self.get_club_by_id(club_id, school_id)
        if not db_club:
            return False

        await self.db.delete(db_club)
        await self.db.commit()
        return True

    async def get_clubs_by_school(self, school_id: int, academic_year_id: Optional[int] = None, is_active: bool = True) -> Sequence[Club]:
        stmt = select(Club).where(Club.school_id == school_id, Club.is_active == is_active)
        if academic_year_id:
            stmt = stmt.where(Club.academic_year_id == academic_year_id)

        result = await self.db.execute(stmt)
        return result.scalars().all()

    # --- Club Membership Management ---

    async def add_student_to_club(self, membership_data: ClubMembershipCreate, approver_user_id: UUID, school_id: int) -> Optional[ClubMembership]:
        # Check if club exists and belongs to the school
        club = await self.get_club_by_id(membership_data.club_id, school_id)
        if not club:
            return None  # Or raise HTTPException

        # Check for membership capacity
        if club.max_members is not None and club.current_member_count >= club.max_members:
            return None  # Or raise HTTPException(400, "Club is full")

        # Check if student is already an active member
        stmt = select(ClubMembership).where(
            ClubMembership.club_id == membership_data.club_id,
            ClubMembership.student_id == membership_data.student_id,
            ClubMembership.status == ClubMembershipStatus.ACTIVE,
        )
        result = await self.db.execute(stmt)
        if result.scalars().first():
            return None  # Or raise HTTPException(400, "Student is already an active member")

        db_membership = ClubMembership(**membership_data.model_dump(), approved_by_user_id=approver_user_id)
        self.db.add(db_membership)
        await self.db.commit()
        await self.db.refresh(db_membership)
        return db_membership

    async def get_membership_by_id(self, membership_id: int) -> Optional[ClubMembership]:
        stmt = select(ClubMembership).where(ClubMembership.id == membership_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def update_membership(self, membership_id: int, membership_data: ClubMembershipUpdate, school_id: int) -> Optional[ClubMembership]:
        stmt = select(ClubMembership).join(Club).where(ClubMembership.id == membership_id, Club.school_id == school_id)
        result = await self.db.execute(stmt)
        db_membership = result.scalars().first()

        if not db_membership:
            return None

        update_data = membership_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_membership, key, value)

        await self.db.commit()
        await self.db.refresh(db_membership)
        return db_membership

    async def remove_member(self, membership_id: int, school_id: int) -> bool:
        # Ensure membership belongs to the school
        stmt = select(ClubMembership).join(Club).where(ClubMembership.id == membership_id, Club.school_id == school_id)
        result = await self.db.execute(stmt)
        db_membership = result.scalars().first()

        if not db_membership:
            return False

        await self.db.delete(db_membership)
        await self.db.commit()
        return True

    async def get_club_members(self, club_id: int, school_id: int) -> Sequence[Profile]:
        # Return student profiles for members of a specific club
        stmt = (
            select(Profile)
            .join(Student, Student.user_id == Profile.user_id)
            .join(ClubMembership)
            .join(Club)
            .where(
                Club.id == club_id,
                Club.school_id == school_id,
                ClubMembership.status == ClubMembershipStatus.ACTIVE,
            )
            .options(
                selectinload(Profile.student),
                selectinload(Profile.roles).selectinload(UserRole.role_definition),
                selectinload(Profile.teacher),
            )
        )

        result = await self.db.execute(stmt)
        return result.scalars().unique().all()

    async def get_student_clubs(self, student_id: int, school_id: int) -> Sequence[ClubMembership]:
        stmt = (
            select(ClubMembership)
            .join(Club)
            .where(
                ClubMembership.student_id == student_id,
                Club.school_id == school_id,
                ClubMembership.status == ClubMembershipStatus.ACTIVE,
            )
            .options(joinedload(ClubMembership.club))
        )

        result = await self.db.execute(stmt)
        return result.scalars().all()

    # --- Club Activity Management ---

    async def create_activity(self, club_id: int, activity_data: ClubActivityCreate, school_id: int) -> Optional[ClubActivity]:
        # Check if club exists and belongs to the school
        club = await self.get_club_by_id(club_id, school_id)
        if not club:
            return None  # Or raise HTTPException

        db_activity = ClubActivity(**activity_data.model_dump(), club_id=club_id)
        self.db.add(db_activity)
        await self.db.commit()
        await self.db.refresh(db_activity)
        return db_activity

    async def get_activity_by_id(self, activity_id: int) -> Optional[ClubActivity]:
        stmt = select(ClubActivity).where(ClubActivity.id == activity_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def update_activity(self, activity_id: int, activity_data: ClubActivityUpdate, school_id: int) -> Optional[ClubActivity]:
        stmt = select(ClubActivity).join(Club).where(ClubActivity.id == activity_id, Club.school_id == school_id)
        result = await self.db.execute(stmt)
        db_activity = result.scalars().first()

        if not db_activity:
            return None

        update_data = activity_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_activity, key, value)

        await self.db.commit()
        await self.db.refresh(db_activity)
        return db_activity

    async def delete_activity(self, activity_id: int, school_id: int) -> bool:
        stmt = select(ClubActivity).join(Club).where(ClubActivity.id == activity_id, Club.school_id == school_id)
        result = await self.db.execute(stmt)
        db_activity = result.scalars().first()

        if not db_activity:
            return False

        await self.db.delete(db_activity)
        await self.db.commit()
        return True

    async def get_club_activities(self, club_id: int, school_id: int) -> Sequence[ClubActivity]:
        stmt = select(ClubActivity).join(Club).where(Club.id == club_id, Club.school_id == school_id).order_by(ClubActivity.scheduled_date.desc())

        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_upcoming_activities(self, school_id: int) -> Sequence[ClubActivity]:
        stmt = (
            select(ClubActivity)
            .join(Club)
            .where(Club.school_id == school_id, ClubActivity.scheduled_date >= datetime.utcnow().date(), ClubActivity.status.in_([ClubActivityStatus.PLANNED, ClubActivityStatus.ONGOING]))
            .order_by(ClubActivity.scheduled_date.asc())
        )

        result = await self.db.execute(stmt)
        return result.scalars().all()
