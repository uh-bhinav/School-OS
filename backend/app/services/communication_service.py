# backend/app/services/communication_service.py
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.conversation import Conversation
from app.models.conversation_participant import ConversationParticipant
from app.models.message import Message
from app.schemas.communication_schema import ConversationCreate, MessageCreate


async def create_conversation(
    db: AsyncSession, *, obj_in: ConversationCreate, creator_user_id: UUID
) -> Conversation:
    """
    Creates a new conversation and adds all participants (including the creator).
    """
    db_conversation = Conversation(school_id=obj_in.school_id, title=obj_in.title)
    db.add(db_conversation)
    await db.flush()

    all_participants = obj_in.recipient_user_ids + [creator_user_id]

    for user_id in set(all_participants):  # Use set to handle duplicates
        role_type = "Initiator" if user_id == creator_user_id else "Recipient"
        db_participant = ConversationParticipant(
            conversation_id=db_conversation.conversation_id,
            user_id=user_id,
            role=role_type,
        )
        db.add(db_participant)

    await db.commit()
    await db.refresh(db_conversation)
    return db_conversation


async def get_user_conversations(db: AsyncSession, user_id: UUID) -> list[Conversation]:
    """Retrieves all conversations the user is a part of (filtered by RLS)."""
    # RLS should handle filtering. This function
    #  returns all records accessible to the user.
    stmt = select(Conversation)
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_message(
    db: AsyncSession, *, obj_in: MessageCreate, sender_id: UUID
) -> Message:
    """
    Creates a new message if the sender is a participant in the conversation.
    """
    # 1. Verification (RLS handles read, but we need service check for write integrity)
    stmt = select(ConversationParticipant).where(
        ConversationParticipant.conversation_id == obj_in.conversation_id,
        ConversationParticipant.user_id == sender_id,
    )
    result = await db.execute(stmt)
    if not result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a participant in this conversation.",
        )

    # 2. Create Message
    db_message = Message(
        conversation_id=obj_in.conversation_id,
        sender_id=sender_id,
        payload=obj_in.payload,
    )
    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)
    return db_message


async def get_messages_in_conversation(
    db: AsyncSession, conversation_id: int
) -> list[Message]:
    """Retrieves all messages in a conversation
    (RLS handles participant read access)."""
    stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.message_id.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()
