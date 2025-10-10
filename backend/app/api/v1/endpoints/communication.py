# backend/app/api/v1/endpoints/communication.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.communication_schema import (
    ConversationCreate,
    ConversationOut,
    MessageCreate,
    MessageOut,
)
from app.services import communication_service

router = APIRouter()

# --- Conversation Endpoints ---


@router.post(
    "/conversations/",
    response_model=ConversationOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Communication: Chat"],
)
async def start_new_conversation(
    conv_in: ConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Starts a new conversation thread with one or more recipients."""
    conversation = await communication_service.create_conversation(db=db, obj_in=conv_in, creator_user_id=current_profile.user_id)
    return ConversationOut.model_validate(conversation, from_attributes=True)


@router.get(
    "/conversations/me/",
    response_model=list[ConversationOut],
    tags=["Communication: Chat"],
)
async def get_my_conversations(
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Retrieves all conversations the current user is a participant in."""
    # RLS and service logic ensure the user only sees chats they belong to.
    conversations = await communication_service.get_user_conversations(db=db, user_id=current_profile.user_id)
    return [ConversationOut.model_validate(conversation, from_attributes=True) for conversation in conversations]


# # --- Message Endpoints ---


@router.post(
    "/conversations/{conversation_id}/messages/",
    response_model=MessageOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Communication: Chat"],
)
async def send_new_message(
    conversation_id: int,
    message_in: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Sends a new message to an existing conversation."""
    message = await communication_service.create_message(
        db=db,
        conversation_id=conversation_id,
        obj_in=message_in,
        sender_id=current_profile.user_id,
    )
    return MessageOut.model_validate(message, from_attributes=True)


@router.get(
    "/conversations/{conversation_id}/messages/",
    response_model=list[MessageOut],
    tags=["Communication: Chat"],
)
async def get_chat_history(conversation_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieves all messages for a specific conversation (RLS enforces access)."""
    messages = await communication_service.get_messages_in_conversation(db=db, conversation_id=conversation_id)
    return [MessageOut.model_validate(message, from_attributes=True) for message in messages]
