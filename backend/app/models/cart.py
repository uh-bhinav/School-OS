# backend/app/models/cart.py
from sqlalchemy import UUID, Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.base import Base

# Assuming the Profile model is available


class Cart(Base):
    """
    SQLAlchemy model for the carts table (Shopping Cart Header).
    """

    __tablename__ = "carts"

    cart_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        UUID, ForeignKey("profiles.user_id"), nullable=False, unique=True
    )  # One cart per user

    # Relationships
    user = relationship("Profile")
    items = relationship("CartItem", back_populates="cart")  # Link to cart items
