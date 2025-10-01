# backend/app/schemas/teacher_schema.py
from datetime import date
from typing import Any, Optional

from pydantic import UUID4, BaseModel, ConfigDict


# A simple schema to represent profile info nested within the teacher response
class ProfileForTeacherOut(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Properties to receive on teacher update
class TeacherUpdate(BaseModel):
    department: Optional[str] = None
    subject_specialization: Optional[str] = None
    hire_date: Optional[date] = None
    employment_status_id: Optional[int] = None
    years_of_experience: Optional[int] = None
    is_certified: Optional[bool] = None
    bio: Optional[str] = None
    is_active: Optional[bool] = None
    # ADDED: Allow qualifications to be updated
    qualifications: Optional[list[Any]] = None


# Properties to return to the client
class TeacherOut(BaseModel):
    teacher_id: int
    user_id: UUID4
    department: Optional[str] = None
    subject_specialization: Optional[str] = None
    hire_date: Optional[date] = None
    employment_status_id: Optional[int] = None
    is_active: bool
    # ADDED: Return qualifications with the main teacher object
    qualifications: Optional[list[Any]] = None
    profile: ProfileForTeacherOut  # Nested profile information

    model_config = ConfigDict(from_attributes=True)


# ADDED: New schema specifically for the qualifications endpoint
class TeacherQualification(BaseModel):
    """Schema for returning a teacher's professional qualifications."""

    years_of_experience: Optional[int] = None
    qualifications: Optional[list[Any]] = None

    model_config = ConfigDict(from_attributes=True)
