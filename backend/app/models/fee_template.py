# backend/app/models/fee_template.py
"""from sqlalchemy import Column, Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class FeeTemplate(Base):

    SQLAlchemy model for the fee_templates table (Fee Structure).


    __tablename__ = "fee_templates"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))

    name = Column(String, nullable=False)
    description = Column(String)
    total_amount = Column(Numeric)
    status = Column(String, default="Draft")
    start_date = Column(Date)
    end_date = Column(Date)

    # Relationships
    school = relationship("School")
    academic_year = relationship("AcademicYear")
"""
