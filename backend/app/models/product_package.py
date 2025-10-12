# backend/app/models/product_package.py

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class PackageItem(Base):
    """
    SQLAlchemy model for the package_items table.
    Represents the association between a package and its products with quantity support.

    This is an association object (not a simple Table) to support the quantity field.
    """

    __tablename__ = "package_items"

    package_id = Column(Integer, ForeignKey("product_packages.id"), primary_key=True)
    product_id = Column(Integer, ForeignKey("products.product_id"), primary_key=True)
    quantity = Column(Integer, nullable=False, default=1)

    # Relationships
    package = relationship("ProductPackage", back_populates="items")
    product = relationship("Product", back_populates="package_items")

    # Constraints
    __table_args__ = (CheckConstraint("quantity > 0", name="chk_package_item_quantity_positive"),)


class ProductPackage(Base):
    """
    SQLAlchemy model for the product_packages table.
    Represents a bundle or "kit" of multiple products sold as a single unit,
    e.g., "Full Uniform Set" or "Grade 5 Textbook Bundle".
    """

    __tablename__ = "product_packages"

    id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)

    name = Column(String)
    description = Column(Text)
    price = Column(Numeric)
    image_url = Column(String)
    category = Column(String)
    academic_year = Column(String)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # --- Relationships ---

    # Many-to-one relationship with School
    school = relationship("School", back_populates="product_packages")

    # One-to-many relationship with PackageItem (association object)
    items = relationship("PackageItem", back_populates="package", cascade="all, delete-orphan")
