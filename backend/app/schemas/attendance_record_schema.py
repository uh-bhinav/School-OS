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


class AttendanceSheetStudent(BaseModel):
    """A single student on the attendance sheet (the 'to-do' list)."""

    student_id: int
    full_name: str
    roll_number: Optional[str] = None
    status: AttendanceStatus = AttendanceStatus.present  # Default to present


class AgentAttendanceSheet(BaseModel):
    """The 'to-do' list for a teacher taking attendance."""

    class_id: int
    class_name: str
    date: Date
    students: list[AttendanceSheetStudent]


class AgentTakeAttendanceRequest(BaseModel):
    """The schema the agent uses to *submit* attendance."""

    class_name: str
    date: Date
    present_student_ids: list[int] = Field(..., description="List of student IDs who are PRESENT.")
    absent_student_ids: list[int] = Field(..., description="List of student IDs who are ABSENT.")
    late_student_ids: list[int] = Field(default_factory=list, description="List of student IDs who are LATE.")


class DailyAbsenteeRecord(BaseModel):
    """A single record for the Admin's daily absentee report."""

    student_id: int
    full_name: str
    class_name: str
    status: AttendanceStatus
    notes: Optional[str] = None


class LowAttendanceStudent(BaseModel):
    """A single record for the low attendance report."""

    student_id: int
    full_name: str
    class_name: str
    attendance_percentage: float
    total_days: int
    absent_days: int
