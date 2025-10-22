# backend/app/schemas/attendance_record_schema.py
from datetime import date as Date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


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
    date: Date = Field(default_factory=Date.today)


# Properties to receive on update
class AttendanceRecordUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    notes: Optional[str] = None


# Type alias for bulk creation payloads (plain list of single-record payloads)
AttendanceRecordBulkCreate = list[AttendanceRecordCreate]


# Properties to return to the client
class AttendanceRecordOut(BaseModel):
    id: int
    student_id: int
    class_id: int
    date: Date
    status: AttendanceStatus
    period_id: Optional[int] = None
    teacher_id: Optional[int] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class ClassAttendanceSummaryOut(BaseModel):
    class_id: int
    week_start_date: Date
    total_students: int
    total_present: int
    total_absent: int
    attendance_percentage: float

    class Config:
        from_attributes = True
