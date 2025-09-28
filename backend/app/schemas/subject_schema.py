# backend/app/schemas/subject_schema.py
from typing import Optional

from pydantic import BaseModel


class SubjectCreate(BaseModel):
    school_id: int
    name: str
    short_code: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    short_code: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None


class SubjectOut(BaseModel):
    subject_id: int
    school_id: int
    name: str
    short_code: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True
