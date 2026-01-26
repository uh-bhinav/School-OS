from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class PaymentAllocation(Base):
    __tablename__ = "payment_allocations"

    id = Column(Integer, primary_key=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False)
    invoice_item_id = Column(Integer, ForeignKey("invoice_items.id"), nullable=False)

    amount_allocated = Column(Numeric(10, 2), nullable=False)

    # Audit trail for who performed the allocation
    allocated_by_user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.user_id"))
    notes = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default="now()")

    # Relationships
    payment = relationship("Payment")
    invoice_item = relationship("InvoiceItem")
    user = relationship("Profile")
