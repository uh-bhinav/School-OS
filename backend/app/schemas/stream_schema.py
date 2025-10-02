# backend/app/schemas/stream_schema.py

from typing import Optional

from pydantic import BaseModel, Field

# --- Nested Schemas ---


# A minimal representation of a Subject to be included in the StreamOut response.
# This avoids circular dependencies and keeps the payload lean.
class SubjectForStreamOut(BaseModel):
    subject_id: int
    name: str

    class Config:
        from_attributes = True


# --- Base Schemas ---


class StreamBase(BaseModel):
    name: str
    description: Optional[str] = None


# --- Schemas for API Operations ---


class StreamCreate(StreamBase):
    school_id: int


class StreamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class StreamSubjectsUpdate(BaseModel):
    """
    Schema specifically for the operation of assigning a list of subjects to a stream.
    """
    subject_ids: list[int] = Field(
        ..., description="A list of subject IDs to associate with the stream."
    )


class StreamOut(StreamBase):
    id: int
    school_id: int
    is_active: bool
    subjects: list[SubjectForStreamOut] = []

    class Config:
        from_attributes = True
