# backend/app/models/class_model.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Class(Base):
    """
    SQLAlchemy model for the classes table.
    """

    __tablename__ = "classes"

    class_id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    grade_level = Column(Integer, nullable=False)
    section = Column(String, nullable=False)
    class_teacher_id = Column(Integer, ForeignKey("teachers.teacher_id"))
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"), nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    school = relationship("School")
    class_teacher = relationship("Teacher")
    academic_year = relationship("AcademicYear")
