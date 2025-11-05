# backend/app/models/teacher.py

from sqlalchemy import (
    UUID,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)

# ADDED: Import JSONB for the new qualifications column
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Teacher(Base):
    """
    SQLAlchemy model for the teachers table.
    """

    __tablename__ = "teachers"

    # Primary Key
    teacher_id = Column(Integer, primary_key=True, index=True)

    # User Link (CRITICAL: user_id is NOT NULL in DB)
    user_id = Column(UUID, ForeignKey("profiles.user_id"), nullable=False, unique=True)

    # FK to Employment Status Lookup Table
    employment_status_id = Column(Integer, ForeignKey("employment_statuses.status_id"))

    # Core Profile Details
    department = Column(String(255))
    subject_specialization = Column(String(255))
    hire_date = Column(Date)
    years_of_experience = Column(Integer)
    is_certified = Column(Boolean)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    bio = Column(Text)
    # ADDED: New column to store structured qualifications
    qualifications = Column(JSONB)

    # Soft Delete & Timestamps
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Relationships
    # CHANGED: The relationship name is 'profile' to match the schema and service layers
    employment_status = relationship("EmploymentStatus")
    profile = relationship("Profile", back_populates="teacher")
    timetables = relationship("Timetable", back_populates="teacher")
    attendance_records = relationship("AttendanceRecord", back_populates="teacher")
    teacher_subjects = relationship(
        "app.models.teacher_subject.TeacherSubject",
        back_populates="teacher",
        lazy="selectin",
    )
    clubs_in_charge = relationship("Club", foreign_keys="[Club.teacher_in_charge_id]", back_populates="teacher_in_charge", lazy="selectin")
