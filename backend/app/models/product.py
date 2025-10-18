# backend/app/models/product.py

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


class Product(Base):
    """
    SQLAlchemy model for the products table.
    Represents an item available for sale in the school's e-commerce store,
    such as uniforms, books, or stationery.
    """

    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("product_categories.category_id"), nullable=True)

    name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    sku = Column(String, unique=True)
    image_url = Column(String)
    manufacturer = Column(String)
    reorder_level = Column(Integer)
    reorder_quantity = Column(Integer)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # --- Relationships ---

    # Many-to-one relationship with School
    school = relationship("School", back_populates="products", lazy="selectin")

    # Many-to-one relationship with ProductCategory
    category = relationship("ProductCategory", back_populates="products", lazy="selectin")

    # One-to-many relationship with CartItem
    cart_items = relationship("CartItem", back_populates="product", lazy="selectin")

    # One-to-many relationship with OrderItem
    order_items = relationship("OrderItem", back_populates="product", lazy="selectin")

    # One-to-many relationship with PackageItem (association object)
    package_items = relationship("PackageItem", back_populates="product", lazy="selectin")

    # --- Constraints ---
    __table_args__ = (
        CheckConstraint("stock_quantity >= 0", name="chk_product_stock_non_negative"),
        CheckConstraint("price > 0", name="chk_product_price_positive"),
    )

    # --- Computed Properties ---

    @property
    def availability(self):
        """
        Computed property: Product availability status based on stock and active status.

        Business Logic:
        - DISCONTINUED: Product is not active
        - OUT_OF_STOCK: Active but stock = 0
        - LOW_STOCK: Active with stock 1-10
        - IN_STOCK: Active with stock > 10
        """
        from app.schemas.enums import ProductAvailability

        if not self.is_active:
            return ProductAvailability.DISCONTINUED

        if self.stock_quantity == 0:
            return ProductAvailability.OUT_OF_STOCK

        if self.stock_quantity <= 10:
            return ProductAvailability.LOW_STOCK

        return ProductAvailability.IN_STOCK
