from sqlalchemy import Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False, index=True)
    fee_component_id = Column(Integer, ForeignKey("fee_components.id"), nullable=False)

    # Snapshotting the name and amount is crucial for historical accuracy
    component_name = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)

    # Relationship to the parent invoice
    invoice = relationship("Invoice", back_populates="items")
    fee_component = relationship("FeeComponent")
