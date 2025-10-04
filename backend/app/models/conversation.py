# backend/app/models/conversation.py
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Conversation(Base):
    """
    SQLAlchemy model for the conversations table (Chat Header).
    """

    __tablename__ = "conversations"

    conversation_id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)

    title = Column(String)
    status = Column(String, default="Open")  # E.g., Open, Resolved, Archived

    # Relationships
    school = relationship("School")
    participants = relationship(
        "ConversationParticipant", back_populates="conversation"
    )
    messages = relationship("Message", back_populates="conversation")
