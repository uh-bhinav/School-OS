# backend/app/agents/modules/academics/leaves/class_agent/schemas.py

from typing import Optional

from pydantic.v1 import BaseModel, Field, validator


class CreateNewClassSchema(BaseModel):
    """Input schema for the create_new_class tool."""

    class_name: str = Field(
        ...,
        description="The name of the class or section to create, e.g., '10A', 'Grade 12 Science', '9B'.",
        min_length=1,
    )
    academic_year: str = Field(
        ...,
        description="The academic year for this class, e.g., '2024-2025', '2025-2026'.",
        min_length=7,
    )
    grade_level: Optional[int] = Field(
        default=None,
        description="Optional: The grade level (e.g., 10 for Grade 10).",
        ge=1,
        le=12,
    )
    section: Optional[str] = Field(
        default=None,
        description="Optional: The section identifier (e.g., 'A', 'B', 'Science').",
        max_length=20,
    )
    max_students: Optional[int] = Field(
        default=40,
        description="Optional: Maximum number of students allowed in this class. Defaults to 40.",
        ge=1,
        le=100,
    )

    @validator("academic_year")
    def validate_academic_year(cls, v):
        """Ensure academic_year is in correct format (YYYY-YYYY)."""
        if "-" not in v or len(v) != 9:
            raise ValueError("Academic year must be in YYYY-YYYY format (e.g., '2024-2025')")
        try:
            start_year, end_year = v.split("-")
            start = int(start_year)
            end = int(end_year)
            if end != start + 1:
                raise ValueError("Academic year end must be exactly one year after start")
            return v
        except ValueError as e:
            if "invalid literal" in str(e):
                raise ValueError("Academic year must contain valid year numbers")
            raise e

    class Config:
        schema_extra = {
            "example": {
                "class_name": "10A",
                "academic_year": "2024-2025",
                "grade_level": 10,
                "section": "A",
                "max_students": 40,
            }
        }


class GetClassDetailsSchema(BaseModel):
    """Input schema for the get_class_details tool."""

    class_name: str = Field(
        ...,
        description="The name of the class to retrieve details for, e.g., '10A', 'Grade 12 Science'.",
        min_length=1,
    )

    class Config:
        schema_extra = {"example": {"class_name": "10A"}}


class ListStudentsInClassSchema(BaseModel):
    """Input schema for the list_students_in_class tool."""

    class_name: str = Field(
        ...,
        description="The name of the class whose student roster is required, e.g., '10A', '12 Science'.",
        min_length=1,
    )
    include_details: Optional[bool] = Field(
        default=False,
        description="Optional: Include detailed student information (roll numbers, contact info). Defaults to False.",
    )

    class Config:
        schema_extra = {"example": {"class_name": "10A", "include_details": True}}


class GetClassScheduleSchema(BaseModel):
    """Input schema for the get_class_schedule tool."""

    class_name: str = Field(
        ...,
        description="The name of the class whose schedule/timetable is required, e.g., '10A'.",
        min_length=1,
    )
    day_of_week: Optional[str] = Field(
        default=None,
        description="Optional: Specific day to retrieve schedule for (e.g., 'Monday', 'Tuesday'). If not provided, returns full week.",
    )

    @validator("day_of_week")
    def validate_day(cls, v):
        """Ensure day_of_week is a valid day name if provided."""
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


class AssignClassTeacherSchema(BaseModel):
    """Input schema for the assign_class_teacher tool."""

    class_name: str = Field(
        ...,
        description="The name of the class to assign a teacher to, e.g., '10A'.",
        min_length=1,
    )
    teacher_name: str = Field(
        ...,
        description="The full name of the teacher to assign as class teacher/proctor.",
        min_length=2,
    )
    effective_from: Optional[str] = Field(
        default=None,
        description="Optional: Date from which this assignment is effective (format: YYYY-MM-DD).",
    )

    class Config:
        schema_extra = {
            "example": {
                "class_name": "10A",
                "teacher_name": "Mrs. Sharma",
                "effective_from": "2025-10-01",
            }
        }


class ListAllClassesSchema(BaseModel):
    """Input schema for the list_all_classes tool."""

    academic_year: Optional[str] = Field(
        default=None,
        description="Optional: Filter classes by academic year (e.g., '2024-2025').",
    )
    grade_level: Optional[int] = Field(
        default=None,
        description="Optional: Filter classes by grade level (e.g., 10 for Grade 10).",
        ge=1,
        le=12,
    )
    include_inactive: Optional[bool] = Field(
        default=False,
        description="Optional: Include inactive/archived classes. Defaults to False.",
    )

    class Config:
        schema_extra = {
            "example": {
                "academic_year": "2024-2025",
                "grade_level": 10,
                "include_inactive": False,
            }
        }


# Export all schemas
__all__ = [
    "CreateNewClassSchema",
    "GetClassDetailsSchema",
    "ListStudentsInClassSchema",
    "GetClassScheduleSchema",
    "AssignClassTeacherSchema",
    "ListAllClassesSchema",
]
