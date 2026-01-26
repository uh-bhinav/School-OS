# backend/app/agents/modules/academics/leaves/subject_agent/schemas.py

from typing import Optional

from pydantic.v1 import BaseModel, Field, validator


class ListSubjectsForClassSchema(BaseModel):
    """Input schema for the list_subjects_for_class tool."""

    class_name: str = Field(
        ...,
        description="The name of the class whose subjects are required, e.g., '10A', 'Grade 12 Science'.",
        min_length=1,
    )
    academic_year: Optional[str] = Field(
        default=None,
        description="Optional: The academic year for which to retrieve subjects, e.g., '2025-2026'. Defaults to current year.",
    )

    class Config:
        schema_extra = {"example": {"class_name": "10A", "academic_year": "2025-2026"}}


class GetTeacherForSubjectSchema(BaseModel):
    """Input schema for the get_teacher_for_subject tool."""

    subject_name: str = Field(
        ...,
        description="The name of the subject, e.g., 'Mathematics', 'Physics', 'English'.",
        min_length=1,
    )
    class_name: str = Field(
        ...,
        description="The name of the class, e.g., '10A', '12 Science'.",
        min_length=1,
    )
    academic_year: Optional[str] = Field(
        default=None,
        description="Optional: The academic year. Defaults to current academic year.",
    )

    class Config:
        schema_extra = {
            "example": {
                "subject_name": "Mathematics",
                "class_name": "10A",
                "academic_year": "2025-2026",
            }
        }


class AssignSubjectToClassSchema(BaseModel):
    """Input schema for the assign_subject_to_class tool (Admin-only)."""

    subject_name: str = Field(
        ...,
        description="The name of the subject to assign, e.g., 'Mathematics', 'Chemistry'.",
        min_length=1,
    )
    class_name: str = Field(
        ...,
        description="The name of the class to which the subject will be assigned, e.g., '10A'.",
        min_length=1,
    )
    academic_year: str = Field(
        ...,
        description="The academic year for this assignment, e.g., '2025-2026'.",
        min_length=7,
    )
    weekly_hours: Optional[int] = Field(
        default=None,
        description="Optional: Number of weekly hours allocated for this subject.",
        ge=1,
        le=40,
    )
    is_mandatory: Optional[bool] = Field(
        default=True,
        description="Optional: Whether this subject is mandatory for the class. Defaults to True.",
    )

    @validator("academic_year")
    def validate_academic_year(cls, v):
        """Ensure academic_year follows the format YYYY-YYYY."""
        if "-" not in v or len(v) != 9:
            raise ValueError("Academic year must be in format 'YYYY-YYYY', e.g., '2025-2026'")
        try:
            start_year, end_year = v.split("-")
            start = int(start_year)
            end = int(end_year)
            if end != start + 1:
                raise ValueError("Academic year end must be one year after start")
            return v
        except (ValueError, AttributeError):
            raise ValueError("Academic year must be in format 'YYYY-YYYY', e.g., '2025-2026'")

    class Config:
        schema_extra = {
            "example": {
                "subject_name": "Mathematics",
                "class_name": "10A",
                "academic_year": "2025-2026",
                "weekly_hours": 6,
                "is_mandatory": True,
            }
        }


class ListAcademicStreamsSchema(BaseModel):
    """Input schema for the list_academic_streams tool."""

    grade_level: Optional[str] = Field(
        default=None,
        description="Optional: Filter streams by grade level, e.g., '11', '12'.",
    )
    include_inactive: Optional[bool] = Field(
        default=False,
        description="Optional: Whether to include inactive streams. Defaults to False.",
    )

    class Config:
        schema_extra = {"example": {"grade_level": "11", "include_inactive": False}}


class AssignTeacherToSubjectSchema(BaseModel):
    """Input schema for the assign_teacher_to_subject tool (Admin-only)."""

    teacher_id: str = Field(
        ...,
        description="The unique identifier of the teacher, e.g., 'TCH-2025-001' or teacher's email.",
        min_length=1,
    )
    subject_name: str = Field(
        ...,
        description="The name of the subject the teacher is qualified to teach, e.g., 'Physics'.",
        min_length=1,
    )
    class_name: Optional[str] = Field(
        default=None,
        description="Optional: Specific class for this assignment. If not provided, teacher is qualified for subject in general.",
    )
    academic_year: Optional[str] = Field(
        default=None,
        description="Optional: Academic year for this assignment. Defaults to current year.",
    )
    is_primary_teacher: Optional[bool] = Field(
        default=True,
        description="Optional: Whether this teacher is the primary teacher for this subject-class combination. Defaults to True.",
    )

    class Config:
        schema_extra = {
            "example": {
                "teacher_id": "TCH-2025-001",
                "subject_name": "Physics",
                "class_name": "11 Science",
                "academic_year": "2025-2026",
                "is_primary_teacher": True,
            }
        }


# Export all schemas
__all__ = [
    "ListSubjectsForClassSchema",
    "GetTeacherForSubjectSchema",
    "AssignSubjectToClassSchema",
    "ListAcademicStreamsSchema",
    "AssignTeacherToSubjectSchema",
]
