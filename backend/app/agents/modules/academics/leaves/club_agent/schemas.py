# File: app/agents/modules/academics/leaves/club_agent/schemas.py

from typing import Optional

from pydantic.v1 import BaseModel, Field

# --- Tool Schemas ---


class ListAllClubsSchema(BaseModel):
    """Input schema for the list_all_clubs tool. No arguments needed."""

    pass


class GetClubDetailsSchema(BaseModel):
    """Input schema for the get_club_details tool."""

    club_name: str = Field(..., description="The name of the club (e.g., 'Debate Club', 'Science Club').")


class CreateClubSchema(BaseModel):
    """Input schema for the create_club tool."""

    club_name: str = Field(..., description="The new club's name.")
    teacher_coordinator_name: str = Field(..., description="The full name of the teacher who will act as the coordinator.")
    description: Optional[str] = Field(default=None, description="An optional description for the club.")


class AddStudentToClubSchema(BaseModel):
    """Input schema for the add_student_to_club tool."""

    student_name: str = Field(..., description="The full name of the student to add.")
    club_name: str = Field(..., description="The name of the club to join.")


class ListClubMembersSchema(BaseModel):
    """Input schema for the list_club_members tool."""

    club_name: str = Field(..., description="The name of the club for which to list members.")


# --- Exports ---

__all__ = ["ListAllClubsSchema", "GetClubDetailsSchema", "CreateClubSchema", "AddStudentToClubSchema", "ListClubMembersSchema"]
