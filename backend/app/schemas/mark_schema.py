# backend/app/schemas/mark_schema.py
from typing import Optional

from pydantic import BaseModel


# Properties to receive on creation
class MarkCreate(BaseModel):
    student_id: int
    exam_id: int
    subject_id: int
    marks_obtained: float
    entered_by_teacher_id: Optional[int] = None


# Properties to receive on update
class MarkUpdate(BaseModel):
    marks_obtained: Optional[float] = None
    entered_by_teacher_id: Optional[int] = None


# Properties to return to the client
class MarkOut(BaseModel):
    id: int
    student_id: int
    exam_id: int
    subject_id: int
    marks_obtained: float
    entered_by_teacher_id: Optional[int] = None

    class Config:
        from_attributes = True
