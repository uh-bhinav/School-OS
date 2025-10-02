# backend/app/schemas/student_contact_schema.py
from typing import Optional

from pydantic import UUID4, BaseModel, EmailStr


class StudentContactCreate(BaseModel):
    student_id: int
    profile_user_id: UUID4  # The parent/guardian's user_id
    name: str
    phone: str
    email: Optional[EmailStr] = None
    relationship_type: str
    is_emergency_contact: bool = False


class StudentContactUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    relationship_type: Optional[str] = None
    is_emergency_contact: Optional[bool] = None
    custody_notes: Optional[str] = None
    is_active: Optional[bool] = None


class StudentContactOut(BaseModel):
    id: int
    student_id: int
    profile_user_id: UUID4
    name: str
    phone: str
    email: Optional[EmailStr] = None
    relationship_type: str
    is_active: bool

    class Config:
        from_attributes = True
