# REPLACE the import block at the top of the file with this:
from sqlalchemy import Column, Date, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class ClassAttendanceWeekly(Base):
    """
    SQLAlchemy model for the class_attendance_weekly summary table.
    This table stores pre-calculated weekly attendance summaries for performance.
    The application should only READ from this table for reporting.
    """

    __tablename__ = "class_attendance_weekly"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.class_id"), nullable=False)
    week_start_date = Column(Date, nullable=False)
    total_students = Column(Integer, nullable=False)
    total_present = Column(Integer, nullable=False)
    total_absent = Column(Integer, nullable=False)
    attendance_percentage = Column(Float, nullable=False)

    # --- Relationships ---
    school = relationship("School")
    class_info = relationship("Class")
