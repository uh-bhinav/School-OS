from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.models.package_item import package_items_association


class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("product_categories.category_id"))
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Numeric)
    stock_quantity = Column(Integer)
    sku = Column(String)
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
    reorder_level = Column(Integer)
    manufacturer = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    school = relationship("School")
    category = relationship("ProductCategory", back_populates="products")
    packages = relationship("ProductPackage", secondary=package_items_association, back_populates="products")
    album_links = relationship("ProductAlbumLink", back_populates="product", cascade="all, delete-orphan")
