from datetime import date
from typing import Optional

# --- THIS IS THE CRITICAL FIX ---
from pydantic.v1 import BaseModel, Field

# --- END FIX ---

# --- Schemas for Student Tools (from students.py) ---


class SearchStudentsSchema(BaseModel):
    """Input schema for the search_students tool."""

    name: str = Field(..., description="The full or partial name of the student to search for.")


class GetStudentDetailsSchema(BaseModel):
    """Input schema for the get_student_details tool."""

    student_id: int = Field(..., description="The unique ID of the student.")


class AdmitNewStudentSchema(BaseModel):
    """Input schema for the admit_new_student tool."""

    email: str = Field(..., description="The student's new email address.")
    password: Optional[str] = Field(None, description="Optional: A temporary password. If not provided, one will be generated.")
    school_id: int = Field(..., description="The school ID. Must match the Admin's school.")
    first_name: str = Field(..., description="The student's first name.")
    last_name: str = Field(..., description="The student's last name.")
    phone_number: Optional[str] = Field(None, description="The student's phone number.")
    gender: Optional[str] = Field(None, description="The student's gender.")
    date_of_birth: Optional[date] = Field(None, description="The student's date of birth (YYYY-MM-DD).")
    current_class_id: Optional[int] = Field(None, description="Optional: The ID of the class to enroll the student in.")


class UpdateStudentSchema(BaseModel):
    """Input schema for the update_student tool."""

    student_id: int = Field(..., description="The unique ID of the student to update.")
    first_name: Optional[str] = Field(None, description="The student's new first name.")
    last_name: Optional[str] = Field(None, description="The student's new last name.")
    phone_number: Optional[str] = Field(None, description="The student's new phone number.")
    gender: Optional[str] = Field(None, description="The student's new gender.")
    date_of_birth: Optional[date] = Field(None, description="The student's new date of birth (YYYY-MM-DD).")
    current_class_id: Optional[int] = Field(None, description="The student's new class ID.")
    roll_number: Optional[str] = Field(None, description="The student's new roll number.")
    is_active: Optional[bool] = Field(None, description="Set the student's active status.")


class DeleteStudentSchema(BaseModel):
    """Input schema for the delete_student tool."""

    student_id: int = Field(..., description="The unique ID of the student to soft-delete.")


class PromoteStudentsSchema(BaseModel):
    """Input schema for the promote_students tool."""

    student_ids: list[int] = Field(..., description="A list of student IDs to promote.")
    new_class_id: int = Field(..., description="The ID of the new class to promote students into.")


class GetStudentSummarySchema(BaseModel):
    """Input schema for the get_student_academic_summary tool."""

    student_id: int = Field(..., description="The unique ID of the student.")
    academic_year_id: Optional[int] = Field(None, description="Optional: The ID of the academic year for the summary. Defaults to the active year if not provided.")


# --- Schemas for Student Contact Tools (from student_contacts.py) ---


class AssignParentSchema(BaseModel):
    """Input schema for the assign_parent_to_student tool."""

    student_id: int = Field(..., description="The ID of the student.")
    profile_user_id: str = Field(..., description="The UUID of the parent's profile (user_id).")
    name: str = Field(..., description="The parent's full name.")
    phone: str = Field(..., description="The parent's phone number.")
    email: Optional[str] = Field(None, description="The parent's email.")
    relationship_type: str = Field(..., description="e.g., 'Father', 'Mother', 'Guardian'.")
    is_emergency_contact: Optional[bool] = Field(default=False, description="Set to true if this is an emergency contact.")


class GetParentContactsSchema(BaseModel):
    """Input schema for the get_parent_contacts_for_student tool."""

    student_id: int = Field(..., description="The ID of the student whose contacts you want to list.")


class UpdateParentContactSchema(BaseModel):
    """Input schema for the update_parent_contact tool."""

    contact_id: int = Field(..., description="The unique ID of the contact record to update.")
    name: Optional[str] = Field(None, description="The parent's new full name.")
    phone: Optional[str] = Field(None, description="The parent's new phone number.")
    email: Optional[str] = Field(None, description="The parent's new email.")
    relationship_type: Optional[str] = Field(None, description="The new relationship type.")
    is_emergency_contact: Optional[bool] = Field(None, description="Update the emergency contact status.")


class RemoveParentContactSchema(BaseModel):
    """Input schema for the remove_parent_contact tool."""

    contact_id: int = Field(..., description="The unique ID of the contact record to delete.")


# Export all schemas
__all__ = [
    "SearchStudentsSchema",
    "GetStudentDetailsSchema",
    "AdmitNewStudentSchema",
    "UpdateStudentSchema",
    "DeleteStudentSchema",
    "PromoteStudentsSchema",
    "GetStudentSummarySchema",
    "AssignParentSchema",
    "GetParentContactsSchema",
    "UpdateParentContactSchema",
    "RemoveParentContactSchema",
]
