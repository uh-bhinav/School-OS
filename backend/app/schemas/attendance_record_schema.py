# backend/app/schemas/attendance_record_schema.py
from datetime import date
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class AttendanceStatus(str, Enum):
    present = "Present"
    absent = "Absent"
    late = "Late"


# Properties to receive on creation (for a single record)
class AttendanceRecordCreate(BaseModel):
    student_id: int
    class_id: int
    status: AttendanceStatus = AttendanceStatus.present
    period_id: Optional[int] = None
    teacher_id: Optional[int] = None
    notes: Optional[str] = None
    date: Optional[date] = date.today()


# Properties to receive on update
class AttendanceRecordUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    notes: Optional[str] = None


# Properties to return to the client
class AttendanceRecordOut(BaseModel):
    id: int
    student_id: int
    class_id: int
    date: date
    status: AttendanceStatus
    period_id: Optional[int] = None
    teacher_id: Optional[int] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True
