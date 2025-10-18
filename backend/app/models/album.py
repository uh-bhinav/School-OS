# backend/app/models/album.py
from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Album(Base):
    __tablename__ = "albums"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    school_id = Column(Integer, ForeignKey("schools.school_id"))
    published_by_id = Column(String, ForeignKey("profiles.user_id"))  # Assuming UUID is stored as String
    is_public = Column(Boolean, default=False)
    metadata = Column(JSON)

    # New columns from Task 1.3
    album_type = Column(String(255))
    access_scope = Column(String(255))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Bidirectional relationship to AlbumTarget
    # When an Album is deleted, all its targets will be deleted automatically.
    targets = relationship("AlbumTarget", back_populates="album", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Album(id={self.id}, title='{self.title}')>"
