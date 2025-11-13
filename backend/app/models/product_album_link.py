from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class ProductAlbumLink(Base):
    __tablename__ = "product_album_links"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    album_id = Column(Integer, ForeignKey("albums.id", ondelete="CASCADE"), nullable=False)
    storage_path = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)

    product = relationship("Product")
    album = relationship("Album")
