from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Refund(Base):
    __tablename__ = "refunds"

    id = Column(Integer, primary_key=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False)

    # Gateway-specific ID for the refund transaction, e.g., 'rfnd_...' from Razorpay
    gateway_refund_id = Column(String(255), unique=True)

    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="INR")
    reason = Column(Text, nullable=False)

    status = Column(ENUM("pending", "processed", "failed", name="refund_status", create_type=False), nullable=False, default="pending")

    # Audit trail for who processed the refund
    processed_by_user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.user_id"))
    notes = Column(Text)

    created_at = Column(TIMESTAMP(timezone=True), server_default="now()")
    updated_at = Column(TIMESTAMP(timezone=True), server_default="now()", onupdate="now()")

    # Relationship to the original payment
    payment = relationship("Payment")
