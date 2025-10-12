# backend/app/models/cart.py

from sqlalchemy import Column, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Cart(Base):
    """
    SQLAlchemy model for the carts table.
    Represents a shopping cart unique to each user (profile).
    """

    __tablename__ = "carts"

    cart_id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.user_id"), nullable=False, unique=True)

    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # --- Relationships ---

    # One-to-one relationship with Profile
    # Each cart belongs to exactly one user profile.
    user = relationship("Profile", back_populates="cart")

    # One-to-many relationship with CartItem
    # A cart can hold multiple items.
    # 'delete-orphan' cascade ensures that if an item is removed from the cart's
    # 'items' list, the CartItem record is deleted from the database.
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
