from typing import Optional

from pydantic.v1 import BaseModel, Field

# --- Schemas for Teacher Tools (from teachers.py) ---


class ListAllTeachersSchema(BaseModel):
    """Input schema for the list_all_teachers tool. Takes no arguments."""

    pass


class SearchTeachersSchema(BaseModel):
    """Input schema for the search_teachers tool. All fields are optional."""

    name: Optional[str] = Field(default=None, description="Optional: Filter by teacher's full or partial name.")
    department: Optional[str] = Field(default=None, description="Optional: Filter by department (e.g., 'Science', 'Math').")


class GetTeacherDetailsSchema(BaseModel):
    """Input schema for the get_teacher_details tool."""

    teacher_id: int = Field(..., description="The unique ID of the teacher.")


class GetTeacherQualificationsSchema(BaseModel):
    """Input schema for the get_teacher_qualifications tool."""

    teacher_id: int = Field(..., description="The unique ID of the teacher whose qualifications you want.")


class UpdateTeacherSchema(BaseModel):
    """Input schema for the update_teacher tool."""

    teacher_id: int = Field(..., description="The unique ID of the teacher to update.")
    department: Optional[str] = Field(default=None, description="The teacher's new department.")
    subject_specialization: Optional[str] = Field(default=None, description="The teacher's new subject specialization.")
    years_of_experience: Optional[int] = Field(default=None, description="The teacher's new years of experience.")
    bio: Optional[str] = Field(default=None, description="A new bio for the teacher.")
    # Note: We are not including 'hire_date' or 'employment_status_id'
    # as they are less likely to be updated via chat.
    # We can add them later if needed.


class DeactivateTeacherSchema(BaseModel):
    """Input schema for the deactivate_teacher tool."""

    teacher_id: int = Field(..., description="The unique ID of the teacher to deactivate (soft-delete).")


# Note: We are intentionally omitting a "hire_teacher" tool.
# Hiring a teacher is a complex workflow that involves:
# 1. Inviting a user (from security.py, which creates a Supabase user)
# 2. Creating a Profile (done by a trigger)
# 3. Creating a Teacher record (new service function)
# This complex workflow is better suited for a Phase 4 "Automation Workflow"
# rather than a simple L4 leaf agent tool.

# Export all schemas
__all__ = ["ListAllTeachersSchema", "SearchTeachersSchema", "GetTeacherDetailsSchema", "GetTeacherQualificationsSchema", "UpdateTeacherSchema", "DeactivateTeacherSchema"]
