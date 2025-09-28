# backend/app/models/product_category.py
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class ProductCategory(Base):
    """
    SQLAlchemy model for the product_categories table.
    """

    __tablename__ = "product_categories"

    category_id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    category_name = Column(String)

    school = relationship("School")
