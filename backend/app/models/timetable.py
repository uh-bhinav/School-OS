from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func  # Needed for timestamps

from app.db.base import Base


class Timetable(Base):
    __tablename__ = "timetable"

    id = Column(Integer, primary_key=True, index=True)

    # CRITICAL ADDITION: Multi-Tenancy Field (DB says NOT NULL)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)

    class_id = Column(Integer, ForeignKey("classes.class_id"))
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"))
    teacher_id = Column(Integer, ForeignKey("teachers.teacher_id"))
    period_id = Column(Integer, ForeignKey("periods.id"))

    # CONSTRAINT FIX: DB says is_nullable is YES, so model should reflect that.
    day_of_week = Column(Integer)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))

    # CRITICAL ADDITION: Soft Delete and Audit Fields
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Relationships
    # Add relationship for the new school_id column
    school = relationship("School")

    class_record = relationship("Class", back_populates="timetables")
    subject = relationship("Subject", back_populates="timetables")
    teacher = relationship("Teacher", back_populates="timetables")
    period = relationship("Period", back_populates="timetables")
    academic_year = relationship("AcademicYear", back_populates="timetables")
