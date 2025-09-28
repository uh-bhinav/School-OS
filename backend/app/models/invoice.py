# backend/app/models/invoice.py
from sqlalchemy import Column, Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Invoice(Base):
    """
    SQLAlchemy model for the invoices table.
    """

    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"))
    fee_structure_id = Column(Integer, ForeignKey("fee_templates.id"))
    fee_term_id = Column(Integer, ForeignKey("fee_terms.id"))

    status = Column(String, default="Unpaid")
    invoice_number = Column(String, unique=True, nullable=False)
    due_date = Column(Date)
    amount_due = Column(Numeric, nullable=False)
    late_fee_applied = Column(Numeric, default=0)

    # Relationships
    student = relationship("Student", back_populates="invoices")
    fee_template = relationship("FeeTemplate")
    fee_term = relationship("FeeTerm")
