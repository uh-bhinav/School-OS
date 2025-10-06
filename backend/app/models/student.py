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
    # REMOVED: The 'school_id' column does not exist on this table.
    # It is accessed via the relationship to the Profile model.
    # school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    current_class_id = Column(Integer, ForeignKey("classes.class_id"), nullable=True)
    roll_number = Column(String)
    enrollment_date = Column(Date)
    is_active = Column(Boolean, default=True)

    # --- Relationships ---
    profile = relationship("Profile", back_populates="student")
    current_class = relationship("Class")
    marks_records = relationship("Mark", back_populates="student")
    attendance_records = relationship("AttendanceRecord", back_populates="student")
    contacts = relationship("StudentContact", back_populates="student")
