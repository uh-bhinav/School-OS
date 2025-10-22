"""# backend/app/models/cart_item.py
from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base_class import Base


# Assuming the Cart and Product models are available
class CartItem(Base):

    SQLAlchemy model for the cart_items table (Cart Details).


    __tablename__ = "cart_items"

    cart_item_id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.cart_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)

    quantity = Column(Integer, default=1)

    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")

    # Constraint ensures a user can only
    #  have one entry for a given product in their cart.
    __table_args__ = (
        UniqueConstraint("cart_id", "product_id", name="_cart_product_uc"),
    )
"""
