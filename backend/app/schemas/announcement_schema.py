from datetime import datetime
from typing import Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field

# --- Input Schemas ---


class AnnouncementTargetIn(BaseModel):
    """Defines a single target for the announcement."""

    target_type: str = Field(..., description="e.g., 'SCHOOL', 'GRADE', 'CLASS'")
    target_id: int = Field(..., description="The ID corresponding to the target_type (e.g., a class_id).")


class AnnouncementCreate(BaseModel):
    """Schema for creating a new announcement."""

    school_id: int
    # FIX: Title must be Optional to reflect
    #  DB nullability (though usually required by UX)
    title: Optional[str] = None
    content: Union[dict, str] = Field(..., description="The message body as JSON/rich text or simple string.")
    targets: list[AnnouncementTargetIn] = Field(..., description="The audience to receive the announcement.")


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
    # FIX: Title must be Optional to reflect DB nullability
    title: Optional[str]
    content: Union[dict, str]
    is_active: bool

    # ADDED OUTPUT FIELDS (from Model fix)
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    language: Optional[str] = None

    targets: list[AnnouncementTargetOut]  # Includes the list of recipients/targets

    class Config:
        from_attributes = True
