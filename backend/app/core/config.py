# backend/app/core/config.py

import os
from urllib.parse import unquote

from pydantic_settings import BaseSettings

ENV_FILE = ".env.test"

# If a test env file exists, and we're in pytest, prefer it
if os.getenv("PYTEST") == "1":
    ENV_FILE = ".env.test"


class Settings(BaseSettings):
    """
    Manages application settings and environment variables.
    """

    PROJECT_NAME: str = "SchoolOS API"
    SUPABASE_URL: str
    SUPABASE_KEY: str
    DATABASE_URL: str  # Your PostgreSQL connection string
    SUPABASE_PROJECT_REF: str
    TEST_ADMIN_TOKEN: str | None = None

    class Config:
        env_file = ENV_FILE


settings = Settings()
if "%3D" in settings.DATABASE_URL:
    settings.DATABASE_URL = unquote(settings.DATABASE_URL)

# Also fix case where we need `-c project=...` for psycopg
if "options=project=" in settings.DATABASE_URL:
    settings.DATABASE_URL = settings.DATABASE_URL.replace(
        "options=project=", "options=-c project="
    )

print(">>> FINAL DATABASE_URL:", settings.DATABASE_URL)
print(">>> Loaded from:", settings.DATABASE_URL)
