# backend/app/schemas/exam_type_schema.py
from typing import Optional

from pydantic import BaseModel


class ExamTypeCreate(BaseModel):
    school_id: int
    type_name: str


class ExamTypeUpdate(BaseModel):
    type_name: Optional[str] = None


class ExamTypeOut(BaseModel):
    exam_type_id: int
    school_id: int
    type_name: str

    class Config:
        from_attributes = True
