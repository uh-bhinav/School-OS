from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, Numeric

from app.db.base_class import Base


class AppliedDiscount(Base):
    __tablename__ = "applied_discounts"

    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    discount_id = Column(Integer, ForeignKey("discounts.id"), nullable=False)
    amount_discounted = Column(Numeric(10, 2), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default="now()")
