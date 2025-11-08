# File: app/agents/modules/academics/leaves/attendance_agent/schemas.py

import datetime
from datetime import date
from typing import Optional

from pydantic.v1 import BaseModel, Field

# --- Tool Schemas ---


class GetMyAttendanceReportSchema(BaseModel):
    """Input schema for the get_my_attendance_report tool."""

    date_range: Optional[str] = Field(default=None, description="Optional date range (e.g., 'last 30 days', 'this term').")


class GetClassAttendanceSheetSchema(BaseModel):
    """Input schema for the get_class_attendance_sheet tool."""

    class_name: str = Field(..., description="The name of the class (e.g., '10A').")
    date: datetime.date = Field(default_factory=date.today, description="The date for the attendance sheet (YYYY-MM-DD). Defaults to today.")


class TakeClassAttendanceSchema(BaseModel):
    """Input schema for the take_class_attendance tool."""

    class_name: str = Field(..., description="The name of the class (e.g., '10A').")
    date: datetime.date = Field(default_factory=date.today, description="The date of the attendance (YYYY-MM-DD). Defaults to today.")
    present_student_ids: list[int] = Field(..., description="A list of student IDs who are present.")
    absent_student_ids: list[int] = Field(..., description="A list of student IDs who are absent.")
    late_student_ids: Optional[list[int]] = Field(default_factory=list, description="A list of student IDs who are late.")


class GetAllAbsenteesTodaySchema(BaseModel):
    """Input schema for the get_all_absentees_today tool. No arguments needed."""

    pass


class GetLowAttendanceReportSchema(BaseModel):
    """Input schema for the get_students_with_low_attendance_report tool."""

    threshold_percent: float = Field(..., description="The attendance percentage threshold (e.g., 75.0).")
    start_date: date = Field(..., description="The start date for the report period (YYYY-MM-DD).")
    end_date: date = Field(default_factory=date.today, description="The end date for the report period (YYYY-MM-DD). Defaults to today.")


# --- Exports ---

__all__ = ["GetMyAttendanceReportSchema", "GetClassAttendanceSheetSchema", "TakeClassAttendanceSchema", "GetAllAbsenteesTodaySchema", "GetLowAttendanceReportSchema"]
