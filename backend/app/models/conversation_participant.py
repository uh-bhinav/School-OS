# backend/app/models/conversation_participant.py
from sqlalchemy import UUID, Column, ForeignKey, Integer, PrimaryKeyConstraint, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base

# Assuming Profile model is available


class ConversationParticipant(Base):
    """
    SQLAlchemy model for the conversation_participants table.
    Links users (profiles) to conversations.
    """

    __tablename__ = "conversation_participants"

    conversation_id = Column(Integer, ForeignKey("conversations.conversation_id"), nullable=False)
    user_id = Column(UUID, ForeignKey("profiles.user_id"), nullable=False)

    role = Column(String)  # E.g., 'Initiator', 'Recipient'

    # Relationships
    conversation = relationship("Conversation", back_populates="participants")
    user = relationship("Profile")

    __table_args__ = (PrimaryKeyConstraint("conversation_id", "user_id", name="pk_conversation_participants"),)
