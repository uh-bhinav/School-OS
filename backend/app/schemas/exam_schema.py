# backend/app/schemas/exam_schema.py
from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# Properties to receive on creation
class ExamCreate(BaseModel):
    school_id: int
    exam_name: str
    exam_type_id: int
    start_date: date
    end_date: date
    marks: float = Field(..., alias="total_marks")
    academic_year_id: int

    model_config = ConfigDict(populate_by_name=True)


# Properties to receive on update
class ExamUpdate(BaseModel):
    exam_name: Optional[str] = None
    exam_type_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    marks: Optional[float] = Field(None, alias="total_marks")

    model_config = ConfigDict(populate_by_name=True)


# Properties to return to the client
class ExamOut(BaseModel):
    id: int
    school_id: int
    exam_name: str
    exam_type_id: int
    start_date: date
    end_date: date
    marks: float = Field(..., alias="total_marks")
    academic_year_id: int

    class Config:
        from_attributes = True
        populate_by_name = True
