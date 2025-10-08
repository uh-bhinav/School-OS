from unittest.mock import AsyncMock, MagicMock, call, patch
from uuid import uuid4

import pytest
from sqlalchemy.exc import SQLAlchemyError

from app.models.announcement_target import AnnouncementTarget
from app.schemas.announcement_schema import AnnouncementCreate, AnnouncementTargetIn

# Import the necessary service, schemas, and models
from app.services.announcement_service import create_announcement


@pytest.mark.asyncio
async def test_create_announcement_happy_path():
    """
    UNIT TEST (Happy Path): Verifies successful creation
    of an announcement with targets.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()
    mock_db_session.add = MagicMock()

    # The user ID of the admin creating the announcement
    publisher_id = uuid4()

    # Input data for the announcement
    announcement_in = AnnouncementCreate(
        school_id=1,
        title="Annual Sports Day",
        content={"message": "The annual sports day is scheduled for next month."},
        targets=[
            AnnouncementTargetIn(target_type="SCHOOL", target_id=1),
            AnnouncementTargetIn(target_type="GRADE", target_id=10),
        ],
    )

    target_instances = [
        MagicMock(spec=AnnouncementTarget) for _ in announcement_in.targets
    ]

    # 2. Act
    # We patch the ORM models to isolate the service logic
    with (
        patch(
            "app.services.announcement_service.Announcement", autospec=True
        ) as mock_ann_model,
        patch(
            "app.services.announcement_service.AnnouncementTarget",
            autospec=True,
            side_effect=target_instances,
        ) as mock_target_model,
    ):
        mock_ann_instance = mock_ann_model.return_value

        # Call the service function
        result = await create_announcement(
            db=mock_db_session,
            announcement_in=announcement_in,
            published_by_id=publisher_id,
        )

    # 3. Assert
    mock_ann_model.assert_called_once()
    ann_call_kwargs = mock_ann_model.call_args.kwargs
    assert ann_call_kwargs["school_id"] == 1
    assert ann_call_kwargs["title"] == "Annual Sports Day"
    assert ann_call_kwargs["content"] == {
        "message": "The annual sports day is scheduled for next month."
    }
    assert ann_call_kwargs["published_by_id"] == publisher_id
    assert ann_call_kwargs["language"] is None
    assert ann_call_kwargs["targets"] == target_instances

    # Verify that AnnouncementTarget was instantiated for each target in the payload
    assert mock_target_model.call_count == len(announcement_in.targets)
    for call_args, expected in zip(
        mock_target_model.call_args_list, announcement_in.targets
    ):
        assert call_args.kwargs == expected.model_dump()

    # Verify the database transaction was handled correctly
    mock_db_session.add.assert_called_once_with(mock_ann_instance)
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.refresh.assert_has_awaits(
        [
            call(mock_ann_instance),
            call(mock_ann_instance, attribute_names=["targets"]),
        ]
    )

    # Ensure the final, refreshed announcement object is returned
    assert result == mock_ann_instance


@pytest.mark.asyncio
async def test_create_announcement_sad_path_db_error():
    """
    UNIT TEST (Sad Path): Verifies a DB error during
    announcement creation triggers a rollback.
    """
    # 1. Arrange
    mock_db_session = AsyncMock()
    mock_db_session.add = MagicMock()
    # Configure the commit method to raise a database error
    mock_db_session.commit.side_effect = SQLAlchemyError(
        "Simulated DB connection error"
    )

    publisher_id = uuid4()
    announcement_in = AnnouncementCreate(
        school_id=1,
        title="Failed Announcement",
        content={"message": "This should not be saved."},
        targets=[AnnouncementTargetIn(target_type="SCHOOL", target_id=1)],
    )

    # 2. Act & 3. Assert
    # We expect the SQLAlchemyError to be propagated after being caught and rolled back
    with patch("app.services.announcement_service.Announcement", autospec=True), patch(
        "app.services.announcement_service.AnnouncementTarget", autospec=True
    ):
        with pytest.raises(SQLAlchemyError):
            await create_announcement(
                db=mock_db_session,
                announcement_in=announcement_in,
                published_by_id=publisher_id,
            )

    # Verify the database transaction handling
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_awaited_once()

    # Ensure the transaction was rolled back on failure
    mock_db_session.rollback.assert_awaited_once()

    # Refresh should not be called if the commit fails
    mock_db_session.refresh.assert_not_awaited()
