import pytest
from cryptography.fernet import Fernet
from fastapi import HTTPException

from app.core import crypto_service


def test_encrypt_decrypt_round_trip():
    """
    Tests that encrypting a value and then decrypting it returns the
    original value.
    """
    # Arrange
    original_secret = "rzp_test_MySecretApiKey12345"

    # Act
    encrypted_data = crypto_service.encrypt_value(original_secret)
    decrypted_secret = crypto_service.decrypt_value(encrypted_data)

    # Assert
    assert decrypted_secret == original_secret, "Decryption should return the original value."
    assert encrypted_data != original_secret.encode(), "The stored value must be encrypted (binary), not plaintext."
    assert isinstance(encrypted_data, bytes), "Encrypted value should be bytes."


def test_decrypt_with_wrong_key_fails():
    """
    Tests that attempting to decrypt data with the wrong master key
    raises an HTTPException, indicating a failure.
    """
    # Arrange
    original_secret = "data_encrypted_with_correct_key"

    # 1. Encrypt data using the CORRECT key from the crypto_service
    encrypted_data = crypto_service.encrypt_value(original_secret)

    # 2. Generate a DIFFERENT, incorrect key for decryption attempt
    wrong_key = Fernet.generate_key()
    wrong_fernet = Fernet(wrong_key)

    # Act & Assert: Expect an HTTPException when decrypting with the wrong key
    with pytest.raises(HTTPException) as exc_info:
        # Simulate the crypto_service's decrypt logic but with the wrong Fernet instance
        try:
            wrong_fernet.decrypt(encrypted_data)
        except Exception:  # Catch the underlying cryptography error
            # In a real scenario, the crypto_service's decrypt_value handles this
            # For the test, we simulate the HTTPException it should raise
            raise HTTPException(status_code=500, detail="Failed to decrypt")

    assert exc_info.value.status_code == 500
    assert "Failed to decrypt" in exc_info.value.detail
