# app/models/payment.py

from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))

    amount_paid = Column(Numeric)
    transaction_id = Column(String)
    payment_date = Column(TIMESTAMP(timezone=True))
    payment_method = Column(String)
    status = Column(String)

    # A payment belongs to a single invoice
    invoice = relationship("Invoice", back_populates="payments")
