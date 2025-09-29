# backend/app/models/announcement.py
from sqlalchemy import JSON, UUID, Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Announcement(Base):
    """
    SQLAlchemy model for the announcements table (Header).
    """

    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"))
    published_by_id = Column(UUID, ForeignKey("profiles.user_id"))

    title = Column(String, nullable=False)
    content = Column(JSON)  # Stores the message body/rich text
    is_active = Column(Boolean, default=True)

    # Relationships
    targets = relationship(
        "AnnouncementTarget", back_populates="announcement"
    )  # Link to target audience
