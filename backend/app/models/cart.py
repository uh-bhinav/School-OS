"""# backend/app/models/cart.py
from sqlalchemy import UUID, Column, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

# Assuming the Profile model is available


class Cart(Base):

    SQLAlchemy model for the carts table (Shopping Cart Header).


    __tablename__ = "carts"

    cart_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID, ForeignKey("profiles.user_id"), nullable=False, unique=True)  # One cart per user
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("Profile")
    items = relationship("CartItem", back_populates="cart")  # Link to cart items
"""
