from typing import Optional

from pydantic.v1 import BaseModel, Field

# --- Schemas for Mark Tools (from marks.py) ---


class CreateMarkSchema(BaseModel):
    """Input schema for the create_mark tool."""

    school_id: int = Field(..., description="The ID of the school. Must match the Admin's/Teacher's school ID.")
    student_id: int = Field(..., description="The ID of the student.")
    exam_id: int = Field(..., description="The ID of the exam.")
    subject_id: int = Field(..., description="The ID of the subject.")
    marks_obtained: float = Field(..., description="The marks the student received.")
    max_marks: float = Field(default=100.0, description="The maximum possible marks for this test.")
    remarks: Optional[str] = Field(default=None, description="Optional: Any remarks or notes.")


class BulkCreateMarksSchema(BaseModel):
    """Input schema for the bulk_create_marks tool."""

    marks_list: list[CreateMarkSchema] = Field(..., description="A list of mark-creation objects.")


class SearchMarksSchema(BaseModel):
    """Input schema for the search_marks tool."""

    student_id: int = Field(..., description="The ID of the student whose marks you want to search for.")
    exam_id: Optional[int] = Field(default=None, description="Optional: Filter by a specific exam ID.")
    subject_id: Optional[int] = Field(default=None, description="Optional: Filter by a specific subject ID.")


class UpdateMarkSchema(BaseModel):
    """Input schema for the update_mark tool."""

    mark_id: int = Field(..., description="The unique ID of the mark record to update.")
    marks_obtained: Optional[float] = Field(default=None, description="The new marks obtained.")
    remarks: Optional[str] = Field(default=None, description="New remarks or notes.")


class DeleteMarkSchema(BaseModel):
    """Input schema for the delete_mark tool."""

    mark_id: int = Field(..., description="The unique ID of the mark record to delete.")


class GetClassPerformanceSchema(BaseModel):
    """Input schema for the get_class_performance tool."""

    class_id: int = Field(..., description="The ID of the class.")
    exam_id: int = Field(..., description="The ID of the exam.")


class GetReportCardSchema(BaseModel):
    """Input schema for the get_report_card tool."""

    student_id: int = Field(..., description="The ID of the student.")
    academic_year_id: int = Field(..., description="The ID of the academic year for the report card.")


class GetGradeProgressionSchema(BaseModel):
    """Input schema for the get_grade_progression tool."""

    student_id: int = Field(..., description="The ID of the student.")
    subject_id: int = Field(..., description="The ID of the subject.")


# Export all schemas
__all__ = ["CreateMarkSchema", "BulkCreateMarksSchema", "SearchMarksSchema", "UpdateMarkSchema", "DeleteMarkSchema", "GetClassPerformanceSchema", "GetReportCardSchema", "GetGradeProgressionSchema"]
