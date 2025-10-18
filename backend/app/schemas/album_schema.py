# backend/app/schemas/album_schema.py
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

# Import the target schemas we created earlier
from .album_target_schema import AlbumTargetCreate, AlbumTargetResponse


class AlbumType(str, Enum):
    """Enumeration for the types of albums."""

    PROFILE = "profile"
    CULTURAL = "cultural"
    ECOMMERCE = "ecommerce"


class AccessScope(str, Enum):
    """Enumeration for the access scopes of an album."""

    PUBLIC = "public"
    TARGETED = "targeted"
    PRIVATE = "private"


class AlbumBase(BaseModel):
    """Base schema for an album."""

    title: str = Field(..., max_length=255)
    is_public: bool = False
    album_type: AlbumType
    access_scope: AccessScope


class AlbumCreate(AlbumBase):
    """Schema for creating a new album, including its targets."""

    school_id: int
    targets: list[AlbumTargetCreate] = []


class AlbumUpdate(BaseModel):
    """Schema for updating an existing album."""

    title: Optional[str] = None
    is_public: Optional[bool] = None
    album_type: Optional[AlbumType] = None
    access_scope: Optional[AccessScope] = None


class AlbumResponse(AlbumBase):
    """Schema for returning an album from the API."""

    id: int
    school_id: int
    published_by_id: str  # UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    targets: list[AlbumTargetResponse] = []

    model_config = ConfigDict(from_attributes=True)
