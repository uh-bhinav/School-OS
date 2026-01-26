# backend/app/agents/modules/academics/leaves/exam_agent/schemas.py

from datetime import date, datetime
from typing import Optional

from pydantic.v1 import BaseModel, Field, validator


class ScheduleExamSchema(BaseModel):
    """Input schema for the schedule_exam tool."""

    class_name: str = Field(
        ...,
        description="The name of the class for which the exam is being scheduled, e.g., '10A' or 'Grade 12 Science'.",
        min_length=1,
    )
    subject_name: str = Field(
        ...,
        description="The subject for which the exam is being scheduled, e.g., 'Mathematics', 'Physics'.",
        min_length=1,
    )
    exam_type: str = Field(
        ...,
        description="The type of exam, e.g., 'Midterm', 'Final', 'Unit Test 1'.",
        min_length=1,
    )
    exam_date: str = Field(
        ...,
        description="The date when the exam will be conducted (format: YYYY-MM-DD).",
        min_length=10,
    )
    start_time: Optional[str] = Field(
        default=None,
        description="Optional: The start time of the exam (format: HH:MM).",
    )
    duration_minutes: Optional[int] = Field(
        default=60,
        description="Optional: Duration of the exam in minutes. Defaults to 60.",
        ge=1,
    )
    max_marks: Optional[float] = Field(
        default=100.0,
        description="Optional: Maximum marks for the exam. Defaults to 100.",
        ge=1,
    )

    @validator("exam_date")
    def validate_exam_date(cls, v):
        """Ensure exam_date is in correct format and not in the past."""
        try:
            exam_date_obj = datetime.strptime(v, "%Y-%m-%d").date()
            if exam_date_obj < date.today():
                raise ValueError("Exam date cannot be in the past")
            return v
        except ValueError as e:
            if "does not match format" in str(e):
                raise ValueError("Exam date must be in YYYY-MM-DD format")
            raise e

    class Config:
        schema_extra = {
            "example": {
                "class_name": "10A",
                "subject_name": "Mathematics",
                "exam_type": "Midterm",
                "exam_date": "2025-11-15",
                "start_time": "09:00",
                "duration_minutes": 90,
                "max_marks": 100.0,
            }
        }


class GetExamScheduleForClassSchema(BaseModel):
    """Input schema for the get_exam_schedule_for_class tool."""

    class_name: str = Field(
        ...,
        description="The name of the class whose exam schedule is required, e.g., '10A', '12 Science'.",
        min_length=1,
    )
    start_date: Optional[str] = Field(
        default=None,
        description="Optional: Filter exams from this date onwards (format: YYYY-MM-DD).",
    )
    end_date: Optional[str] = Field(
        default=None,
        description="Optional: Filter exams until this date (format: YYYY-MM-DD).",
    )
    subject_name: Optional[str] = Field(default=None, description="Optional: Filter by specific subject.")

    class Config:
        schema_extra = {
            "example": {
                "class_name": "10A",
                "start_date": "2025-11-01",
                "end_date": "2025-11-30",
                "subject_name": "Mathematics",
            }
        }


class GetUpcomingExamsSchema(BaseModel):
    """Input schema for the get_upcoming_exams tool."""

    days_ahead: Optional[int] = Field(
        default=7,
        description="Number of days to look ahead for upcoming exams. Defaults to 7 days.",
        ge=1,
        le=365,
    )
    class_name: Optional[str] = Field(default=None, description="Optional: Filter by specific class.")
    subject_name: Optional[str] = Field(default=None, description="Optional: Filter by specific subject.")
    exam_type: Optional[str] = Field(
        default=None,
        description="Optional: Filter by exam type, e.g., 'Midterm', 'Final'.",
    )

    class Config:
        schema_extra = {
            "example": {
                "days_ahead": 14,
                "class_name": "10A",
                "subject_name": "Physics",
                "exam_type": "Final",
            }
        }


class DefineNewExamTypeSchema(BaseModel):
    """Input schema for the define_new_exam_type tool."""

    exam_type_name: str = Field(
        ...,
        description="The name of the new exam type, e.g., 'Unit Test', 'Practical Exam', 'Surprise Quiz'.",
        min_length=2,
    )
    description: Optional[str] = Field(default=None, description="Optional: A brief description of this exam type.")
    weightage: Optional[float] = Field(
        default=None,
        description="Optional: The weightage or percentage this exam type contributes to final grades.",
        ge=0,
        le=100,
    )

    class Config:
        schema_extra = {
            "example": {
                "exam_type_name": "Unit Test 1",
                "description": "First unit test of the semester",
                "weightage": 10.0,
            }
        }


# Export all schemas
__all__ = [
    "ScheduleExamSchema",
    "GetExamScheduleForClassSchema",
    "GetUpcomingExamsSchema",
    "DefineNewExamTypeSchema",
]
