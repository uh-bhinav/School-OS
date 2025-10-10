# backend/app/schemas/mark_schema.py
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.schemas.exam_schema import ExamOut
from app.schemas.subject_schema import SubjectOut


# Properties to receive on creation
# Properties to receive on creation
class MarkCreate(BaseModel):
    # ADDED: This is required by the database
    school_id: int
    student_id: int
    exam_id: int
    subject_id: int
    marks_obtained: float
    max_marks: float = 100.0
    remarks: Optional[str] = None


# Properties to receive on update
class MarkUpdate(BaseModel):
    marks_obtained: Optional[float] = None
    remarks: Optional[str] = None


# Properties to return to the client
class MarkOut(BaseModel):
    id: int
    school_id: int
    student_id: int
    exam_id: int
    subject_id: int
    subject: Optional[SubjectOut] = None
    exam: Optional[ExamOut] = None
    marks_obtained: Decimal
    max_marks: Decimal
    remarks: Optional[str] = None
    entered_by_teacher_id: Optional[int] = None

    class Config:
        from_attributes = True


class ClassPerformanceSummary(BaseModel):
    class_average: Optional[float] = None
    highest_score: Optional[float] = None
    lowest_score: Optional[float] = None
    total_students: int
    students_passed: int
    failure_rate: float
