# backend/app/models/exam_type.py
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class ExamType(Base):
    """
    SQLAlchemy model for the exam_types table.
    """

    __tablename__ = "exam_types"

    exam_type_id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    type_name = Column(String, nullable=True)

    school = relationship("School")
