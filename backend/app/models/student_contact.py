# backend/app/models/student_contact.py
from sqlalchemy import UUID, Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class StudentContact(Base):
    __tablename__ = "student_contacts"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    profile_user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.user_id"))

    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String)
    relationship_type = Column(String, nullable=False)  # e.g., 'Father', 'Mother'

    is_emergency_contact = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    custody_notes = Column(Text)

    # Relationships to link back to the main models
    student = relationship("Student", back_populates="contacts")
    parent_profile = relationship("Profile", back_populates="contact_for_students")
