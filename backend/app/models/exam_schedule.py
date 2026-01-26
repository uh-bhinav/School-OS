# backend/app/models/exam_schedule.py
"""
Models for period-based exam scheduling system with subject-date mapping
"""
from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class ExamPeriod(Base):
    """
    Represents an examination period (e.g., Mid-Term, Final Exams)
    Replaces the single-exam paradigm with a period-based approach
    """
    __tablename__ = "exam_periods"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.class_id"), nullable=False)
    section = Column(String, nullable=False)
    
    # Period identification
    exam_period_name = Column(String, nullable=False)  # e.g., "Mid-Term Examination 2026"
    exam_type_id = Column(Integer, ForeignKey("exam_types.exam_type_id"), nullable=False)
    
    # Date range for the entire exam period
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    # Total marks for all subjects in this period
    total_marks = Column(Integer, nullable=False)
    
    # Status tracking
    status = Column(String, default="draft")  # draft, scheduled, in_progress, completed
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    school = relationship("School")
    academic_year = relationship("AcademicYear")
    class_obj = relationship("Class", foreign_keys=[class_id])
    exam_type = relationship("ExamType")
    subject_schedules = relationship("SubjectExamSchedule", back_populates="exam_period", cascade="all, delete-orphan")


class SubjectExamSchedule(Base):
    """
    Maps individual subjects to specific dates within an exam period
    Allows auto-mapping and manual overrides
    """
    __tablename__ = "subject_exam_schedules"

    id = Column(Integer, primary_key=True, index=True)
    exam_period_id = Column(Integer, ForeignKey("exam_periods.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), nullable=False)
    
    # Scheduled exam details
    exam_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=True)  # e.g., 09:00 AM
    duration_minutes = Column(Integer, default=60)  # Duration in minutes
    
    # Marks for this specific subject exam
    max_marks = Column(Integer, nullable=False)
    
    # Manual override tracking
    is_auto_mapped = Column(Boolean, default=True)
    manually_edited_at = Column(DateTime(timezone=True), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    exam_period = relationship("ExamPeriod", back_populates="subject_schedules")
    subject = relationship("Subject")


class Holiday(Base):
    """
    Indian public holidays (national + state-level)
    Used to exclude holidays from exam scheduling
    """
    __tablename__ = "holidays"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g., "Republic Day"
    date = Column(Date, nullable=False, index=True)
    
    # Holiday classification
    holiday_type = Column(String, nullable=False)  # national, state, school_specific
    state = Column(String, nullable=True)  # For state-specific holidays (e.g., "Maharashtra")
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=True)  # For school-specific holidays
    
    # Optional description
    description = Column(Text, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    school = relationship("School")


class HallTicket(Base):
    """
    Auto-generated hall tickets for students once exam schedule is finalized
    """
    __tablename__ = "hall_tickets"

    id = Column(Integer, primary_key=True, index=True)
    exam_period_id = Column(Integer, ForeignKey("exam_periods.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    
    # Hall ticket details
    ticket_number = Column(String, unique=True, nullable=False, index=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # PDF storage (optional - can store S3/Supabase URL)
    pdf_url = Column(String, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    exam_period = relationship("ExamPeriod")
    student = relationship("Student")