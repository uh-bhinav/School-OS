# backend/app/models/product_album_link.py
from sqlalchemy import BigInteger, Boolean, Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class ProductAlbumLink(Base):
    """SQLAlchemy model for linking products to their album images."""

    __tablename__ = "product_album_links"

    id = Column(BigInteger, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    album_id = Column(Integer, ForeignKey("albums.id", ondelete="CASCADE"), nullable=False)
    storage_path = Column(String(1024), nullable=False, unique=True)
    is_primary = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)

    # Relationships
    product = relationship("Product", back_populates="images")
    album = relationship("Album")  # This is a one-way relationship for now

    __table_args__ = (UniqueConstraint("product_id", "display_order", name="_product_display_order_uc"),)

    def __repr__(self):
        return f"<ProductAlbumLink(product_id={self.product_id}, path='{self.storage_path}')>"
