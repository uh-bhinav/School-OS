# backend/app/schemas/timetable_schema.py
from typing import Any, Optional

from pydantic import BaseModel, Field

from app.schemas.period_schema import PeriodOut
from app.schemas.subject_schema import SubjectOut
from app.schemas.teacher_schema import TeacherOut

# ============= EXISTING SCHEMAS (Keep as-is) =============


class TimetableEntryCreate(BaseModel):
    class_id: int
    subject_id: int
    teacher_id: int
    period_id: int
    day_of_week: int = Field(..., ge=1, le=7, description="1=Monday, 7=Sunday")
    academic_year_id: int
    school_id: int


class TimetableEntryUpdate(BaseModel):
    class_id: Optional[int] = None
    subject_id: Optional[int] = None
    teacher_id: Optional[int] = None
    period_id: Optional[int] = None
    day_of_week: Optional[int] = Field(None, ge=1, le=7)
    academic_year_id: Optional[int] = None
    is_active: Optional[bool] = None


class TimetableEntryOut(BaseModel):
    id: int
    class_id: int
    subject: Optional[SubjectOut] = None
    teacher: Optional[TeacherOut] = None
    period: Optional[PeriodOut] = None
    day_of_week: int
    academic_year_id: int
    school_id: int
    is_active: bool

    class Config:
        from_attributes = True


# ============= NEW GENERATION SCHEMAS =============


class TimetableConstraint(BaseModel):
    """
    Teacher load constraints and scheduling preferences for timetable generation.

    Priority Order (Highest to Lowest):
    1. Teacher workload limits (daily/weekly max) - MUST be enforced
    2. Core subject prioritization - SHOULD be satisfied when possible
    3. Even distribution - Used as tiebreaker

    All fields are optional to maintain backward compatibility.
    """

    min_classes_per_day: Optional[int] = Field(default=None, ge=0, le=10, description="Minimum classes a teacher should have per day (soft constraint)")
    max_classes_per_day: Optional[int] = Field(default=None, ge=1, le=10, description="Maximum classes a teacher can have per day (hard constraint)")
    min_classes_per_week: Optional[int] = Field(default=None, ge=0, le=50, description="Minimum classes a teacher should have per week (soft constraint)")
    max_classes_per_week: Optional[int] = Field(default=None, ge=1, le=50, description="Maximum classes a teacher can have per week (hard constraint)")
    prioritize_core_subjects: Optional[bool] = Field(default=True, description="Schedule core subjects (Math, Science) in early periods when possible")
    core_subject_names: Optional[list[str]] = Field(default_factory=lambda: ["Mathematics", "Science", "Physics", "Chemistry", "Biology"], description="List of subject names considered as core subjects")


class ConstraintRule(BaseModel):
    """
    Flexible constraint definition for session-level rules.
    These are NOT persisted to DB - only used during generation.
    """

    rule_type: str = Field(..., description="Type of constraint (e.g., 'teacher_max_daily_periods', 'subject_time_restriction')")
    target_type: str = Field(..., description="'teacher', 'subject', 'class'")
    target_id: int = Field(..., description="ID of the teacher/subject/class")
    parameters: dict[str, Any] = Field(default_factory=dict, description="Rule-specific parameters (e.g., {'max_periods': 5, 'before_period': 4})")
    priority: int = Field(default=1, ge=1, le=3, description="1=High, 2=Medium, 3=Low")


class SubjectRequirement(BaseModel):
    """
    Defines what needs to be scheduled for a single subject.
    """

    subject_id: int
    teacher_id: int = Field(..., description="Primary teacher assigned")
    periods_per_week: int = Field(..., ge=1, le=10)
    is_core: bool = Field(default=True, description="Core subjects scheduled before lunch")
    requires_consecutive: bool = Field(default=False, description="Lab subjects need consecutive periods")
    min_gap_days: int = Field(default=0, ge=0, description="Minimum days between occurrences (0=can be daily)")


class TimetableGenerateRequest(BaseModel):
    """
    Main input for timetable generation algorithm.
    """

    class_id: int
    academic_year_id: int
    working_days: list[int] = Field(default=[1, 2, 3, 4, 5, 6], description="1=Monday, 6=Saturday. Default Mon-Sat")
    subject_requirements: list[SubjectRequirement]
    constraints: Optional[list[ConstraintRule]] = Field(default_factory=list, description="Session-level soft constraints (DEPRECATED: use teacher_constraints instead)")
    teacher_constraints: Optional[TimetableConstraint] = Field(default=None, description="Teacher workload limits and core subject prioritization")
    dry_run: bool = Field(default=True, description="If True, don't save to DB. If False, commit results.")


class UnassignedSubjectInfo(BaseModel):
    """
    Details about a subject that couldn't be fully scheduled.
    """

    subject_id: int
    subject_name: str
    requested_periods: int
    assigned_periods: int
    reason: str = Field(..., description="Why it couldn't be fully scheduled")


class ConflictDetail(BaseModel):
    """
    Describes a hard constraint violation during generation.
    """

    conflict_type: str = Field(..., description="'teacher_double_booking', 'class_conflict', etc.")
    day: int
    period_id: int
    details: str


class TimetableGenerateResponse(BaseModel):
    """
    Structured output from the generation algorithm.
    """

    success: bool
    generated_entries: list[TimetableEntryOut]
    unassigned_subjects: list[UnassignedSubjectInfo] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list, description="Soft constraint violations (non-fatal)")
    conflicts: list[ConflictDetail] = Field(default_factory=list, description="Hard constraint violations (fatal if not empty)")
    optimization_score: float = Field(default=0.0, description="Overall quality score (0-100). Higher is better.")
    generation_metadata: dict[str, Any] = Field(default_factory=dict, description="Debug info: time taken, iterations, etc.")


class TeacherAvailabilityCheck(BaseModel):
    """
    Request to check if a teacher is available for a specific slot.
    Used by frontend for manual drag-and-drop validation.
    """

    teacher_id: int
    class_id: int
    day_of_week: int
    period_id: int


class ConflictCheckResponse(BaseModel):
    """
    Response for availability checks.
    """

    has_conflict: bool
    conflict_type: Optional[str] = None
    details: Optional[str] = None


# ============= MANUAL SWAP SCHEMAS =============


class TimetableSwapRequest(BaseModel):
    """
    Request to manually swap two timetable entries.

    Used by principals to adjust generated timetables without regenerating.
    The swap will be rejected if it creates teacher conflicts.

    Note: The user performing the swap is automatically extracted from the JWT token,
    so no manual user_id is required in the request body.
    """

    class_id: int = Field(..., description="Class whose timetable is being modified")
    entry_1_id: int = Field(..., description="ID of first timetable entry to swap")
    entry_2_id: int = Field(..., description="ID of second timetable entry to swap")


class TimetableSwapResponse(BaseModel):
    """
    Response after attempting a timetable swap.
    """

    success: bool
    message: str
    swapped_entries: Optional[list[TimetableEntryOut]] = None
    conflict_details: Optional[str] = None
