import os

from cryptography.fernet import Fernet
from fastapi import HTTPException

# --- SECURITY CRITICAL ---
# Load the master encryption key from an environment variable.
# This key MUST NEVER be hardcoded in the source code.
ENCRYPTION_KEY = os.getenv("APP_ENCRYPTION_KEY")

if not ENCRYPTION_KEY:
    raise RuntimeError("APP_ENCRYPTION_KEY environment variable not set. Cannot start application.")

# Initialize the Fernet cipher suite
fernet = Fernet(ENCRYPTION_KEY.encode())


def encrypt_value(plain_text_value: str) -> bytes:
    """Encrypts a string value into secure binary data."""
    if not plain_text_value:
        return None
    return fernet.encrypt(plain_text_value.encode())


def decrypt_value(encrypted_value: bytes) -> str:
    """Decrypts binary data back into a string."""
    if not encrypted_value:
        return None
    try:
        return fernet.decrypt(encrypted_value).decode()
    except Exception:
        # In production, you would log this critical security event.
        # This error means the data may have been tampered with or the key is wrong.
        raise HTTPException(status_code=500, detail="Failed to decrypt a critical value.")
