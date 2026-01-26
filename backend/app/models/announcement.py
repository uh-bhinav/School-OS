# backend/app/models/announcement.py
from sqlalchemy import (
    JSON,
    UUID,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Announcement(Base):
    """
    SQLAlchemy model for the announcements table (Header).
    """

    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"))
    published_by_id = Column(UUID, ForeignKey("profiles.user_id"))

    title = Column(String, nullable=True)
    content = Column(JSON)  # Stores the message body/rich text
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), default=func.now())
    language = Column(String)  # Character varying is String in SQLAlchemy
    # Relationships
    targets = relationship("AnnouncementTarget", back_populates="announcement")  # Link to target audience
