# backend/app/schemas/media_item_schema.py
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class MediaItemBase(BaseModel):
    """Base schema for a media item."""

    album_id: int


class MediaItemCreate(MediaItemBase):
    """Schema for creating a new media item in the database (internal use)."""

    storage_path: str
    mime_type: str
    file_size_bytes: int
    uploaded_by_id: str  # UUID


class MediaItemUpdate(BaseModel):
    """Schema for updating a media item's metadata."""

    metadata: Optional[dict] = None


class MediaItemResponse(BaseModel):
    """Schema for returning a media item, exposing a signed URL."""

    id: int
    album_id: int
    mime_type: Optional[str] = None
    file_size_bytes: Optional[int] = None
    uploaded_at: datetime
    signed_url: Optional[HttpUrl] = Field(None, description="A time-limited, secure URL to access the media item.")

    model_config = ConfigDict(from_attributes=True)


class SignedUrlResponse(BaseModel):
    """Schema for returning a generated signed URL for a media asset."""

    signed_url: HttpUrl
    expires_in: int
