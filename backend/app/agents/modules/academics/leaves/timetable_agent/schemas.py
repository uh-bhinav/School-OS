# backend/app/agents/modules/academics/leaves/timetable_agent/schemas.py

from typing import Optional

from pydantic.v1 import BaseModel, Field, validator


class GetClassTimetableSchema(BaseModel):
    """Input schema for the get_class_timetable tool."""

    class_name: str = Field(
        ...,
        description="The name of the class whose timetable is required, e.g., '10A', 'Grade 12 Science'.",
        min_length=1,
    )
    day_of_week: Optional[str] = Field(
        default=None,
        description="Optional: Filter by specific day of the week (e.g., 'Monday', 'Tuesday').",
    )

    @validator("day_of_week")
    def validate_day_of_week(cls, v):
        """Ensure day_of_week is a valid weekday if provided."""
        if v is not None:
            valid_days = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ]
            if v not in valid_days:
                raise ValueError(f"Day must be one of: {', '.join(valid_days)}")
        return v

    class Config:
        schema_extra = {"example": {"class_name": "10A", "day_of_week": "Monday"}}


class GetTeacherTimetableSchema(BaseModel):
    """Input schema for the get_teacher_timetable tool."""

    teacher_name: str = Field(
        ...,
        description="The name of the teacher whose timetable is required, e.g., 'Mr. Sharma', 'Mrs. Patel'.",
        min_length=1,
    )
    day_of_week: Optional[str] = Field(
        default=None,
        description="Optional: Filter by specific day of the week (e.g., 'Monday', 'Tuesday').",
    )

    @validator("day_of_week")
    def validate_day_of_week(cls, v):
        """Ensure day_of_week is a valid weekday if provided."""
        if v is not None:
            valid_days = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ]
            if v not in valid_days:
                raise ValueError(f"Day must be one of: {', '.join(valid_days)}")
        return v

    class Config:
        schema_extra = {"example": {"teacher_name": "Mr. Sharma", "day_of_week": "Wednesday"}}


class FindCurrentPeriodForClassSchema(BaseModel):
    """Input schema for the find_current_period_for_class tool."""

    class_name: str = Field(
        ...,
        description="The name of the class to check the current period for, e.g., '10A', '12 Science'.",
        min_length=1,
    )

    class Config:
        schema_extra = {"example": {"class_name": "10A"}}


class FindFreeTeachersSchema(BaseModel):
    """Input schema for the find_free_teachers tool."""

    day_of_week: str = Field(
        ...,
        description="The day of the week to check for free teachers (e.g., 'Monday', 'Friday').",
        min_length=1,
    )
    period_number: int = Field(
        ...,
        description="The period number to check (e.g., 1 for first period, 2 for second period).",
        ge=1,
        le=10,
    )

    @validator("day_of_week")
    def validate_day_of_week(cls, v):
        """Ensure day_of_week is a valid weekday."""
        valid_days = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]
        if v not in valid_days:
            raise ValueError(f"Day must be one of: {', '.join(valid_days)}")
        return v

    class Config:
        schema_extra = {"example": {"day_of_week": "Monday", "period_number": 3}}


class CreateOrUpdateTimetableEntrySchema(BaseModel):
    """Input schema for the create_or_update_timetable_entry tool."""

    class_name: str = Field(
        ...,
        description="The name of the class for the timetable entry, e.g., '10A', 'Grade 12 Science'.",
        min_length=1,
    )
    day_of_week: str = Field(
        ...,
        description="The day of the week for this entry (e.g., 'Monday', 'Tuesday').",
        min_length=1,
    )
    period_number: int = Field(
        ...,
        description="The period number for this entry (e.g., 1 for first period).",
        ge=1,
        le=10,
    )
    subject_name: str = Field(
        ...,
        description="The subject to be taught during this period, e.g., 'Mathematics', 'Physics'.",
        min_length=1,
    )
    teacher_name: str = Field(
        ...,
        description="The name of the teacher assigned to teach this period, e.g., 'Mr. Sharma'.",
        min_length=1,
    )
    start_time: Optional[str] = Field(
        default=None,
        description="Optional: The start time of the period (format: HH:MM).",
    )
    end_time: Optional[str] = Field(
        default=None,
        description="Optional: The end time of the period (format: HH:MM).",
    )
    room_number: Optional[str] = Field(
        default=None,
        description="Optional: The classroom or room number where this period takes place.",
    )

    @validator("day_of_week")
    def validate_day_of_week(cls, v):
        """Ensure day_of_week is a valid weekday."""
        valid_days = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]
        if v not in valid_days:
            raise ValueError(f"Day must be one of: {', '.join(valid_days)}")
        return v

    class Config:
        schema_extra = {
            "example": {
                "class_name": "10A",
                "day_of_week": "Monday",
                "period_number": 1,
                "subject_name": "Mathematics",
                "teacher_name": "Mr. Sharma",
                "start_time": "08:00",
                "end_time": "08:45",
                "room_number": "Room 301",
            }
        }


# Export all schemas
__all__ = [
    "GetClassTimetableSchema",
    "GetTeacherTimetableSchema",
    "FindCurrentPeriodForClassSchema",
    "FindFreeTeachersSchema",
    "CreateOrUpdateTimetableEntrySchema",
]
