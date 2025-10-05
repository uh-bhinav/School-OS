# backend/app/models/student.py
from sqlalchemy import (
    UUID,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Student(Base):
    """
    SQLAlchemy model for the students table.
    """

    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("profiles.user_id"), nullable=False, unique=True
    )
    current_class_id = Column(Integer, ForeignKey("classes.class_id"), nullable=True)
    proctor_teacher_id = Column(Integer, ForeignKey("teachers.teacher_id"))
    roll_number = Column(String)
    enrollment_date = Column(Date)
    academic_status = Column(String, default="Active")
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(
        DateTime(timezone=True), default=func.now(), onupdate=func.now()
    )

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
