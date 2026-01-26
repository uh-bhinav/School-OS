# backend/app/schemas/employment_status_schema.py
from typing import Optional

from pydantic import BaseModel


class EmploymentStatusCreate(BaseModel):
    school_id: int
    status_name: str


class EmploymentStatusUpdate(BaseModel):
    status_name: Optional[str] = None


class EmploymentStatusOut(BaseModel):
    status_id: int
    school_id: int
    status_name: str

    class Config:
        from_attributes = True
