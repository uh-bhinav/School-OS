# backend/app/models/product.py
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.models.package_item import package_items_association


class Product(Base):
    """
    SQLAlchemy model for the products table.
    """

    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("product_categories.category_id"))

    name = Column(String)
    description = Column(String)
    price = Column(Numeric)
    stock_quantity = Column(Integer, nullable=True)
    sku = Column(String)
    # The 'image_url' column is now deprecated in favor of the 'images' relationship
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
    reorder_level = Column(Integer)
    manufacturer = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    school = relationship("School")
    category = relationship("ProductCategory")

    packages = relationship("ProductPackage", secondary=package_items_association, back_populates="products")

    # Bidirectional relationship to ProductAlbumLink
    images = relationship("ProductAlbumLink", back_populates="product", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Product(id={self.product_id}, name='{self.name}')>"
