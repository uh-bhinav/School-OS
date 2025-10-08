# backend/app/agents/modules/academics/leaves/attendance_agent/schemas.py

from datetime import date, datetime
from typing import Optional

from pydantic.v1 import BaseModel, Field, validator


class MarkStudentAttendanceSchema(BaseModel):
    """Input schema for the mark_student_attendance tool."""

    student_id: str = Field(
        ...,
        description="The unique identifier of the student whose attendance is being marked.",
        min_length=1,
    )
    attendance_date: str = Field(
        ...,
        description="The date for which attendance is being marked (format: YYYY-MM-DD).",
        min_length=10,
    )
    status: str = Field(
        ...,
        description="The attendance status: 'present', 'absent', 'late', or 'excused'.",
        min_length=1,
    )
    class_name: Optional[str] = Field(default=None, description="Optional: The class name for additional context.")
    remarks: Optional[str] = Field(
        default=None,
        description="Optional: Any additional remarks or notes about the attendance.",
    )

    @validator("attendance_date")
    def validate_attendance_date(cls, v):
        """Ensure attendance_date is in correct format and not in the future."""
        try:
            attendance_date_obj = datetime.strptime(v, "%Y-%m-%d").date()
            if attendance_date_obj > date.today():
                raise ValueError("Attendance date cannot be in the future")
            return v
        except ValueError as e:
            if "does not match format" in str(e):
                raise ValueError("Attendance date must be in YYYY-MM-DD format")
            raise e

    @validator("status")
    def validate_status(cls, v):
        """Ensure status is one of the allowed values."""
        allowed_statuses = ["present", "absent", "late", "excused"]
        if v.lower() not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v.lower()

    class Config:
        schema_extra = {
            "example": {
                "student_id": "STU-2025-001",
                "attendance_date": "2025-10-06",
                "status": "present",
                "class_name": "10A",
                "remarks": "Arrived on time",
            }
        }


class GetStudentAttendanceForDateRangeSchema(BaseModel):
    """Input schema for the get_student_attendance_for_date_range tool."""

    student_id: str = Field(..., description="The unique identifier of the student.", min_length=1)
    start_date: str = Field(
        ...,
        description="The start date of the range (format: YYYY-MM-DD).",
        min_length=10,
    )
    end_date: str = Field(
        ...,
        description="The end date of the range (format: YYYY-MM-DD).",
        min_length=10,
    )
    class_name: Optional[str] = Field(default=None, description="Optional: Filter by specific class.")

    @validator("start_date", "end_date")
    def validate_date_format(cls, v):
        """Ensure dates are in correct format."""
        try:
            datetime.strptime(v, "%Y-%m-%d").date()
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")

    @validator("end_date")
    def validate_date_range(cls, v, values):
        """Ensure end_date is not before start_date."""
        if "start_date" in values:
            start = datetime.strptime(values["start_date"], "%Y-%m-%d").date()
            end = datetime.strptime(v, "%Y-%m-%d").date()
            if end < start:
                raise ValueError("End date cannot be before start date")
        return v

    class Config:
        schema_extra = {
            "example": {
                "student_id": "STU-2025-001",
                "start_date": "2025-09-01",
                "end_date": "2025-09-30",
                "class_name": "10A",
            }
        }


class GetClassAttendanceForDateSchema(BaseModel):
    """Input schema for the get_class_attendance_for_date tool."""

    class_name: str = Field(
        ...,
        description="The name of the class whose attendance is required, e.g., '10A', '12 Science'.",
        min_length=1,
    )
    attendance_date: str = Field(
        ...,
        description="The date for which attendance is required (format: YYYY-MM-DD).",
        min_length=10,
    )

    @validator("attendance_date")
    def validate_attendance_date(cls, v):
        """Ensure attendance_date is in correct format."""
        try:
            datetime.strptime(v, "%Y-%m-%d").date()
            return v
        except ValueError:
            raise ValueError("Attendance date must be in YYYY-MM-DD format")

    class Config:
        schema_extra = {"example": {"class_name": "10A", "attendance_date": "2025-10-06"}}


class GetStudentAttendanceSummarySchema(BaseModel):
    """Input schema for the get_student_attendance_summary tool."""

    student_id: str = Field(..., description="The unique identifier of the student.", min_length=1)
    academic_term: Optional[str] = Field(
        default="current",
        description="The academic term for which to calculate attendance. Defaults to 'current'.",
    )
    class_name: Optional[str] = Field(default=None, description="Optional: Filter by specific class.")

    class Config:
        schema_extra = {
            "example": {
                "student_id": "STU-2025-001",
                "academic_term": "current",
                "class_name": "10A",
            }
        }


# Export all schemas
__all__ = [
    "MarkStudentAttendanceSchema",
    "GetStudentAttendanceForDateRangeSchema",
    "GetClassAttendanceForDateSchema",
    "GetStudentAttendanceSummarySchema",
]
