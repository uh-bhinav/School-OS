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
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.user_id"), nullable=False, unique=True)
    # REMOVED: The 'school_id' column does not exist on this table.
    # It is accessed via the relationship to the Profile model.
    # school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    current_class_id = Column(Integer, ForeignKey("classes.class_id"), nullable=True)
    proctor_teacher_id = Column(Integer, ForeignKey("teachers.teacher_id"))
    roll_number = Column(String)
    enrollment_date = Column(Date)
    academic_status = Column(String, default="Active")
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # --- Relationships ---
    profile = relationship("Profile", back_populates="student")
    current_class = relationship("Class")
    marks_records = relationship("Mark", back_populates="student")
    attendance_records = relationship("AttendanceRecord", back_populates="student")
    contacts = relationship("StudentContact", back_populates="student")
    invoices = relationship("Invoice", back_populates="student")
    fee_discounts = relationship("StudentFeeDiscount", back_populates="student")
    fee_assignments = relationship("StudentFeeAssignment", back_populates="student")
    orders = relationship("Order", back_populates="student")
    achievements = relationship("StudentAchievement", back_populates="student", lazy="selectin")
    club_memberships = relationship("ClubMembership", back_populates="student", lazy="selectin")
    # organized_club_activities = relationship("ClubActivity", back_populates="organized_by_student", lazy="selectin")
