# backend/app/agents/modules/academics/leaves/mark_agent/schemas.py

from typing import List, Optional

from pydantic.v1 import BaseModel, Field, validator


class MarkInput(BaseModel):
    """A Pydantic model representing a single mark entry for a subject."""

    subject_name: str = Field(
        ...,
        description="The name of the subject, e.g., 'Mathematics' or 'Physics'.",
        min_length=1,
    )
    marks_obtained: float = Field(..., description="The score the student received in the subject.", ge=0, le=100)
    max_marks: Optional[float] = Field(
        default=100.0,
        description="The maximum possible marks for this subject. Defaults to 100.",
        ge=1,
    )

    @validator("marks_obtained")
    def validate_marks_range(cls, v, values):
        """Ensure marks obtained don't exceed max_marks if max_marks is provided."""
        max_marks = values.get("max_marks", 100.0)
        if v > max_marks:
            raise ValueError(f"Marks obtained ({v}) cannot exceed max marks ({max_marks})")
        return v

    class Config:
        schema_extra = {
            "example": {
                "subject_name": "Mathematics",
                "marks_obtained": 85.5,
                "max_marks": 100.0,
            }
        }


class GetStudentMarksSchema(BaseModel):
    """Input schema for the get_student_marks_for_exam tool."""

    student_name: str = Field(
        ...,
        description="The full name of the student whose marks are required, e.g., 'Rohan Sharma'.",
        min_length=2,
    )
    exam_name: Optional[str] = Field(
        default=None,
        description="The name or type of the exam, e.g., 'Midterm', 'Final', 'Unit Test 1'. If not provided, returns marks for all exams.",
    )
    subject_name: Optional[str] = Field(default=None, description="Optional: Filter results by a specific subject name.")

    class Config:
        schema_extra = {
            "example": {
                "student_name": "Priya Sharma",
                "exam_name": "Midterm",
                "subject_name": "Physics",
            }
        }


class RecordStudentMarksSchema(BaseModel):
    """Input schema for the record_student_marks tool."""

    student_name: str = Field(
        ...,
        description="The full name of the student for whom marks are being recorded, e.g., 'Rohan Sharma'.",
        min_length=2,
    )
    exam_name: str = Field(
        ...,
        description="The name or type of the exam for which marks are being recorded, e.g., 'Midterm', 'Final'.",
        min_length=2,
    )
    marks: List[MarkInput] = Field(
        ...,
        description="A list of subjects and the marks obtained in each. Must contain at least one mark entry.",
        min_items=1,
    )
    class_name: Optional[str] = Field(
        default=None,
        description="Optional: The class/grade of the student, e.g., '10A' or 'Grade 12 Science'.",
    )
    exam_date: Optional[str] = Field(
        default=None,
        description="Optional: The date when the exam was conducted (format: YYYY-MM-DD).",
    )

    class Config:
        schema_extra = {
            "example": {
                "student_name": "Rohan Sharma",
                "exam_name": "Final Exam",
                "marks": [
                    {
                        "subject_name": "Mathematics",
                        "marks_obtained": 92,
                        "max_marks": 100,
                    },
                    {"subject_name": "Physics", "marks_obtained": 88, "max_marks": 100},
                ],
                "class_name": "12A",
                "exam_date": "2025-10-15",
            }
        }


class UpdateStudentMarksSchema(BaseModel):
    """Input schema for the update_student_marks tool."""

    student_name: str = Field(
        ...,
        description="The full name of the student whose marks need to be updated.",
        min_length=2,
    )
    exam_name: str = Field(
        ...,
        description="The name of the exam for which marks are being updated.",
        min_length=2,
    )
    subject_name: str = Field(
        ...,
        description="The specific subject whose marks need to be updated.",
        min_length=1,
    )
    new_marks: float = Field(..., description="The corrected/updated marks for the subject.", ge=0, le=100)
    reason: Optional[str] = Field(
        default=None,
        description="Optional: Reason for the marks update (for audit trail).",
    )

    class Config:
        schema_extra = {
            "example": {
                "student_name": "Priya Sharma",
                "exam_name": "Midterm",
                "subject_name": "Chemistry",
                "new_marks": 91.0,
                "reason": "Rechecking correction",
            }
        }


class GetMarksheetSchema(BaseModel):
    """Input schema for the get_marksheet_for_exam tool."""

    student_name: str = Field(
        ...,
        description="The full name of the student for whom the marksheet is required.",
        min_length=2,
    )
    exam_name: str = Field(
        ...,
        description="The name of the exam for which the marksheet is required, e.g., 'Final Exam'.",
        min_length=2,
    )
    include_percentage: Optional[bool] = Field(
        default=True,
        description="Whether to calculate and include overall percentage in the marksheet.",
    )
    include_grade: Optional[bool] = Field(
        default=True,
        description="Whether to calculate and include overall grade in the marksheet.",
    )

    class Config:
        schema_extra = {
            "example": {
                "student_name": "Rohan Sharma",
                "exam_name": "Final Exam",
                "include_percentage": True,
                "include_grade": True,
            }
        }


class GetClassPerformanceSchema(BaseModel):
    """Input schema for the get_class_performance_in_subject tool."""

    class_name: str = Field(
        ...,
        description="The name of the class, e.g., '10A', '12 Science'.",
        min_length=1,
    )
    subject_name: str = Field(
        ...,
        description="The name of the subject for which performance data is required.",
        min_length=1,
    )
    exam_name: Optional[str] = Field(
        default=None,
        description="Optional: Specific exam name. If not provided, returns aggregate performance.",
    )
    include_statistics: Optional[bool] = Field(
        default=True,
        description="Whether to include statistical data like average, median, highest, and lowest marks.",
    )

    class Config:
        schema_extra = {
            "example": {
                "class_name": "10A",
                "subject_name": "Mathematics",
                "exam_name": "Midterm",
                "include_statistics": True,
            }
        }


# Export all schemas
__all__ = [
    "MarkInput",
    "GetStudentMarksSchema",
    "RecordStudentMarksSchema",
    "UpdateStudentMarksSchema",
    "GetMarksheetSchema",
    "GetClassPerformanceSchema",
]
