from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from sqlalchemy.exc import SQLAlchemyError

from app.models.conversation import Conversation
from app.schemas.communication_schema import ConversationCreate
from app.services.communication_service import create_conversation


@pytest.mark.asyncio
async def test_create_conversation_happy_path():
    """
    UNIT TEST (Happy Path): Verifies successful creation of a
      conversation with participants.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()
    added_objects: list = []

    def add_side_effect(obj):
        added_objects.append(obj)

    mock_db_session.add = MagicMock(side_effect=add_side_effect)
    mock_db_session.flush = AsyncMock()
    mock_db_session.commit = AsyncMock()
    mock_db_session.execute = AsyncMock()

    # The user initiating the conversation (e.g., a parent)
    initiator_id = uuid4()

    # The other participant (e.g., a teacher)
    participant_id = uuid4()

    # Input data for creating the conversation
    conversation_in = ConversationCreate(
        school_id=1,
        title="Question about recent test scores",
        participant_ids=[participant_id],
    )

    async def flush_side_effect():
        # Simulate database assigning a primary key after flush
        if added_objects:
            added_objects[0].conversation_id = 42

    mock_db_session.flush.side_effect = flush_side_effect

    reloaded_conversation = MagicMock(spec=Conversation)
    mock_scalars = MagicMock()
    mock_scalars.first.return_value = reloaded_conversation
    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    mock_db_session.execute.return_value = mock_result

    # 2. Act
    result = await create_conversation(
        db=mock_db_session,
        obj_in=conversation_in,
        creator_user_id=initiator_id,
    )

    # 3. Assert
    assert isinstance(added_objects[0], Conversation)
    assert added_objects[0].school_id == 1
    assert added_objects[0].title == "Question about recent test scores"

    participant_objs = added_objects[1:]
    assert len(participant_objs) == 2
    participant_data = {(p.user_id, p.role) for p in participant_objs}
    assert participant_data == {
        (initiator_id, "Initiator"),
        (participant_id, "Recipient"),
    }

    mock_db_session.flush.assert_awaited_once()
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.execute.assert_awaited_once()

    assert result is reloaded_conversation


@pytest.mark.asyncio
async def test_create_conversation_sad_path_db_error():
    """
    UNIT TEST (Sad Path): Verifies a DB error during conversation
    creation triggers a rollback.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()
    added_objects: list = []

    def add_side_effect(obj):
        added_objects.append(obj)

    mock_db_session.add = MagicMock(side_effect=add_side_effect)
    mock_db_session.flush = AsyncMock()
    mock_db_session.commit = AsyncMock()
    mock_db_session.rollback = AsyncMock()
    mock_db_session.execute = AsyncMock()

    initiator_id = uuid4()
    participant_id = uuid4()
    conversation_in = ConversationCreate(
        school_id=1,
        title="This conversation should fail",
        participant_ids=[participant_id],
    )

    async def flush_side_effect():
        if added_objects:
            added_objects[0].conversation_id = 99

    mock_db_session.flush.side_effect = flush_side_effect
    mock_db_session.commit.side_effect = SQLAlchemyError("Simulated DB connection failure")

    with pytest.raises(SQLAlchemyError):
        await create_conversation(
            db=mock_db_session,
            obj_in=conversation_in,
            creator_user_id=initiator_id,
        )

    # Verify conversation and participants were staged
    assert isinstance(added_objects[0], Conversation)
    participant_objs = added_objects[1:]
    assert len(participant_objs) == 2
    participant_roles = {p.role for p in participant_objs}
    assert participant_roles == {"Initiator", "Recipient"}

    mock_db_session.flush.assert_awaited_once()
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.rollback.assert_awaited_once()
    mock_db_session.execute.assert_not_awaited()
