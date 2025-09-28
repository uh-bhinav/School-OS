# backend/app/schemas/academic_year_schema.py
from datetime import date
from typing import Optional

from pydantic import BaseModel


# Properties to receive on creation
class AcademicYearCreate(BaseModel):
    school_id: int
    name: str
    start_date: date
    end_date: date


# Properties to receive on update
class AcademicYearUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None


# Properties to return to the client
class AcademicYearOut(BaseModel):
    id: int
    school_id: int
    name: str
    start_date: date
    end_date: date
    is_active: bool

    class Config:
        from_attributes = True
