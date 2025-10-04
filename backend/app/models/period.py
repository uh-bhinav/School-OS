# backend/app/models/period.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Time
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Period(Base):
    """
    SQLAlchemy model for the periods table.
    """

    __tablename__ = "periods"

    id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    period_number = Column(Integer)
    start_time = Column(Time)
    end_time = Column(Time)
    is_recess = Column(Boolean, default=False)
    period_name = Column(String)

    school = relationship("School")

    timetables = relationship("Timetable", back_populates="period")
