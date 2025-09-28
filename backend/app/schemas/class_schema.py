# backend/app/schemas/class_schema.py

from typing import Optional

from pydantic import BaseModel


# Properties to receive on class creation
class ClassCreate(BaseModel):
    school_id: int
    grade_level: int
    section: str
    academic_year_id: int
    class_teacher_id: Optional[int] = None


# Properties to receive on class update
class ClassUpdate(BaseModel):
    grade_level: Optional[int] = None
    section: Optional[str] = None
    academic_year_id: Optional[int] = None
    class_teacher_id: Optional[int] = None
    is_active: Optional[bool] = None


# Properties to return to the client
class ClassOut(BaseModel):
    class_id: int
    school_id: int
    grade_level: int
    section: str
    academic_year_id: int
    class_teacher_id: Optional[int] = None
    is_active: bool

    class Config:
        from_attributes = True
