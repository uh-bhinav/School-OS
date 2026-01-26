# backend/app/models/academic_year.py
from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class AcademicYear(Base):
    """
    SQLAlchemy model for the academic_years table.
    """

    __tablename__ = "academic_years"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    name = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationship to the school
    school = relationship("School")
    timetables = relationship("Timetable", back_populates="academic_year")
    student_achievements = relationship("StudentAchievement", back_populates="academic_year")
    clubs = relationship("Club", back_populates="academic_year")
