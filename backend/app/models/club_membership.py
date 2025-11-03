# backend/app/models/club_membership.py

from sqlalchemy import TIMESTAMP, CheckConstraint, Column, Date, ForeignKey, Integer, Text
from sqlalchemy import Enum as SQLAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.schemas.enums import ClubMembershipRole, ClubMembershipStatus


class ClubMembership(Base):
    __tablename__ = "club_memberships"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False, index=True)
    approved_by_user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.user_id", ondelete="RESTRICT"), nullable=False)

    role = Column(SQLAEnum(ClubMembershipRole, name="club_membership_role", create_type=False), nullable=False, default=ClubMembershipRole.member, index=True)
    joined_date = Column(Date, nullable=False, server_default=func.current_date())
    status = Column(SQLAEnum(ClubMembershipStatus, name="club_membership_status", create_type=False), nullable=False, default=ClubMembershipStatus.active, index=True)

    attendance_count = Column(Integer, nullable=False, default=0)
    contribution_score = Column(Integer, nullable=False, default=0)

    exit_date = Column(Date)
    exit_reason = Column(Text)

    notes = Column(Text)

    approved_at = Column(TIMESTAMP(timezone=True))

    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("attendance_count >= 0", name="chk_attendance_count_non_negative"),
        CheckConstraint("contribution_score >= 0", name="chk_contribution_score_non_negative"),
        CheckConstraint("exit_date IS NULL OR exit_date > joined_date", name="chk_membership_dates"),
        CheckConstraint("exit_date IS NULL OR status != 'active'", name="chk_membership_exit_status"),
    )

    club = relationship("Club", back_populates="memberships", lazy="selectin")
    student = relationship("Student", back_populates="club_memberships", lazy="selectin")
    approved_by = relationship("Profile", foreign_keys=[approved_by_user_id], lazy="selectin")
