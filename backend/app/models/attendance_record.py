# backend/app/models/attendance_record.py "Don't use import List from typing"
import datetime

from sqlalchemy import TIMESTAMP, Column, Date, ForeignKey, Integer, String, text
from sqlalchemy.orm import relationship

from app.db.base import Base


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.class_id"), nullable=False)
    date = Column(Date, nullable=False, default=datetime.date.today)
    status = Column(String, nullable=False)  # 'Present', 'Absent', 'Late'
    period_id = Column(Integer, ForeignKey("periods.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.teacher_id"))
    notes = Column(String)
    recorded_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("timezone('utc'::text, now())"),
        nullable=False,
    )

    # Relationships
    student = relationship("Student", back_populates="attendance_records")
    class_record = relationship("Class", back_populates="attendance_records")
    teacher = relationship("Teacher", back_populates="attendance_records")
