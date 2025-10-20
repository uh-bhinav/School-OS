# backend/app/models/album_target.py
from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class AlbumTarget(Base):
    """SQLAlchemy model for the album_targets table."""

    __tablename__ = "album_targets"

    id = Column(Integer, primary_key=True, index=True)
    album_id = Column(Integer, ForeignKey("albums.id", ondelete="CASCADE"), nullable=False)
    target_type = Column(String, nullable=False)
    target_id = Column(Integer, nullable=False)

    # Establish the relationship to the Album model
    album = relationship("Album", back_populates="targets")

    __table_args__ = (UniqueConstraint("album_id", "target_type", "target_id", name="_album_target_uc"),)

    def __repr__(self):
        return f"<AlbumTarget(album_id={self.album_id}, type='{self.target_type}', id={self.target_id})>"
