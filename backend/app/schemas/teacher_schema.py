# backend/app/schemas/teacher_schema.py
from datetime import date
from typing import Optional

from pydantic import UUID4, BaseModel


# A simple schema to represent profile info nested within the teacher response
class ProfileForTeacherOut(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None  # We'll need to fetch this from auth.users

    class Config:
        from_attributes = True


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


# Properties to return to the client
class TeacherOut(BaseModel):
    teacher_id: int
    user_id: UUID4
    department: Optional[str] = None
    subject_specialization: Optional[str] = None
    hire_date: Optional[date] = None
    employment_status_id: Optional[int] = None
    is_active: bool
    profile: ProfileForTeacherOut  # Nested profile information

    class Config:
        from_attributes = True
