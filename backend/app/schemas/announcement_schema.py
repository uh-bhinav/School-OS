# backend/app/schemas/announcement_schema.py
from uuid import UUID

from pydantic import BaseModel, Field

# --- Input Schemas ---


class AnnouncementTargetIn(BaseModel):
    """Defines a single target for the announcement."""

    target_type: str = Field(..., description="e.g., 'SCHOOL', 'GRADE', 'CLASS'")
    target_id: int = Field(
        ..., description="The ID corresponding to the target_type (e.g., a class_id)."
    )


class AnnouncementCreate(BaseModel):
    """Schema for creating a new announcement."""

    school_id: int
    title: str
    content: dict = Field(..., description="The message body as JSON/rich text.")
    targets: list[AnnouncementTargetIn] = Field(
        ..., description="The audience to receive the announcement."
    )


# --- Output Schemas ---


class AnnouncementTargetOut(AnnouncementTargetIn):
    id: int
    announcement_id: int

    class Config:
        from_attributes = True


class AnnouncementOut(BaseModel):
    """Schema for returning announcement details."""

    id: int
    school_id: int
    published_by_id: UUID
    title: str
    content: dict
    is_active: bool
    targets: list[AnnouncementTargetOut]  # Includes the list of recipients/targets

    class Config:
        from_attributes = True
