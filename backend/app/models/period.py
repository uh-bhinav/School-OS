# backend/app/models/period.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Time
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Period(Base):
    """
    SQLAlchemy model for the periods table.
    Supports both day-agnostic periods (school_id=1) and
    day-specific periods (school_id=2).
    """

    __tablename__ = "periods"

    id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    period_number = Column(Integer)
    start_time = Column(Time)
    end_time = Column(Time)
    duration_minutes = Column(Integer)  # ADD: Missing from your model
    is_recess = Column(Boolean, default=False)
    period_name = Column(String)
    day_of_week = Column(String, nullable=True)  # ADD: For day-specific periods
    is_active = Column(Boolean, default=True, nullable=False)

    school = relationship("School")
    timetables = relationship("Timetable", back_populates="period")
