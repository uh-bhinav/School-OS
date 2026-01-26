# This is the corrected import block
from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import UUID4, BaseModel, EmailStr, Field


# A nested schema for returning profile info with the student record
class ProfileForStudentOut(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None

    class Config:
        from_attributes = True


# Schema for enrolling a new student. Contains all required info.
class StudentCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    school_id: int
    current_class_id: int
    roll_number: Optional[str] = None
    enrollment_date: date
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None


# Schema for updating an existing student's record
class StudentUpdate(BaseModel):
    current_class_id: Optional[int] = None
    proctor_teacher_id: Optional[int] = None
    roll_number: Optional[str] = None
    academic_status: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


# Schema for returning a student's full details
class StudentOut(BaseModel):
    student_id: int
    user_id: UUID4
    current_class_id: Optional[int] = None
    roll_number: Optional[str] = None
    is_active: bool
    profile: ProfileForStudentOut

    class Config:
        from_attributes = True


class StudentBulkPromoteIn(BaseModel):
    student_ids: list[int] = Field(..., min_length=1)
    target_class_id: int


# ADDED: Schema for the bulk promotion response
class StudentBulkPromoteOut(BaseModel):
    status: str
    promoted_count: int


class MarkForSummaryOut(BaseModel):
    subject_name: str
    exam_name: str
    marks_obtained: Decimal

    class Config:
        from_attributes = True


# ADDED: The main schema for the academic summary response
class StudentAcademicSummaryOut(BaseModel):
    student_id: int
    full_name: str
    overall_attendance_percentage: Optional[float] = None
    average_score_percentage: Optional[float] = None
    recent_marks: list[MarkForSummaryOut] = []
