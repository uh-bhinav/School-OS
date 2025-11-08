# File: app/agents/modules/academics/leaves/timetable_agent/schemas.py

from datetime import date
from typing import Optional

from pydantic.v1 import BaseModel, Field

# --- Tool Schemas ---


class GetMyTimetableSchema(BaseModel):
    """Input schema for the get_my_timetable tool."""

    timetable_date: Optional[date] = Field(default=None, description="Optional date (YYYY-MM-DD). If not provided, today's schedule is assumed.")
    date_range: Optional[str] = Field(default=None, description="Optional range, e.g., 'this week' or 'next week'. The service will interpret this.")


class GetClassScheduleSchema(BaseModel):
    """Input schema for the get_class_schedule tool."""

    class_name: str = Field(..., description="The name of the class (e.g., '10A' or 'Grade 10 - Section A').")
    day: Optional[date] = Field(default=None, description="The specific date (YYYY-MM-DD) for the schedule. Defaults to today if not provided.")


class GenerateTimetableSchema(BaseModel):
    """Input schema for the generate_timetable_for_class tool."""

    class_name: str = Field(..., description="The name of the class for which to auto-generate a new timetable.")


class ManualUpdateSlotSchema(BaseModel):
    """Input schema for the manually_update_timetable_slot tool."""

    class_name: str = Field(..., description="The name of the class (e.g., '10A').")
    day: str = Field(..., description="The day of the week (e.g., 'Monday', 'Tuesday').")
    period_number: int = Field(..., description="The period number to update (e.g., 1, 2).")
    subject_name: str = Field(..., description="The name of the subject to assign (e.g., 'Mathematics').")
    teacher_name: str = Field(..., description="The name of the teacher to assign (e.g., 'Priya Sharma').")


class CheckConflictsSchema(BaseModel):
    """Input schema for the check_timetable_conflicts_for_teacher tool."""

    teacher_name: str = Field(..., description="The name of the teacher to check for schedule conflicts.")


class FindFreeSlotSchema(BaseModel):
    """Input schema for the find_free_slot_for_teacher tool."""

    teacher_name: str = Field(..., description="The name of the teacher for whom to find a free slot.")
    day: Optional[date] = Field(default=None, description="Optional date (YYYY-MM-DD) to search. Defaults to today.")


# --- Exports ---

__all__ = ["GetMyTimetableSchema", "GetClassScheduleSchema", "GenerateTimetableSchema", "ManualUpdateSlotSchema", "CheckConflictsSchema", "FindFreeSlotSchema"]
