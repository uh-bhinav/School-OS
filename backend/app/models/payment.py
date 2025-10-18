# app/models/payment.py

from sqlalchemy import TIMESTAMP, CheckConstraint, Column, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.dialects.postgresql.json import JSONB
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"))
    student_id = Column(Integer, ForeignKey("students.student_id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.user_id"))
    order_id = Column(Integer, ForeignKey("orders.order_id"))

    amount_paid = Column(Numeric(10, 2))
    currency = Column(String(3), nullable=False, default="INR")

    # --- Gateway Specific Fields ---
    gateway_name = Column(String(50), nullable=False, default="razorpay")
    gateway_payment_id = Column(String(255), unique=True)
    gateway_order_id = Column(String(255))
    gateway_signature = Column(Text)

    # --- Status and Metadata Fields ---
    status = Column(ENUM("pending", "authorized", "captured", "failed", "refunded", "partially_refunded", name="payment_status", create_type=False), default="pending")
    reconciliation_status = Column(ENUM("pending", "reconciled", "discrepancy", "under_review", "settled", name="reconciliation_status", create_type=False), default="pending")
    method = Column(String(50))
    error_code = Column(String(255))
    error_description = Column(Text)

    payment_metadata = Column("metadata", JSONB)

    created_at = Column(TIMESTAMP(timezone=True), server_default="now()")
    updated_at = Column(TIMESTAMP(timezone=True), server_default="now()", onupdate="now()")

    # Relationships
    invoice = relationship("Invoice", back_populates="payments")
    order = relationship("Order", back_populates="payment")
    student = relationship("Student")
    user = relationship("Profile")

    __table_args__ = (CheckConstraint("(invoice_id IS NOT NULL AND order_id IS NULL) OR (invoice_id IS NULL AND order_id IS NOT NULL)", name="chk_payment_target"),)
