# backend/app/models/invoice.py
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Invoice(Base):
    """SQLAlchemy model for the invoices table."""

    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=True)
    fee_structure_id = Column(Integer, ForeignKey("fee_templates.id"), nullable=True)
    fee_term_id = Column(Integer, ForeignKey("fee_terms.id"))
    payment_date = Column(Date)
    fine_amount = Column(Numeric)
    scholarship_ref = Column(String)
    payment_method = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    status = Column(String, default="Unpaid")
    invoice_number = Column(String, nullable=False, unique=True)
    due_date = Column(Date, nullable=True)
    amount_due = Column(Numeric, nullable=False)
    late_fee_applied = Column(Numeric, default=0)

    # Relationships
    student = relationship("Student", back_populates="invoices")
    fee_template = relationship("FeeTemplate")
    fee_term = relationship("FeeTerm")
    payments = relationship("Payment", back_populates="invoice")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
