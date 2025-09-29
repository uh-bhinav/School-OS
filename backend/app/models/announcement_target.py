# backend/app/models/announcement_target.py
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class AnnouncementTarget(Base):
    """
    SQLAlchemy model for the announcement_targets table (Audience Detail).
    """

    __tablename__ = "announcement_targets"

    id = Column(Integer, primary_key=True, index=True)
    announcement_id = Column(Integer, ForeignKey("announcements.id"))

    # Target type defines how to interpret target_id (e.g., 'GRADE', 'CLASS', 'SCHOOL')
    target_type = Column(String, nullable=False)
    target_id = Column(Integer)  # ID corresponding to target_type (e.g., a class_id)

    # Relationships
    announcement = relationship("Announcement", back_populates="targets")
