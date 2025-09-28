# backend/app/models/product_package.py (Completed)
from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class ProductPackage(Base):
    """
    SQLAlchemy model for the product_packages table (Bundles).
    """

    __tablename__ = "product_packages"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"))

    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Numeric)
    image_url = Column(String)
    is_active = Column(Boolean, default=True)

    # Relationships
    school = relationship("School")

    # 1. Relationship to the junction table (PackageItem)
    items = relationship("PackageItem", back_populates="package")

    # 2. Relationship to the target Product table, accessed via the junction
    products = relationship(
        "Product", secondary="package_items", back_populates="packages"
    )
