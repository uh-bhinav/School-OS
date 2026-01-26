# backend/app/models/media_item.py
from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class MediaItem(Base):
    """SQLAlchemy model representing a media asset stored for an album."""

    __tablename__ = "media_items"

    id = Column(Integer, primary_key=True, index=True)
    album_id = Column(Integer, ForeignKey("albums.id", ondelete="CASCADE"), nullable=False)
    storage_path = Column(String, nullable=False, unique=True)
    mime_type = Column(String(255))
    file_size_bytes = Column(Integer)
    uploaded_by_id = Column(UUID(as_uuid=False), ForeignKey("profiles.user_id"), nullable=False)
    item_metadata = Column("metadata", JSON, default=dict)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    album = relationship("Album", back_populates="media_items")
    uploader = relationship("Profile")

    def __repr__(self) -> str:
        return f"<MediaItem(id={self.id}, album_id={self.album_id}, storage_path='{self.storage_path}')>"
