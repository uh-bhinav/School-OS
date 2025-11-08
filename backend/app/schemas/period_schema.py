# backend/app/schemas/period_schema.py
from datetime import time
from typing import Optional

from pydantic import BaseModel, Field, model_validator


class PeriodCreateRequest(BaseModel):
    period_number: int
    period_name: str
    start_time: time
    end_time: time
    duration_minutes: Optional[int] = Field(None, ge=1, description="Duration in minutes")
    is_recess: bool = False
    day_of_week: Optional[str] = Field(None, description="Day if period is day-specific (e.g., 'Monday')")

    @model_validator(mode="after")
    def check_times_are_valid(self) -> "PeriodCreateRequest":
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError("End time must be after start time")
        return self


class PeriodCreate(BaseModel):
    school_id: int
    period_number: int
    period_name: str
    start_time: time
    end_time: time
    duration_minutes: Optional[int] = Field(None, ge=1, description="Duration in minutes")
    is_recess: bool = False
    day_of_week: Optional[str] = Field(None, description="Day if period is day-specific (e.g., 'Monday')")

    @model_validator(mode="after")
    def check_times_are_valid(self) -> "PeriodCreate":
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError("End time must be after start time")
        return self


class PeriodUpdate(BaseModel):
    period_number: Optional[int] = None
    period_name: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    duration_minutes: Optional[int] = Field(None, ge=1)
    is_recess: Optional[bool] = None
    day_of_week: Optional[str] = None


class PeriodOut(BaseModel):
    id: int
    school_id: int
    period_number: int
    period_name: Optional[str] = None  # FIX: Make optional since it's nullable in DB
    start_time: time
    end_time: time
    duration_minutes: Optional[int]
    is_recess: bool
    day_of_week: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


# This is the sub-model for the bulk create
class PeriodStructureItem(BaseModel):
    period_number: int
    period_name: str
    start_time: time
    end_time: time
    is_recess: bool = False
    day_of_week: Optional[str] = None

    @model_validator(mode="after")
    def check_times_are_valid(self) -> "PeriodStructureItem":
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError("End time must be after start time")
        return self


# This is the main schema the agent will send
class PeriodStructureCreate(BaseModel):
    periods: list[PeriodStructureItem]
