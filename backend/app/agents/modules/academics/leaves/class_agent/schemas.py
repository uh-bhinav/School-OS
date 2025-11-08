from typing import Optional

from pydantic.v1 import BaseModel, Field

# --- Schemas for Class Tools (from classes.py) ---


class ListAllClassesSchema(BaseModel):
    """Input schema for the list_all_classes tool. Takes no arguments."""

    pass


class SearchClassesSchema(BaseModel):
    """Input schema for the search_classes tool. All fields are optional."""

    name: Optional[str] = Field(default=None, description="Optional: Filter by class name (e.g., '10A', 'Science').")
    grade_level: Optional[int] = Field(default=None, description="Optional: Filter by grade level (e.g., 9).")
    academic_year_id: Optional[int] = Field(default=None, description="Optional: Filter by academic year ID.")
    teacher_id: Optional[int] = Field(default=None, description="Optional: Filter by the assigned class teacher's ID.")


class GetClassDetailsSchema(BaseModel):
    """Input schema for the get_class_details tool."""

    class_id: int = Field(..., description="The unique ID of the class.")


class GetClassStudentsSchema(BaseModel):
    """Input schema for the get_students_in_class tool."""

    class_id: int = Field(..., description="The unique ID of the class whose students you want to list.")


class CreateClassSchema(BaseModel):
    """Input schema for the create_class tool."""

    school_id: int = Field(..., description="The ID of the school. Must match the Admin's school ID.")
    grade_level: int = Field(..., description="The grade level for the class (e.g., 1, 10, 12).")
    section: str = Field(..., description="The section name (e.g., 'A', 'B', 'Science').")
    academic_year_id: int = Field(..., description="The ID of the academic year this class belongs to.")
    class_teacher_id: Optional[int] = Field(default=None, description="Optional: The ID of the teacher assigned as the class teacher.")


class UpdateClassSchema(BaseModel):
    """Input schema for the update_class tool."""

    class_id: int = Field(..., description="The unique ID of the class to update.")
    grade_level: Optional[int] = Field(default=None, description="The new grade level.")
    section: Optional[str] = Field(default=None, description="The new section name.")
    academic_year_id: Optional[int] = Field(default=None, description="The new academic year ID.")
    class_teacher_id: Optional[int] = Field(default=None, description="The new class teacher's ID.")
    is_active: Optional[bool] = Field(default=None, description="Set the class's active status.")


class DeleteClassSchema(BaseModel):
    """Input schema for the delete_class tool."""

    class_id: int = Field(..., description="The unique ID of the class to soft-delete.")


class AssignSubjectsSchema(BaseModel):
    """Input schema for the assign_subjects_to_class tool."""

    class_id: int = Field(..., description="The unique ID of the class.")
    subject_ids: list[int] = Field(..., description="A list of subject IDs to assign to this class.")


# Export all schemas
__all__ = ["ListAllClassesSchema", "SearchClassesSchema", "GetClassDetailsSchema", "GetClassStudentsSchema", "CreateClassSchema", "UpdateClassSchema", "DeleteClassSchema", "AssignSubjectsSchema"]
