# backend/app/models/cart_item.py

from sqlalchemy import CheckConstraint, Column, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class CartItem(Base):
    """
    SQLAlchemy model for the cart_items table.
    Represents a single line item in a user's shopping cart, linking a
    product to a cart with a specified quantity.

    BUSINESS RULE: A cart cannot have duplicate products.
    If a product is added again, the quantity should be incremented in the service layer.
    """

    __tablename__ = "cart_items"

    cart_item_id = Column(Integer, primary_key=True)
    cart_id = Column(Integer, ForeignKey("carts.cart_id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)

    # --- Relationships ---

    # Many-to-one relationship with Cart
    cart = relationship("Cart", back_populates="items", lazy="selectin")

    # Many-to-one relationship with Product
    product = relationship("Product", back_populates="cart_items", lazy="selectin")

    # --- Constraints ---
    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_cart_item_quantity_positive"),
        UniqueConstraint("cart_id", "product_id", name="uq_cart_product"),
    )
