# backend/app/models/fee_template.py
from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class FeeTemplate(Base):
    """SQLAlchemy model for the fee_templates table (Fee Structure)."""

    __tablename__ = "fee_templates"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))

    name = Column(String, nullable=False)
    description = Column(String)
    # total_amount = Column(Numeric)
    status = Column(String, default="Draft")
    start_date = Column(Date)
    end_date = Column(Date)

    # Relationships
    school = relationship("School", back_populates="fee_templates")
    academic_year = relationship("AcademicYear")  # This is likely one-way, no back_populates needed unless defined in AcademicYear
    fee_terms = relationship("FeeTerm", back_populates="fee_template", cascade="all, delete-orphan")
    components = relationship("FeeComponent", secondary="fee_template_components", back_populates="templates")
