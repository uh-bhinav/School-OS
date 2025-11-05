# backend/app/models/club_activity.py

from sqlalchemy import TIMESTAMP, Boolean, CheckConstraint, Column, Date, ForeignKey, Integer, Numeric, String, Text, Time
from sqlalchemy import Enum as SQLAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.schemas.enums import ClubActivityStatus, ClubActivityType


class ClubActivity(Base):
    __tablename__ = "club_activities"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, index=True)
    organized_by_student_id = Column(
        "student_id",
        Integer,
        ForeignKey("students.student_id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    activity_name = Column(String(255), nullable=False)
    activity_type = Column(
        SQLAEnum(
            ClubActivityType,
            name="club_activity_type",
            create_type=False,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
        index=True,
    )
    description = Column(Text)

    scheduled_date = Column(Date, nullable=False, index=True)
    start_time = Column(Time)
    end_time = Column(Time)
    venue = Column(String(255))

    attendance_mandatory = Column(Boolean, nullable=False, default=False)
    max_participants = Column(Integer)

    budget_allocated = Column(Numeric(10, 2))

    status = Column(
        SQLAEnum(
            ClubActivityStatus,
            name="club_activity_status",
            create_type=False,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
        default=ClubActivityStatus.PLANNED,
        index=True,
    )
    outcome_notes = Column(Text)

    media_urls = Column(JSONB, default=[])

    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("max_participants IS NULL OR max_participants > 0", name="chk_max_participants_positive"),
        CheckConstraint("budget_allocated IS NULL OR budget_allocated >= 0", name="chk_budget_non_negative"),
        CheckConstraint("end_time IS NULL OR start_time IS NULL OR end_time > start_time", name="chk_activity_time"),
        CheckConstraint("scheduled_date >= CURRENT_DATE - INTERVAL '1 year'", name="chk_activity_scheduled_future"),
    )

    club = relationship("Club", back_populates="activities", lazy="selectin")
    organized_by_student = relationship(
        "Student",
        back_populates="organized_club_activities",
        foreign_keys=[organized_by_student_id],
        lazy="selectin",
    )
