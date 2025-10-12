# backend/app/models/order_item.py
from sqlalchemy import Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class OrderItem(Base):
    """
    SQLAlchemy model for the order_items table.
    Represents a snapshot of a product at the time of order creation.
    This immutable record preserves historical pricing for audit purposes.
    """

    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id"))
    package_id = Column(Integer, ForeignKey("product_packages.id"))
    # NOTE: Either product_id OR package_id will be populated, not both

    quantity = Column(Integer, nullable=False)
    price_at_time_of_order = Column(Numeric(10, 2), nullable=False)
    # CRITICAL: This preserves the price even if product.price changes later

    status = Column(String)  # Individual item status (e.g., 'pending', 'fulfilled')

    # --- Relationships ---
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    package = relationship("ProductPackage")
