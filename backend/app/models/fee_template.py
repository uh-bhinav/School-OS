# backend/app/models/fee_template.py
from decimal import Decimal

from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class FeeTemplate(Base):
    """SQLAlchemy model for the fee_templates table (Fee Structure)."""

    __tablename__ = "fee_templates"

    @hybrid_property
    def total_amount(self) -> Decimal:
        """Calculates the total amount by summing all associated fee terms."""
        if not self.fee_terms:
            return Decimal("0.00")
        return sum(Decimal(term.amount) for term in self.fee_terms)

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))

    name = Column(String, nullable=False)
    description = Column(String)
    status = Column(String, default="Draft")
    start_date = Column(Date)
    end_date = Column(Date)

    # Relationships
    school = relationship("School", back_populates="fee_templates")
    academic_year = relationship("AcademicYear")  # This is likely one-way, no back_populates needed unless defined in AcademicYear
    fee_terms = relationship("FeeTerm", back_populates="fee_template", cascade="all, delete-orphan")
    components = relationship("FeeComponent", secondary="fee_template_components", back_populates="templates")
