# backend/app/models/album.py
from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Album(Base):
    __tablename__ = "albums"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    school_id = Column(Integer, ForeignKey("schools.school_id"))
    published_by_id = Column(UUID(as_uuid=True), ForeignKey("profiles.user_id"))
    is_public = Column(Boolean, default=False)
    album_metadata = Column("metadata", JSON)

    # New columns from Task 1.3
    album_type = Column(String(255))
    access_scope = Column(String(255))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Bidirectional relationship to AlbumTarget
    # When an Album is deleted, all its targets will be deleted automatically.
    targets = relationship("AlbumTarget", back_populates="album", cascade="all, delete-orphan")
    media_items = relationship("MediaItem", back_populates="album", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Album(id={self.id}, title='{self.title}')>"
