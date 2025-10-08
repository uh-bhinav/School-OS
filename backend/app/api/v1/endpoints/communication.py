# # backend/app/api/v1/endpoints/communication.py
# from fastapi import APIRouter, Depends, status
# from sqlalchemy.ext.asyncio import AsyncSession

# from app.core.security import get_current_user
# from app.db.session import get_db
# from app.schemas.communication_schema import (
#     ConversationCreate,
#     ConversationOut,
#     MessageCreate,
#     MessageOut,
# )
# from app.services import communication_service
# from supabase.lib.client_options import User

# router = APIRouter()

# router = APIRouter()

# # --- Conversation Endpoints ---


# @router.post(
#     "/conversations",
#     response_model=ConversationOut,
#     status_code=status.HTTP_201_CREATED,
#     tags=["Communication: Chat"],
# )
# async def start_new_conversation(
#     conv_in: ConversationCreate,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     """Starts a new conversation thread with one or more recipients."""
#     return await communication_service.create_conversation(db=db, obj_in=conv_in, creator_user_id=current_user.id)


# @router.get(
#     "/conversations/me",
#     response_model=list[ConversationOut],
#     tags=["Communication: Chat"],
# )
# async def get_my_conversations(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
#     """Retrieves all conversations the current user is a participant in."""
#     # RLS and service logic ensure the user only sees chats they belong to.
#     return await communication_service.get_user_conversations(db=db, user_id=current_user.id)


# # --- Message Endpoints ---


# @router.post(
#     "/messages",
#     response_model=MessageOut,
#     status_code=status.HTTP_201_CREATED,
#     tags=["Communication: Chat"],
# )
# async def send_new_message(
#     message_in: MessageCreate,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     """Sends a new message to an existing conversation."""
#     return await communication_service.create_message(db=db, obj_in=message_in, sender_id=current_user.id)


# @router.get(
#     "/conversations/{conversation_id}/messages",
#     response_model=list[MessageOut],
#     tags=["Communication: Chat"],
# )
# async def get_chat_history(conversation_id: int, db: AsyncSession = Depends(get_db)):
#     """Retrieves all messages for a specific conversation (RLS enforces access)."""
#     return await communication_service.get_messages_in_conversation(db=db, conversation_id=conversation_id)
