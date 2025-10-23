from sqlalchemy import Boolean, Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class StudentFeeAssignment(Base):
    __tablename__ = "student_fee_assignments"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    fee_component_id = Column(Integer, ForeignKey("fee_components.id"), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)

    # Relationships for easy data access
    student = relationship("Student", back_populates="fee_assignments")
    fee_component = relationship("FeeComponent", back_populates="student_assignments")
