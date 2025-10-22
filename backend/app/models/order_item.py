"""# backend/app/models/order_item.py
from sqlalchemy import Column, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.db.base_class import Base

# Assuming the Product and Order models are available


class OrderItem(Base):

    SQLAlchemy model for the order_items table.


    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"))

    quantity = Column(Integer, nullable=False)
    price_at_time_of_order = Column(Numeric, nullable=False)  # Critical for audit trail

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product")
"""
