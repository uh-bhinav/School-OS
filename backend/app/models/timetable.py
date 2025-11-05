# backend/app/models/timetable.py
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Timetable(Base):
    __tablename__ = "timetable"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.class_id"))
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"))
    teacher_id = Column(Integer, ForeignKey("teachers.teacher_id"))
    period_id = Column(Integer, ForeignKey("periods.id"))
    day_of_week = Column(Integer)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Relationships
    school = relationship("School")
    class_record = relationship(
        "Class",
        back_populates="timetables",
        foreign_keys=[class_id],
    )
    teacher = relationship("Teacher", back_populates="timetables")
    period = relationship("Period", back_populates="timetables")
    academic_year = relationship("AcademicYear", back_populates="timetables")
    subject = relationship("Subject", back_populates="timetables")
