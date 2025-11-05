# backend/app/models/club.py

from sqlalchemy import TIMESTAMP, Boolean, CheckConstraint, Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SQLAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.schemas.enums import ClubType, MeetingFrequency


class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id", ondelete="CASCADE"), nullable=False, index=True)
    teacher_in_charge_id = Column(Integer, ForeignKey("teachers.teacher_id", ondelete="RESTRICT"), nullable=False, index=True)
    assistant_teacher_id = Column(Integer, ForeignKey("teachers.teacher_id", ondelete="SET NULL"), nullable=True)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id", ondelete="RESTRICT"), nullable=False, index=True)

    name = Column(String(255), nullable=False)
    description = Column(Text)
    club_type = Column(
        SQLAEnum(
            ClubType,
            name="club_type",
            create_type=False,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
        index=True,
    )
    logo_url = Column(String(500))

    meeting_schedule = Column(JSONB)
    meeting_frequency = Column(
        SQLAEnum(
            MeetingFrequency,
            name="meeting_frequency",
            create_type=False,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
        default=MeetingFrequency.WEEKLY,
    )

    max_members = Column(Integer)
    current_member_count = Column(Integer, nullable=False, default=0)

    registration_open = Column(Boolean, nullable=False, default=True)
    registration_start_date = Column(Date)
    registration_end_date = Column(Date)

    club_rules = Column(Text)
    objectives = Column(JSONB, default=[])

    is_active = Column(Boolean, nullable=False, default=True, index=True)

    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("max_members IS NULL OR max_members > 0", name="chk_max_members_positive"),
        CheckConstraint("current_member_count >= 0", name="chk_current_member_count_non_negative"),
        CheckConstraint("max_members IS NULL OR current_member_count <= max_members", name="chk_club_member_capacity"),
        CheckConstraint("registration_end_date IS NULL OR registration_end_date > registration_start_date", name="chk_club_registration_dates"),
    )

    school = relationship("School", back_populates="clubs", lazy="selectin")
    teacher_in_charge = relationship("Teacher", foreign_keys=[teacher_in_charge_id], back_populates="clubs_in_charge", lazy="selectin")
    assistant_teacher = relationship("Teacher", foreign_keys=[assistant_teacher_id], lazy="selectin")
    academic_year = relationship("AcademicYear", back_populates="clubs", lazy="selectin")
    memberships = relationship("ClubMembership", back_populates="club", cascade="all, delete-orphan", lazy="selectin")
    activities = relationship("ClubActivity", back_populates="club", cascade="all, delete-orphan", lazy="selectin")
