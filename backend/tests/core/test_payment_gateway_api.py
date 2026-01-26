import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy import func, select

from app.core import crypto_service
from app.models.school import School

# Mark all tests in this file as asynchronous
pytestmark = pytest.mark.asyncio


async def test_configure_gateway_credentials_as_parent_fails(
    test_client_authenticated_parent: AsyncClient,  # Use the fixture that mocks authentication
):
    """
    Tests that an authenticated parent receives a 403 Forbidden error
    when trying to configure payment gateway credentials.
    """
    credentials_data = {"razorpay_key_id": "rzp_test_fakekey", "razorpay_key_secret": "fake_secret", "razorpay_webhook_secret": "fake_webhook_secret"}

    # Use the client provided by the fixture
    client = test_client_authenticated_parent

    # No Authorization header is needed because authentication is mocked
    response = await client.post(
        "/api/v1/finance/gateway/configure",
        json=credentials_data,
    )

    # This assertion will now pass
    assert response.status_code == 403, "Parents should not be able to configure the gateway."


async def test_configure_gateway_encrypts_secrets(test_client_authenticated_admin: AsyncClient, db_session, mock_admin_profile):
    """
    Tests that the configure gateway endpoint correctly encrypts the secrets
    before saving them to the database.
    """
    # Arrange: Prepare the plain-text credentials
    plain_text_key_id = f"rzp_test_KeyId_{uuid.uuid4()}"  # Use unique keys for test isolation
    plain_text_key_secret = f"Secret_{uuid.uuid4()}"
    plain_text_webhook_secret = f"WebhookSecret_{uuid.uuid4()}"

    credentials_data = {"razorpay_key_id": plain_text_key_id, "razorpay_key_secret": plain_text_key_secret, "razorpay_webhook_secret": plain_text_webhook_secret}

    client = test_client_authenticated_admin

    # Act: Call the API endpoint to save the credentials
    response = await client.post(
        "/api/v1/finance/gateway/configure",
        json=credentials_data,
    )

    # Assert 1: Verify the API call was successful
    assert response.status_code == 200

    # Assert 2: Fetch the school record directly from the DB and verify encryption
    school = await db_session.get(School, mock_admin_profile.school_id)
    assert school is not None

    # Verify that the stored values are bytes (encrypted), not the original strings
    assert isinstance(school.razorpay_key_id_encrypted, bytes)
    assert isinstance(school.razorpay_key_secret_encrypted, bytes)
    assert isinstance(school.razorpay_webhook_secret_encrypted, bytes)

    # Verify that the stored values are NOT the plain text originals
    assert school.razorpay_key_id_encrypted != plain_text_key_id.encode()
    assert school.razorpay_key_secret_encrypted != plain_text_key_secret.encode()
    assert school.razorpay_webhook_secret_encrypted != plain_text_webhook_secret.encode()

    # Optional but recommended: Decrypt and verify the stored value
    assert crypto_service.decrypt_value(school.razorpay_key_secret_encrypted) == plain_text_key_secret


async def test_configure_gateway_idempotent(test_client_authenticated_admin: AsyncClient, db_session, mock_admin_profile):
    """
    Tests that calling the configure gateway endpoint multiple times updates
    the credentials for the same school, rather than creating duplicates.
    """
    client = test_client_authenticated_admin
    school_id = mock_admin_profile.school_id

    # Arrange 1: Configure the gateway for the first time
    first_credentials = {"razorpay_key_id": f"rzp_test_first_{uuid.uuid4()}", "razorpay_key_secret": f"first_secret_{uuid.uuid4()}", "razorpay_webhook_secret": f"first_webhook_{uuid.uuid4()}"}
    response1 = await client.post("/api/v1/finance/gateway/configure", json=first_credentials)
    assert response1.status_code == 200

    # Act: Configure the gateway again with different credentials
    second_credentials = {"razorpay_key_id": f"rzp_test_second_{uuid.uuid4()}", "razorpay_key_secret": f"second_secret_{uuid.uuid4()}", "razorpay_webhook_secret": f"second_webhook_{uuid.uuid4()}"}
    response2 = await client.post("/api/v1/finance/gateway/configure", json=second_credentials)
    assert response2.status_code == 200

    # Assert 1: Verify that only one school record exists for this school ID
    count_stmt = select(func.count(School.school_id)).where(School.school_id == school_id)
    count_result = await db_session.execute(count_stmt)
    school_count = count_result.scalar_one()
    assert school_count == 1, "Re-configuring should update the existing school, not create a new one."

    # Assert 2: Verify that the stored credentials match the *second* set
    school = await db_session.get(School, school_id)
    assert school is not None
    from app.core import crypto_service  # Import needed for decryption

    assert crypto_service.decrypt_value(school.razorpay_key_id_encrypted) == second_credentials["razorpay_key_id"]
    assert crypto_service.decrypt_value(school.razorpay_key_secret_encrypted) == second_credentials["razorpay_key_secret"]
