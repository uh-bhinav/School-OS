# backend/app/models/message.py
from sqlalchemy import JSON, UUID, Boolean, Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Message(Base):
    """
    SQLAlchemy model for the messages table (Chat Content).
    """

    __tablename__ = "messages"

    message_id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(
        Integer, ForeignKey("conversations.conversation_id"), nullable=False
    )
    sender_id = Column(UUID, ForeignKey("profiles.user_id"), nullable=False)

    payload = Column(
        JSON, nullable=False
    )  # Stores the message content/rich media reference
    is_read = Column(Boolean, default=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("Profile")
