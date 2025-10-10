# backend/app/models/mark.py
from sqlalchemy import Column, ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Mark(Base):
    """
    SQLAlchemy model for the marks table.
    This now perfectly matches your database schema.
    """

    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), nullable=False)
    marks_obtained = Column(Numeric(5, 2), nullable=False)
    max_marks = Column(Numeric, nullable=False, default=100.0)
    remarks = Column(Text)

    # Relationships
    student = relationship("Student", back_populates="marks_records")
    exam = relationship("Exam", back_populates="marks_records")
    # FIX: The relationship name is now singular to match best practice.
    subject = relationship("Subject", back_populates="marks_records")
