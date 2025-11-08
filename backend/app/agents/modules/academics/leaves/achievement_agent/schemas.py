# File: app/agents/modules/academics/leaves/achievement_agent/schemas.py

from typing import Optional

from pydantic.v1 import BaseModel, Field

# --- Tool Schemas ---


class GetStudentAchievementsSchema(BaseModel):
    """Input schema for the get_student_achievements tool."""

    student_name: str = Field(..., description="The full name of the student whose achievements to fetch.")
    verified_only: Optional[bool] = Field(default=True, description="Set to False to include unverified achievements. Defaults to True.")


class AddStudentAchievementSchema(BaseModel):
    """Input schema for the add_student_achievement tool."""

    student_name: str = Field(..., description="The full name of the student who earned the achievement.")
    title: str = Field(..., description="The title of the achievement (e.g., 'Won Debate Competition').")
    achievement_type: str = Field(..., description="The category of the achievement (e.g., 'Sports', 'Academics', 'Arts').")
    level: Optional[str] = Field(default=None, description="Optional level (e.g., 'School', 'State', 'National').")
    issued_by: Optional[str] = Field(default=None, description="The person or organization that issued the achievement (e.g., 'Science Olympiad Foundation').")


class VerifyAchievementSchema(BaseModel):
    """Input schema for the verify_achievement tool."""

    achievement_id: int = Field(..., description="The unique ID of the achievement to verify.")


class GetUnverifiedAchievementsSchema(BaseModel):
    """Input schema for the get_unverified_achievements_list tool. No arguments needed."""

    pass


class GetPointsForAchievementSchema(BaseModel):
    """Input schema for the get_points_for_achievement tool."""

    achievement_type: str = Field(..., description="The category of the achievement (e.g., 'Sports').")
    level: str = Field(..., description="The level of the achievement (e.g., 'National').")


# --- Exports ---

__all__ = ["GetStudentAchievementsSchema", "AddStudentAchievementSchema", "VerifyAchievementSchema", "GetUnverifiedAchievementsSchema", "GetPointsForAchievementSchema"]
