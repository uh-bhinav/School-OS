# backend/app/models/mark.py
from sqlalchemy import Column, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.db.base import Base


class Mark(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), nullable=False)
    marks_obtained = Column(Numeric(5, 2), nullable=False)
    entered_by_teacher_id = Column(Integer, ForeignKey("teachers.teacher_id"))

    # Relationships
    student = relationship("Student", back_populates="marks_records")
    exam = relationship("Exam", back_populates="marks_records")
    subject = relationship("Subject", back_populates="marks_records")
