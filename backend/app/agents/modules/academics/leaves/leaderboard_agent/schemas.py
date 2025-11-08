# File: app/agents/modules/academics/leaves/leaderboard_agent/schemas.py

from typing import Literal, Optional

from pydantic.v1 import BaseModel, Field

Category = Literal["academic", "sports", "arts", "community", "overall"]


class GetSchoolLeaderboardSchema(BaseModel):
    """Input schema for the get_school_leaderboard tool."""

    category: Category = Field(default="overall", description="The category for the leaderboard (e.g., 'academic', 'sports', 'overall').")
    top_n: Optional[int] = Field(default=10, description="The number of students to return (e.g., 10 for Top 10).")


class GetClassLeaderboardSchema(BaseModel):
    """Input schema for the get_class_leaderboard tool."""

    class_name: str = Field(..., description="The name of the class (e.g., '10A').")
    category: Category = Field(default="academic", description="The category for the leaderboard (e.g., 'academic', 'overall').")
    top_n: Optional[int] = Field(default=10, description="The number of students to return.")


class GetClubLeaderboardSchema(BaseModel):
    """Input schema for the get_club_leaderboard tool."""

    club_name: str = Field(..., description="The name of the club (e.g., 'Debate Club').")
    top_n: Optional[int] = Field(default=5, description="The number of members to return.")


class RunLeaderboardComputationSchema(BaseModel):
    """Input schema for the run_leaderboard_computation tool. No arguments needed."""

    pass


# --- Exports ---

__all__ = ["GetSchoolLeaderboardSchema", "GetClassLeaderboardSchema", "GetClubLeaderboardSchema", "RunLeaderboardComputationSchema", "Category"]
