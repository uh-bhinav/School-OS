# backend/app/models/exam.py
from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    exam_name = Column(String)
    exam_type_id = Column(Integer, ForeignKey("exam_types.exam_type_id"))
    start_date = Column(Date)
    end_date = Column(Date)
    marks = Column(Numeric(10, 2))
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))

    # CRITICAL FIX: Soft Delete field required by the service logic
    is_active = Column(Boolean, default=True)

    # Relationships
    school = relationship("School")
    exam_type = relationship("ExamType")
    academic_year = relationship("AcademicYear")
    marks_records = relationship("Mark", back_populates="exam")
