# backend/app/models/teacher_subject.py

from sqlalchemy import TIMESTAMP, Boolean, CheckConstraint, Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy import Enum as SQLAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.schemas.enums import ProficiencyLevel


class TeacherSubject(Base):
    __tablename__ = "teacher_subjects"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.teacher_id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id", ondelete="CASCADE"), nullable=False, index=True)

    is_primary = Column(Boolean, nullable=False, default=False)
    proficiency_level = Column(SQLAEnum(ProficiencyLevel, name="proficiency_level", create_type=False), nullable=False, default=ProficiencyLevel.intermediate, index=True)
    years_teaching_subject = Column(Integer, default=0)
    certification_number = Column(String(100))

    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("years_teaching_subject >= 0", name="chk_years_teaching_non_negative"),
        UniqueConstraint("teacher_id", "subject_id", name="unique_teacher_subject"),
    )

    teacher = relationship("Teacher", back_populates="teacher_subjects", lazy="selectin")
    subject = relationship("Subject", back_populates="teacher_subjects", lazy="selectin")
