# backend/app/schemas/exam_schema.py
from datetime import date
from typing import Optional

from pydantic import BaseModel


# Properties to receive on creation
class ExamCreate(BaseModel):
    school_id: int
    exam_name: str
    exam_type_id: int
    start_date: date
    end_date: date
    marks: float
    academic_year_id: int


# Properties to receive on update
class ExamUpdate(BaseModel):
    exam_name: Optional[str] = None
    exam_type_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    marks: Optional[float] = None


# Properties to return to the client
class ExamOut(BaseModel):
    id: int
    school_id: int
    exam_name: str
    exam_type_id: int
    start_date: date
    end_date: date
    marks: float
    academic_year_id: int

    class Config:
        from_attributes = True
