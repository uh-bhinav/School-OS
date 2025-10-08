import uuid

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.main import app
from app.models.profile import Profile
from app.models.teacher import Teacher

SCHOOL_ID = 1


# Re-using a simplified helper to ensure user/profile/teacher records exist for the test
async def ensure_user_and_teacher_profile(
    db_session: AsyncSession, profile: Profile
) -> uuid.UUID:
    user_uuid = uuid.UUID(str(profile.user_id))
    email = f"test.comms.{user_uuid}@schoolos.dev"

    # Ensure auth.users entry exists
    await db_session.execute(
        text(
            "INSERT INTO auth.users (id, email) "
            "VALUES (:id, :email) ON CONFLICT (id) DO NOTHING"
        ),
        {"id": user_uuid, "email": email},
    )
    # Ensure profiles entry exists
    await db_session.execute(
        text(
            """
            INSERT INTO profiles (user_id, school_id, first_name, last_name)
            VALUES (:user_id, :school_id, :first_name, :last_name)
            ON CONFLICT (user_id) DO NOTHING
        """
        ),
        {
            "user_id": user_uuid,
            "school_id": SCHOOL_ID,
            "first_name": profile.first_name,
            "last_name": profile.last_name,
        },
    )

    # If it's a teacher profile, ensure the teacher record exists too
    if "Teacher" in profile.roles:
        teacher_res = await db_session.execute(
            text("SELECT 1 FROM teachers WHERE user_id=:id"), {"id": user_uuid}
        )
        if not teacher_res.scalar_one_or_none():
            db_session.add(Teacher(user_id=user_uuid, school_id=SCHOOL_ID))

    await db_session.commit()
    return user_uuid


@pytest.mark.asyncio
async def test_create_conversation_and_send_messages(
    test_client: AsyncClient,
    db_session: AsyncSession,
    mock_teacher_profile: Profile,
    mock_parent_profile: Profile,
):
    """
    Tests creating a conversation between a parent and a teacher,
    and then sending/retrieving messages within it.
    """
    # --- Step 1: Ensure both users exist in the database ---
    teacher_user_id = await ensure_user_and_teacher_profile(
        db_session, mock_teacher_profile
    )
    parent_user_id = await ensure_user_and_teacher_profile(
        db_session, mock_parent_profile
    )

    # --- Step 2: Parent initiates a conversation with the teacher ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_parent_profile

    create_convo_payload = {
        "school_id": SCHOOL_ID,
        "title": "Question about recent test scores",
        "participant_ids": [str(teacher_user_id)],
    }

    response = await test_client.post(
        "/v1/comms/conversations/", json=create_convo_payload
    )

    # --- Step 3: Assert conversation was created ---
    assert response.status_code == status.HTTP_201_CREATED
    convo_data = response.json()
    assert convo_data["title"] == create_convo_payload["title"]
    assert (
        len(convo_data["participants"]) == 2
    )  # Initiator (parent) + recipient (teacher)

    participant_ids = {p["user_id"] for p in convo_data["participants"]}
    assert str(parent_user_id) in participant_ids
    assert str(teacher_user_id) in participant_ids

    conversation_id = convo_data["conversation_id"]

    # --- Step 4: Parent sends the first message ---
    parent_message_payload = {"content": "Hello, I wanted to discuss the results."}
    response = await test_client.post(
        f"/v1/comms/conversations/{conversation_id}/messages/",
        json=parent_message_payload,
    )
    assert response.status_code == status.HTTP_201_CREATED
    parent_msg_data = response.json()
    assert parent_msg_data["sender_id"] == str(parent_user_id)
    assert parent_msg_data["payload"]["content"] == parent_message_payload["content"]

    # --- Step 5: Switch to Teacher and send a reply ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile

    teacher_message_payload = {"content": "Of course. Let's schedule a time to chat."}
    response = await test_client.post(
        f"/v1/comms/conversations/{conversation_id}/messages/",
        json=teacher_message_payload,
    )
    assert response.status_code == status.HTTP_201_CREATED
    teacher_msg_data = response.json()
    assert teacher_msg_data["sender_id"] == str(teacher_user_id)
    assert teacher_msg_data["payload"]["content"] == teacher_message_payload["content"]

    # --- Step 6: Parent retrieves all messages in the conversation ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_parent_profile
    response = await test_client.get(
        f"/v1/comms/conversations/{conversation_id}/messages/"
    )

    assert response.status_code == status.HTTP_200_OK
    messages_data = response.json()
    assert len(messages_data) == 2

    # Verify message content and sender order (most recent first)
    assert messages_data[0]["sender_id"] == str(teacher_user_id)
    assert messages_data[0]["payload"]["content"] == teacher_message_payload["content"]
    assert messages_data[1]["sender_id"] == str(parent_user_id)
    assert messages_data[1]["payload"]["content"] == parent_message_payload["content"]

    app.dependency_overrides.clear()
