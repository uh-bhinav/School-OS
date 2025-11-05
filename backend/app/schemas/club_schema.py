from datetime import date, datetime, time
from typing import Any, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

# Import all club-related enums from the central enums file
from app.schemas.enums import ClubActivityStatus, ClubActivityType, ClubMembershipRole, ClubMembershipStatus, ClubType, MeetingFrequency

# --- Club Schemas ---


class ClubBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    club_type: ClubType
    logo_url: Optional[str] = Field(None, max_length=500)
    meeting_schedule: Optional[Any] = None  # JSONB field
    meeting_frequency: MeetingFrequency = MeetingFrequency.weekly
    max_members: Optional[int] = Field(None, gt=0)
    registration_open: bool = True
    registration_start_date: Optional[date] = None
    registration_end_date: Optional[date] = None
    club_rules: Optional[str] = None
    objectives: Optional[List[str]] = Field(default_factory=list)  # JSONB as list of strings
    is_active: bool = True


class ClubCreate(ClubBase):
    teacher_in_charge_id: int
    assistant_teacher_id: Optional[int] = None
    academic_year_id: int


class ClubUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    club_type: Optional[ClubType] = None
    logo_url: Optional[str] = Field(None, max_length=500)
    meeting_schedule: Optional[Any] = None
    meeting_frequency: Optional[MeetingFrequency] = None
    max_members: Optional[int] = Field(None, gt=0)
    registration_open: Optional[bool] = None
    registration_start_date: Optional[date] = None
    registration_end_date: Optional[date] = None
    club_rules: Optional[str] = None
    objectives: Optional[List[str]] = None
    is_active: Optional[bool] = None
    teacher_in_charge_id: Optional[int] = None
    assistant_teacher_id: Optional[int] = None


class ClubRead(ClubBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    school_id: int
    teacher_in_charge_id: int
    assistant_teacher_id: Optional[int] = None
    academic_year_id: int
    current_member_count: int
    created_at: datetime
    updated_at: datetime

    # Example of including relational data (you'd need a Pydantic model for Teacher)
    # teacher_in_charge: Optional[Any] = None


# --- Club Membership Schemas ---


class ClubMembershipBase(BaseModel):
    role: ClubMembershipRole = ClubMembershipRole.member
    status: ClubMembershipStatus = ClubMembershipStatus.active
    contribution_score: int = Field(0, ge=0)
    notes: Optional[str] = None


class ClubMembershipCreate(BaseModel):
    student_id: int
    club_id: int
    role: ClubMembershipRole = ClubMembershipRole.member
    status: ClubMembershipStatus = ClubMembershipStatus.active


class ClubMembershipUpdate(BaseModel):
    role: Optional[ClubMembershipRole] = None
    status: Optional[ClubMembershipStatus] = None
    contribution_score: Optional[int] = Field(None, ge=0)
    attendance_count: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None
    exit_date: Optional[date] = None
    exit_reason: Optional[str] = None


class ClubMembershipRead(ClubMembershipBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    club_id: int
    student_id: int
    approved_by_user_id: UUID
    joined_date: date
    attendance_count: int
    exit_date: Optional[date] = None
    exit_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # You can add relational models here if needed
    # student: Optional[StudentReadMinimal] = None
    # club: Optional[ClubReadMinimal] = None


# --- Club Activity Schemas ---


class ClubActivityBase(BaseModel):
    activity_name: str = Field(..., max_length=255)
    activity_type: ClubActivityType
    description: Optional[str] = None
    scheduled_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    venue: Optional[str] = Field(None, max_length=255)
    attendance_mandatory: bool = False
    max_participants: Optional[int] = Field(None, gt=0)
    budget_allocated: Optional[float] = Field(None, ge=0)  # Using float for NUMERIC
    status: ClubActivityStatus = ClubActivityStatus.planned
    outcome_notes: Optional[str] = None
    media_urls: Optional[List[str]] = Field(default_factory=list)


class ClubActivityCreate(ClubActivityBase):
    organized_by_student_id: Optional[int] = None


class ClubActivityUpdate(BaseModel):
    activity_name: Optional[str] = Field(None, max_length=255)
    activity_type: Optional[ClubActivityType] = None
    description: Optional[str] = None
    scheduled_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    venue: Optional[str] = Field(None, max_length=255)
    attendance_mandatory: Optional[bool] = None
    max_participants: Optional[int] = Field(None, gt=0)
    budget_allocated: Optional[float] = None
    status: Optional[ClubActivityStatus] = None
    outcome_notes: Optional[str] = None
    media_urls: Optional[List[str]] = None
    organized_by_student_id: Optional[int] = None


class ClubActivityRead(ClubActivityBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    club_id: int
    organized_by_student_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
