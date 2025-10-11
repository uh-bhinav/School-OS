# app/models/fee_component.py

from sqlalchemy import TIMESTAMP, Boolean, Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class FeeComponent(Base):
    __tablename__ = "fee_components"

    id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)

    component_name = Column(String, nullable=False)
    component_type = Column(String, nullable=False)
    base_amount = Column(Numeric, nullable=True)
    is_mandatory = Column(Boolean, default=True)
    payment_frequency = Column(String, default="Annual")

    created_at = Column(TIMESTAMP(timezone=True), server_default="now()")

    school = relationship("School", back_populates="fee_components")
    class_fee_structures = relationship("ClassFeeStructure", back_populates="fee_component")
    templates = relationship("FeeTemplate", secondary="fee_template_components", back_populates="components")
    student_assignments = relationship("StudentFeeAssignment", back_populates="fee_component")
