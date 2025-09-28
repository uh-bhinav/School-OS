# backend/app/schemas/period_schema.py
from datetime import time
from typing import Optional

from pydantic import BaseModel


class PeriodCreate(BaseModel):
    school_id: int
    period_number: int
    period_name: str
    start_time: time
    end_time: time
    is_recess: bool = False


class PeriodUpdate(BaseModel):
    period_number: Optional[int] = None
    period_name: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_recess: Optional[bool] = None


class PeriodOut(BaseModel):
    id: int
    school_id: int
    period_number: int
    period_name: str
    start_time: time
    end_time: time
    is_recess: bool

    class Config:
        from_attributes = True
