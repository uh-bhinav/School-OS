from typing import Optional

from pydantic.v1 import BaseModel, Field

# --- Schemas for Exam Type Tools (from exam_types.py) ---


class ListExamTypesSchema(BaseModel):
    """Input schema for the list_exam_types tool. Takes no arguments."""

    pass


class GetExamTypeSchema(BaseModel):
    """Input schema for the get_exam_type_details tool."""

    exam_type_id: int = Field(..., description="The unique ID of the exam type.")


class CreateExamTypeSchema(BaseModel):
    """Input schema for the create_exam_type tool."""

    school_id: int = Field(..., description="The ID of the school. Must match the Admin's school ID.")
    type_name: str = Field(..., description="The name of the exam type (e.g., 'Midterm', 'Final Exam').")


class UpdateExamTypeSchema(BaseModel):
    """Input schema for the update_exam_type tool."""

    exam_type_id: int = Field(..., description="The unique ID of the exam type to update.")
    type_name: Optional[str] = Field(default=None, description="The new name for the exam type.")


class DeleteExamTypeSchema(BaseModel):
    """Input schema for the delete_exam_type tool."""

    exam_type_id: int = Field(..., description="The unique ID of the exam type to delete.")


# Export all schemas
__all__ = ["ListExamTypesSchema", "GetExamTypeSchema", "CreateExamTypeSchema", "UpdateExamTypeSchema", "DeleteExamTypeSchema"]
