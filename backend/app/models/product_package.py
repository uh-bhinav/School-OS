# backend/app/models/product_package.py

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Table,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

# Association Table for the many-to-many relationship between ProductPackage and Product
package_items_association = Table(
    "package_items",
    Base.metadata,
    Column("package_id", Integer, ForeignKey("product_packages.id"), primary_key=True),
    Column("product_id", Integer, ForeignKey("products.product_id"), primary_key=True),
)


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
    academic_year = Column(String)  # Note: As per schema, could be academic_year_id FK in a future version.
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # --- Relationships ---

    # Many-to-one relationship with School
    school = relationship("School", back_populates="product_packages")

    # Many-to-many relationship with Product
    # This allows a package to contain multiple products, and a product to be in multiple packages.
    items = relationship("Product", secondary=package_items_association, back_populates="packages")
