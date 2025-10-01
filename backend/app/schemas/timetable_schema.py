# backend/app/schemas/timetable_schema.py
from typing import Optional

from pydantic import BaseModel, Field


# Properties to receive on creation
class TimetableEntryCreate(BaseModel):
    class_id: int
    subject_id: int
    teacher_id: int
    period_id: int
    day_of_week: int = Field(..., ge=1, le=5)  # 1=Monday, 5=Friday
    academic_year_id: int


# Properties to receive on update
class TimetableEntryUpdate(BaseModel):
    class_id: Optional[int] = None
    subject_id: Optional[int] = None
    teacher_id: Optional[int] = None
    period_id: Optional[int] = None
    day_of_week: Optional[int] = Field(None, ge=1, le=5)
    academic_year_id: Optional[int] = None


# Properties to return to the client
class TimetableEntryOut(BaseModel):
    id: int
    class_id: int
    subject_id: int
    teacher_id: int
    period_id: int
    day_of_week: int
    academic_year_id: int

    class Config:
        from_attributes = True
