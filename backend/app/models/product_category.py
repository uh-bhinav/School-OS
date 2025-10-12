# backend/app/models/product_category.py

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class ProductCategory(Base):
    """
    SQLAlchemy model for the product_categories table.
    Represents a category for organizing products in the e-commerce store,
    e.g., "Uniforms", "Books", "Stationery".
    """

    __tablename__ = "product_categories"

    category_id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    category_name = Column(String, nullable=False)

    # --- Relationships ---

    # Many-to-one relationship with School
    # This assumes the 'School' model has a 'product_categories' back-reference.
    school = relationship("School", back_populates="product_categories")

    # One-to-many relationship with Product
    # A category can contain multiple products.
    products = relationship("Product", back_populates="category")
