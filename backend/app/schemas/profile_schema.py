# backend/app/schemas/profile_schema.py
from typing import Optional

from pydantic import UUID4, BaseModel

from app.schemas.student_schema import StudentOut
from app.schemas.teacher_schema import TeacherOut


# Nested schema for role information
class RoleDefinitionOut(BaseModel):
    role_name: str

    class Config:
        from_attributes = True


# Nested schema for the user_roles link
class UserRoleOut(BaseModel):
    role_definition: RoleDefinitionOut

    class Config:
        from_attributes = True


# The main schema for returning a user's profile
class ProfileOut(BaseModel):
    user_id: UUID4
    school_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool
    # email: Optional[EmailStr] = None # Email is on the auth user, not the profile
    roles: list[UserRoleOut] = []
    teacher: Optional[TeacherOut] = None
    student: Optional[StudentOut] = None

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_picture_url: Optional[str] = None
