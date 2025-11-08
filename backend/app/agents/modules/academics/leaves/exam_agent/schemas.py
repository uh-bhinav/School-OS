from datetime import date
from typing import Optional

from pydantic.v1 import BaseModel, Field

# --- Schemas for Exam Tools (from exams.py) ---


class ListAllExamsSchema(BaseModel):
    """Input schema for the list_all_exams tool. Takes no arguments."""

    pass


class SearchExamsSchema(BaseModel):
    """Input schema for the search_exams tool. All fields are optional."""

    name: Optional[str] = Field(default=None, description="Optional: Filter by exam name (e.g., 'Midterm').")
    exam_type_id: Optional[int] = Field(default=None, description="Optional: Filter by the unique ID of an exam type.")
    academic_year_id: Optional[int] = Field(default=None, description="Optional: Filter by the unique ID of an academic year.")


class GetExamDetailsSchema(BaseModel):
    """Input schema for the get_exam_details tool."""

    exam_id: int = Field(..., description="The unique ID of the exam.")


class CreateExamSchema(BaseModel):
    """Input schema for the create_exam tool."""

    school_id: int = Field(..., description="The ID of the school. Must match the Admin's school ID.")
    exam_name: str = Field(..., description="The name of the exam (e.g., 'Class 10 Midterm').")
    exam_type_id: int = Field(..., description="The ID of the exam type (e.g., 1 for 'Midterm').")
    start_date: date = Field(..., description="The start date of the exam period (YYYY-MM-DD).")
    end_date: date = Field(..., description="The end date of the exam period (YYYY-MM-DD).")
    total_marks: float = Field(..., description="The total marks for this exam.")
    academic_year_id: int = Field(..., description="The ID of the academic year this exam belongs to.")


class UpdateExamSchema(BaseModel):
    """Input schema for the update_exam tool."""

    exam_id: int = Field(..., description="The unique ID of the exam to update.")
    exam_name: Optional[str] = Field(default=None, description="The new name for the exam.")
    exam_type_id: Optional[int] = Field(default=None, description="The new exam type ID.")
    start_date: Optional[date] = Field(default=None, description="The new start date (YYYY-MM-DD).")
    end_date: Optional[date] = Field(default=None, description="The new end date (YYYY-MM-DD).")
    total_marks: Optional[float] = Field(default=None, description="The new total marks.")


class DeleteExamSchema(BaseModel):
    """Input schema for the delete_exam tool."""

    exam_id: int = Field(..., description="The unique ID of the exam to soft-delete.")


# Export all schemas
__all__ = ["ListAllExamsSchema", "SearchExamsSchema", "GetExamDetailsSchema", "CreateExamSchema", "UpdateExamSchema", "DeleteExamSchema"]
