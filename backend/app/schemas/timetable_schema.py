# backend/app/schemas/timetable_schema.py
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.period_schema import PeriodOut
from app.schemas.subject_schema import SubjectOut
from app.schemas.teacher_schema import TeacherOut


# Properties to receive on creation
class TimetableEntryCreate(BaseModel):
    class_id: int
    subject_id: int
    teacher_id: int
    period_id: int
    day_of_week: int = Field(..., ge=1, le=5)  # 1=Monday, 5=Friday
    academic_year_id: int
    school_id: int


# Properties to receive on update
class TimetableEntryUpdate(BaseModel):
    class_id: Optional[int] = None
    subject_id: Optional[int] = None
    teacher_id: Optional[int] = None
    period_id: Optional[int] = None
    day_of_week: Optional[int] = Field(None, ge=1, le=5)
    academic_year_id: Optional[int] = None
    is_active: Optional[bool] = None


# Properties to return to the client
class TimetableEntryOut(BaseModel):
    id: int
    class_id: int
    subject: Optional[SubjectOut] = None
    teacher: Optional[TeacherOut] = None
    period: Optional[PeriodOut] = None
    day_of_week: int
    academic_year_id: int
    is_active: bool

    class Config:
        from_attributes = True
