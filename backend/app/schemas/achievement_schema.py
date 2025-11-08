from __future__ import annotations

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

# Import enums from the central enums file
from app.schemas.enums import AchievementType, AchievementVisibility

# --- Achievement Point Rules Schemas ---


class AchievementPointRuleBase(BaseModel):
    achievement_type: AchievementType
    category_name: str = Field(..., max_length=100)
    base_points: int = Field(..., ge=0)
    level_multiplier: dict[str, float] | None = Field(
        default_factory=lambda: {
            "school": 1.0,
            "district": 1.5,
            "state": 2.0,
            "national": 3.0,
            "international": 5.0,
        }
    )
    is_active: bool = True


class AchievementPointRuleCreate(AchievementPointRuleBase):
    pass


class AchievementPointRuleUpdate(BaseModel):
    achievement_type: AchievementType | None = None
    category_name: str | None = Field(None, max_length=100)
    base_points: int | None = Field(None, ge=0)
    level_multiplier: dict[str, float] | None = None
    is_active: bool | None = None


class AchievementPointRule(AchievementPointRuleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    school_id: int
    created_at: datetime


# --- Student Achievement Schemas ---


class StudentAchievementBase(BaseModel):
    student_id: int
    academic_year_id: int
    achievement_type: AchievementType
    title: str = Field(..., max_length=255)
    description: str | None = None
    achievement_category: str = Field(..., max_length=100)
    date_awarded: date
    certificate_url: str | None = Field(None, max_length=500)
    evidence_urls: list[str] | None = Field(default_factory=list)
    visibility: AchievementVisibility = AchievementVisibility.school_only
    # Note: 'level' is not in the DB model, so we can't use level_multiplier.
    # If we add 'level' to the create schema, the service needs to handle it.
    # For now, we'll stick to the DB schema and use base_points.


class StudentAchievementCreate(StudentAchievementBase):
    pass


class StudentAchievementUpdate(BaseModel):
    # Only allows updating fields a teacher might correct *before* verification
    achievement_type: AchievementType | None = None
    title: str | None = Field(None, max_length=255)
    description: str | None = None
    achievement_category: str | None = Field(None, max_length=100)
    date_awarded: date | None = None
    certificate_url: str | None = Field(None, max_length=500)
    evidence_urls: list[str] | None = None
    visibility: AchievementVisibility | None = None


class StudentAchievement(StudentAchievementBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    school_id: int
    awarded_by_user_id: UUID
    verified_by_user_id: UUID | None = None
    points_awarded: int
    is_verified: bool
    verified_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


# --- Leaderboard Schemas ---


class LeaderboardStudent(BaseModel):
    student_id: int
    student_name: str
    class_id: int | None = None
    class_name: str | None = None
    total_points: int
    achievement_points: int
    exam_points: int
    club_points: int


class LeaderboardClub(BaseModel):
    club_id: int
    club_name: str
    total_points: int


class AgentAddAchievement(BaseModel):
    """Schema for the agent to add an achievement using names."""

    student_name: str = Field(..., description="The full name of the student.")
    title: str = Field(..., max_length=255)
    achievement_type: AchievementType
    achievement_category: str = Field(..., max_length=100)
    date_awarded: date


class AgentPointsLookup(BaseModel):
    """Schema for the agent to look up points for a rule."""

    achievement_type: AchievementType
    category_name: str = Field(..., max_length=100)
