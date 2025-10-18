# backend/app/models/media_item.py
from sqlalchemy import JSON, BigInteger, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class MediaItem(Base):
    __tablename__ = "media_items"

    id = Column(Integer, primary_key=True, index=True)
    album_id = Column(Integer, ForeignKey("albums.id"))
    uploaded_by_id = Column(String, ForeignKey("profiles.user_id"))  # Assuming UUID is stored as String
    metadata = Column(JSON)

    # Updated and new columns from Task 1.4
    storage_path = Column(String(255))
    mime_type = Column(String(255))
    file_size_bytes = Column(BigInteger)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to Album
    album = relationship("Album")

    def __repr__(self):
        return f"<MediaItem(id={self.id}, path='{self.storage_path}')>"
