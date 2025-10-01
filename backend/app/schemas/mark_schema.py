# backend/app/schemas/mark_schema.py
from typing import Optional

from pydantic import BaseModel

from app.schemas.exam_schema import ExamOut
from app.schemas.subject_schema import SubjectOut


# Properties to receive on creation
class MarkCreate(BaseModel):
    student_id: int
    exam_id: int
    subject_id: int
    marks_obtained: float
    entered_by_teacher_id: Optional[int] = None


class MarkBulkCreate(BaseModel):
    marks: list[MarkCreate]


# Properties to receive on update
class MarkUpdate(BaseModel):
    marks_obtained: Optional[float] = None
    entered_by_teacher_id: Optional[int] = None
    remarks: Optional[str] = None


# Properties to return to the client
class MarkOut(BaseModel):
    id: int
    student_id: int
    subject: Optional[SubjectOut] = None
    exam: Optional[ExamOut] = None
    marks_obtained: float
    entered_by_teacher_id: Optional[int] = None

    class Config:
        from_attributes = True
