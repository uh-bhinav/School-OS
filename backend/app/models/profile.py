import uuid

from sqlalchemy import (
    UUID,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Profile(Base):
    """
    SQLAlchemy model for the profiles table.
    """

    __tablename__ = "profiles"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    phone_number = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # --- THE FINAL FIX: Removed the 'notes' column that does not exist in the DB ---

    # --- Relationships ---
    school = relationship("School")
    roles = relationship("UserRole", back_populates="profile", lazy="joined")
    student = relationship("Student", back_populates="profile", uselist=False)
    teacher = relationship("Teacher", back_populates="profile", uselist=False)
    contact_for_students = relationship("StudentContact", back_populates="parent_profile")
    cart = relationship("Cart", back_populates="profile", uselist=False)
