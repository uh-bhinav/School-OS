# backend/app/schemas/exam_period_schema.py
"""
Pydantic schemas for exam period management
"""
from datetime import date, time
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ===== Exam Period Schemas =====

class ExamPeriodCreate(BaseModel):
    """Schema for creating a new exam period"""
    school_id: int
    academic_year_id: int
    class_id: int
    section: str
    exam_period_name: str = Field(..., min_length=3, max_length=200)
    exam_type_id: int
    start_date: date
    end_date: date
    total_marks: int = Field(..., gt=0)
    state: Optional[str] = None  # For state-specific holiday filtering
    auto_map: bool = True  # Whether to auto-map subjects to dates

    @field_validator('end_date')
    @classmethod
    def validate_end_date(cls, v, info):
        if 'start_date' in info.data and v < info.data['start_date']:
            raise ValueError('end_date must be after or equal to start_date')
        return v

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "school_id": 1,
            "academic_year_id": 1,
            "class_id": 10,
            "section": "A",
            "exam_period_name": "Mid-Term Examination 2026",
            "exam_type_id": 1,
            "start_date": "2026-03-10",
            "end_date": "2026-03-25",
            "total_marks": 500,
            "state": "Maharashtra",
            "auto_map": True
        }
    })


class ExamPeriodUpdate(BaseModel):
    """Schema for updating an exam period"""
    exam_period_name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_marks: Optional[int] = Field(None, gt=0)
    status: Optional[str] = None  # draft, scheduled, in_progress, completed

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "exam_period_name": "Updated Mid-Term Exam",
            "status": "scheduled"
        }
    })


class SubjectExamScheduleOut(BaseModel):
    """Schema for subject exam schedule output"""
    id: int
    exam_period_id: int
    subject_id: int
    subject_name: Optional[str] = None
    exam_date: date
    start_time: Optional[time] = None
    duration_minutes: int
    max_marks: int
    is_auto_mapped: bool
    manually_edited_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ExamPeriodOut(BaseModel):
    """Schema for exam period output"""
    id: int
    school_id: int
    academic_year_id: int
    class_id: int
    section: str
    exam_period_name: str
    exam_type_id: int
    start_date: date
    end_date: date
    total_marks: int
    status: str
    created_at: str
    subject_schedules: List[SubjectExamScheduleOut] = []

    model_config = ConfigDict(from_attributes=True)


# ===== Subject Schedule Schemas =====

class SubjectScheduleUpdate(BaseModel):
    """Schema for updating a subject's exam schedule"""
    exam_date: date
    start_time: Optional[time] = None
    duration_minutes: Optional[int] = Field(None, gt=0, le=300)
    max_marks: Optional[int] = Field(None, gt=0)

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "exam_date": "2026-03-15",
            "start_time": "10:00:00",
            "duration_minutes": 90,
            "max_marks": 100
        }
    })


# ===== Calendar View Schemas =====

class CalendarDateInfo(BaseModel):
    """Schema for calendar date information"""
    date: date
    is_sunday: bool
    is_holiday: bool
    holiday_name: Optional[str] = None
    is_exam_date: bool
    subjects_scheduled: List[dict] = []  # List of subjects on this date
    is_valid_for_exam: bool


class ExamCalendarOut(BaseModel):
    """Schema for exam calendar view"""
    exam_period_id: int
    start_date: date
    end_date: date
    dates: List[CalendarDateInfo]
    total_subjects: int
    scheduled_subjects: int
    unscheduled_subjects: int


# ===== Holiday Schemas =====

class HolidayCreate(BaseModel):
    """Schema for creating a holiday"""
    school_id: Optional[int] = None
    name: str = Field(..., min_length=2, max_length=200)
    date: date
    holiday_type: str = Field(..., pattern="^(national|state|school_specific)$")
    state: Optional[str] = None
    description: Optional[str] = None


class HolidayOut(BaseModel):
    """Schema for holiday output"""
    id: int
    name: str
    date: date
    holiday_type: str
    state: Optional[str] = None
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ===== Hall Ticket Schemas =====

class HallTicketOut(BaseModel):
    """Schema for hall ticket output"""
    id: int
    ticket_number: str
    exam_period_id: int
    student_id: int
    generated_at: str
    pdf_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class HallTicketDetailOut(BaseModel):
    """Schema for detailed hall ticket information"""
    ticket_number: str
    student: dict
    exam_period: dict
    schedule: List[dict]
    generated_at: str


# ===== Validation & Auto-mapping Schemas =====

class ValidateDateRequest(BaseModel):
    """Schema for validating an exam date"""
    exam_date: date
    school_id: Optional[int] = None
    state: Optional[str] = None


class ValidateDateResponse(BaseModel):
    """Schema for date validation response"""
    is_valid: bool
    reason: Optional[str] = None
    date: date


class AutoMapRequest(BaseModel):
    """Schema for triggering auto-mapping"""
    exam_period_id: int
    regenerate: bool = False  # Whether to regenerate existing mappings


class AutoMapResponse(BaseModel):
    """Schema for auto-mapping response"""
    success: bool
    exam_period_id: int
    subjects_mapped: int
    message: str
