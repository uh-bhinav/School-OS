# backend/app/models/product_category.py
"""
SQLAlchemy model for the product_categories table.
Represents a category for organizing products in the e-commerce store,
e.g., "Uniforms", "Books", "Stationery".
"""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class ProductCategory(Base):
    """Product Category Model for E-commerce Module"""

    __tablename__ = "product_categories"

    # Primary Key
    category_id = Column(Integer, primary_key=True, autoincrement=True)

    # Foreign Keys
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False, index=True)

    # Core Fields
    category_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Display & Organization
    display_order = Column(Integer, nullable=True)
    icon_url = Column(String(500), nullable=True)

    # Status & Metadata
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    # --- Relationships ---

    # Many-to-one relationship with School
    school = relationship("School", back_populates="product_categories", lazy="selectin")

    # One-to-many relationship with Product
    products = relationship("Product", back_populates="category", lazy="selectin")
