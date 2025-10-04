"""# backend/app/models/product_package.py (Completed)
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.models.package_item import package_items_association


class ProductPackage(Base):

    SQLAlchemy model for the product_packages table (Bundles).


    __tablename__ = "product_packages"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"))

    name = Column(String, nullable=True)
    description = Column(String)
    price = Column(Numeric)
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(
        DateTime(timezone=True), default=func.now(), onupdate=func.now()
    )
    # Relationships
    school = relationship("School")

    # 2. Relationship to the target Product table, accessed via the junction
    products = relationship(
        "Product", secondary=package_items_association, back_populates="packages"
    )
"""
