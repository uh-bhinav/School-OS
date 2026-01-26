# backend/app/schemas/album_target.py
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class AlbumTargetType(str, Enum):
    """Enumeration for the types of targets an album can have."""

    CLASS = "class"
    GRADE = "grade"
    SECTION = "section"
    STREAM = "stream"
    INDIVIDUAL_STUDENT = "individual_student"


class AlbumTargetBase(BaseModel):
    """Base schema for an album target, containing the core fields."""

    target_type: AlbumTargetType = Field(..., description="The type of audience for the album.")
    target_id: int = Field(..., gt=0, description="The specific ID for the target type (e.g., class_id, grade_level).")


class AlbumTargetCreate(AlbumTargetBase):
    """Schema used when creating a new album target.
    This schema will be used in a list when creating an album.
    """

    pass


class AlbumTargetResponse(AlbumTargetBase):
    """Schema for returning an album target from the API."""

    id: int
    album_id: int

    model_config = ConfigDict(from_attributes=True)
