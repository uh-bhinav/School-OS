import os
from urllib.parse import unquote

from pydantic_settings import BaseSettings

# This logic correctly sets the environment file for tests
if os.getenv("PYTEST") == "1":
    ENV_FILE = ".env.test"
else:
    ENV_FILE = ".env"


class Settings(BaseSettings):
    """
    Manages application settings and environment variables.
    """

    PROJECT_NAME: str = "SchoolOS API"
    SUPABASE_URL: str
    SUPABASE_KEY: str
    DATABASE_URL: str
    SUPABASE_PROJECT_REF: str
    TEST_ADMIN_TOKEN: str | None = None

    # --- FIX: These lines now correctly use a colon (:) for type hinting ---
    SECRET_KEY: str
    ALGORITHM: str

    class Config:
        env_file = ENV_FILE


settings = Settings()

# This part of your file is correct and should remain
if "%3D" in settings.DATABASE_URL:
    settings.DATABASE_URL = unquote(settings.DATABASE_URL)

if "options=project=" in settings.DATABASE_URL:
    settings.DATABASE_URL = settings.DATABASE_URL.replace("options=project=", "options=-c project=")

print(">>> FINAL DATABASE_URL:", settings.DATABASE_URL)
print(">>> Loaded from:", settings.Config.env_file)
