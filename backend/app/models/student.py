# backend/app/models/student.py
from sqlalchemy import (
    UUID,
    Boolean,
    Column,
    Date,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class Student(Base):
    """
    SQLAlchemy model for the students table.
    """

    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("profiles.user_id"), nullable=False, unique=True
    )
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    current_class_id = Column(Integer, ForeignKey("classes.class_id"), nullable=True)
    roll_number = Column(String)
    enrollment_date = Column(Date)
    is_active = Column(Boolean, default=True)

    # --- Relationships ---

    # One-to-one relationship with Profile
    profile = relationship("Profile", back_populates="student")

    # Many-to-one relationship with Class
    current_class = relationship("Class")

    # One-to-many relationship with Mark
    marks_records = relationship("Mark", back_populates="student")

    # One-to-many relationship with AttendanceRecord
    attendance_records = relationship("AttendanceRecord", back_populates="student")

    contacts = relationship("StudentContact", back_populates="student")

    # Relationship with invoices
    invoices = relationship("Invoice", back_populates="student")
