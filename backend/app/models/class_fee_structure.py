# app/models/class_fee_structure.py

from sqlalchemy import Column, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class ClassFeeStructure(Base):
    __tablename__ = "class_fee_structure"

    id = Column(Integer, primary_key=True)
    class_id = Column(Integer, ForeignKey("classes.class_id"), nullable=False)
    component_id = Column(Integer, ForeignKey("fee_components.id"), nullable=False)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"), nullable=False)

    amount = Column(Numeric, nullable=False)

    # Relationships
    fee_component = relationship("FeeComponent")
    academic_year = relationship("AcademicYear")
    class_ = relationship("Class", back_populates="class_fee_structures")
    fee_component = relationship("FeeComponent", back_populates="class_fee_structures")
