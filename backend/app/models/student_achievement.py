# backend/app/models/student_achievement.py

from sqlalchemy import TIMESTAMP, Boolean, CheckConstraint, Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SQLAEnum
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.schemas.enums import AchievementType, AchievementVisibility


class StudentAchievement(Base):
    __tablename__ = "student_achievements"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id", ondelete="CASCADE"), nullable=False, index=True)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id", ondelete="RESTRICT"), nullable=False)
    awarded_by_user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.user_id", ondelete="RESTRICT"), nullable=False)
    verified_by_user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.user_id", ondelete="SET NULL"), nullable=True)

    achievement_type = Column(SQLAEnum(AchievementType, name="achievement_type", create_type=False), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    achievement_category = Column(String(100), nullable=False)

    points_awarded = Column(Integer, nullable=False, default=0)

    date_awarded = Column(Date, nullable=False)

    certificate_url = Column(String(500))
    evidence_urls = Column(JSONB, default=[])

    is_verified = Column(Boolean, nullable=False, default=False)
    verified_at = Column(TIMESTAMP(timezone=True))

    visibility = Column(SQLAEnum(AchievementVisibility, name="achievement_visibility", create_type=False), nullable=False, default=AchievementVisibility.school_only, index=True)

    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("points_awarded >= 0", name="chk_points_non_negative"),
        CheckConstraint("date_awarded <= CURRENT_DATE", name="chk_date_awarded_not_future"),
    )

    student = relationship("Student", back_populates="achievements", lazy="selectin")
    school = relationship("School", back_populates="student_achievements", lazy="selectin")
    academic_year = relationship("AcademicYear", back_populates="student_achievements", lazy="selectin")
    awarded_by = relationship("Profile", foreign_keys=[awarded_by_user_id], lazy="selectin")
    verified_by = relationship("Profile", foreign_keys=[verified_by_user_id], lazy="selectin")
