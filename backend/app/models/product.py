# backend/app/models/product.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Product(Base):
    """
    SQLAlchemy model for the products table.
    """

    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("product_categories.category_id"))
    # Linking to the lookup table

    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Numeric, nullable=False)
    stock_quantity = Column(Integer, default=0)
    sku = Column(String)
    image_url = Column(String)
    is_active = Column(Boolean, default=True)

    # Relationships
    school = relationship("School")
    category = relationship("ProductCategory")
    # Assuming you created the ProductCategory model
