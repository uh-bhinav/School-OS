# backend/app/models/timetable.py
from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.base import Base


class Timetable(Base):
    __tablename__ = "timetable"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.class_id"))
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"))
    teacher_id = Column(Integer, ForeignKey("teachers.teacher_id"))
    period_id = Column(Integer, ForeignKey("periods.id"))
    day_of_week = Column(Integer, nullable=False)  # 1 for Monday, 5 for Friday
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))

    # Relationships
    class_record = relationship("Class", back_populates="timetables")
    subject = relationship("Subject", back_populates="timetables")
    teacher = relationship("Teacher", back_populates="timetables")
    period = relationship("Period", back_populates="timetables")
    academic_year = relationship("AcademicYear", back_populates="timetables")
