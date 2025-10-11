# backend/app/models/class_model.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship

from app.db.base_class import Base

# Define the association table for the many-to-many relationship
class_subjects_association = Table(
    "class_subjects",
    Base.metadata,
    Column("class_id", Integer, ForeignKey("classes.class_id"), primary_key=True),
    Column("subject_id", Integer, ForeignKey("subjects.subject_id"), primary_key=True),
)


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

    # NEW: Many-to-many relationship to subjects
    subjects = relationship("Subject", secondary=class_subjects_association, lazy="selectin")

    timetables = relationship("Timetable", back_populates="class_record")
    attendance_records = relationship("AttendanceRecord", back_populates="class_record")
    class_fee_structures = relationship("ClassFeeStructure", back_populates="class_")
