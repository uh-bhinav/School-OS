# backend/app/models/profile.py
from sqlalchemy import UUID, Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Profile(Base):
    __tablename__ = "profiles"
    user_id = Column(UUID(as_uuid=True), primary_key=True)  #
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)  #
    first_name = Column(String)  #
    last_name = Column(String)  #
    is_active = Column(Boolean, default=True)  #

    roles = relationship("UserRole", back_populates="profile")
