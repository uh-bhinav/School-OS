import os
from typing import Optional
from urllib.parse import unquote

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

DEFAULT_ENV_FILE = ".env"
ENV_FILE = ".env.test" if os.getenv("PYTEST") == "1" else DEFAULT_ENV_FILE


load_dotenv(ENV_FILE)


class Settings(BaseSettings):
    """
    Manages application settings. Pydantic will now read the variables
    that have been pre-loaded into the environment by load_dotenv().
    Manages application settings. Pydantic will now read the variables
    that have been pre-loaded into the environment by load_dotenv().
    """

    # NOTE: We no longer need the inner 'Config' or 'model_config'
    # because the file is loaded manually.

    # Define all required variables
    # NOTE: We no longer need the inner 'Config' or 'model_config'
    # because the file is loaded manually.

    # Define all required variables
    PROJECT_NAME: str = "SchoolOS API"
    API_V1_STR: str = "/api/v1"
    SUPABASE_URL: str
    SUPABASE_KEY: str
    DATABASE_URL: str  # Your PostgreSQL connection string from Supabase
    GROQ_API_KEY: Optional[str] = None
    MISTRAL_API_KEY: Optional[str] = None
    DEEPSEEK_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        # In a team, you might place the .env file in the root directory.
        # This line helps pydantic find it relative to this file's location.
        env_file_encoding = "utf-8"
        extra = "ignore"

    # Optional variables
    SUPABASE_PROJECT_REF: str | None = None
    TEST_ADMIN_TOKEN: str | None = None
    TEST_TEACHER_TOKEN: str | None = None


# --- The rest of the file remains for database URL corrections ---
settings = Settings()


if "%3D" in settings.DATABASE_URL:
    settings.DATABASE_URL = unquote(settings.DATABASE_URL)

if "options=project=" in settings.DATABASE_URL:
    settings.DATABASE_URL = settings.DATABASE_URL.replace("options=project=", "options=-c project=")

print(">>> .env file loaded and settings configured.")
print(">>> .env file loaded and settings configured.")
