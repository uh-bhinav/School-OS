import os

from cryptography.fernet import Fernet
from fastapi import HTTPException

# --- SECURITY CRITICAL ---
# Lazy initialization of Fernet cipher to allow tests to load without environment variables
_fernet = None


def _get_fernet():
    """
    Lazily initialize and return the Fernet cipher suite.
    This allows the module to be imported during testing without requiring
    the APP_ENCRYPTION_KEY environment variable to be set immediately.
    """
    global _fernet

    if _fernet is None:
        encryption_key = os.getenv("APP_ENCRYPTION_KEY")

        if not encryption_key:
            raise RuntimeError("APP_ENCRYPTION_KEY environment variable not set. " "Cannot perform encryption/decryption operations.")

        _fernet = Fernet(encryption_key.encode())

    return _fernet


def encrypt_value(plain_text_value: str) -> bytes:
    """Encrypts a string value into secure binary data."""
    if not plain_text_value:
        return None

    fernet = _get_fernet()  # Lazy initialization here
    return fernet.encrypt(plain_text_value.encode())


def decrypt_value(encrypted_value: bytes) -> str:
    """Decrypts binary data back into a string."""
    if not encrypted_value:
        return None

    try:
        fernet = _get_fernet()  # Lazy initialization here
        return fernet.decrypt(encrypted_value).decode()
    except Exception:
        # In production, you would log this critical security event.
        # This error means the data may have been tampered with or the key is wrong.
        raise HTTPException(status_code=500, detail="Failed to decrypt a critical value.")
