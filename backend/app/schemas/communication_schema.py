# backend/app/schemas/communication_schema.py
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

# --- Message Schemas ---


class MessageCreate(BaseModel):
    """Input for sending a new message."""

    conversation_id: int = Field(
        ..., description="The conversation ID to send the message to."
    )
    payload: dict = Field(..., description="Message content (text, image URL, etc.).")


class MessageOut(BaseModel):
    """Output schema for a single message."""

    message_id: int
    conversation_id: int
    sender_id: UUID
    payload: dict
    is_read: bool
    sent_at: Optional[str] = None  # Using string for datetime output

    class Config:
        from_attributes = True


# --- Conversation Schemas ---


class ConversationCreate(BaseModel):
    """Input for starting a new conversation."""

    school_id: int
    # User IDs to include in the chat (excluding the creator, who is implied)
    recipient_user_ids: list[UUID] = Field(..., min_length=1)
    title: Optional[str] = None


class ConversationParticipantOut(BaseModel):
    """Output schema for a conversation participant."""

    user_id: UUID
    role: Optional[str]

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    """Output schema for a conversation header."""

    conversation_id: int
    school_id: int
    title: Optional[str]
    status: str
    participants: list[ConversationParticipantOut]  # Includes all users in the chat

    class Config:
        from_attributes = True
