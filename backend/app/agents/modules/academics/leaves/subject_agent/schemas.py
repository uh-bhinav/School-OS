from typing import Optional

from pydantic.v1 import BaseModel, Field

# --- Schemas for Subject Tools (from subjects.py) ---


class ListAllSubjectsSchema(BaseModel):
    """Input schema for the list_all_subjects tool. Takes no arguments."""

    pass


class SearchSubjectsSchema(BaseModel):
    """Input schema for the search_subjects tool. All fields are optional."""

    name: Optional[str] = Field(default=None, description="Optional: Filter by subject name (e.g., 'Physics', 'Math').")
    code: Optional[str] = Field(default=None, description="Optional: Filter by subject short code (e.g., 'PHY101').")
    category: Optional[str] = Field(default=None, description="Optional: Filter by category (e.g., 'Science', 'Humanities').")


class GetSubjectDetailsSchema(BaseModel):
    """Input schema for the get_subject_details tool."""

    subject_id: int = Field(..., description="The unique ID of the subject.")


class GetSubjectTeachersSchema(BaseModel):
    """Input schema for the get_teachers_for_subject tool."""

    subject_id: int = Field(..., description="The unique ID of the subject to find teachers for.")


class CreateSubjectSchema(BaseModel):
    """Input schema for the create_subject tool."""

    school_id: int = Field(..., description="The ID of the school. Must match the Admin's school ID.")
    name: str = Field(..., description="The full name of the subject (e.g., 'Physics').")
    short_code: Optional[str] = Field(default=None, description="Optional: A short code for the subject (e.g., 'PHY101').")
    category: Optional[str] = Field(default=None, description="Optional: A category (e.g., 'Science', 'Language').")


class UpdateSubjectSchema(BaseModel):
    """Input schema for the update_subject tool."""

    subject_id: int = Field(..., description="The unique ID of the subject to update.")
    name: Optional[str] = Field(default=None, description="The new name for the subject.")
    short_code: Optional[str] = Field(default=None, description="The new short code for the subject.")
    category: Optional[str] = Field(default=None, description="The new category for the subject.")
    is_active: Optional[bool] = Field(default=None, description="Set the subject's active status.")


class DeleteSubjectSchema(BaseModel):
    """Input schema for the delete_subject tool."""

    subject_id: int = Field(..., description="The unique ID of the subject to soft-delete.")


# Export all schemas
__all__ = ["ListAllSubjectsSchema", "SearchSubjectsSchema", "GetSubjectDetailsSchema", "GetSubjectTeachersSchema", "CreateSubjectSchema", "UpdateSubjectSchema", "DeleteSubjectSchema"]
