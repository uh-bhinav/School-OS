from urllib.parse import unquote

from dotenv import load_dotenv  # <-- 1. Import the dotenv library
from pydantic_settings import BaseSettings

# --- THIS IS THE CRITICAL FIX ---
# 2. Explicitly find and load the .env file into the environment.
# This ensures that when Pydantic runs, the variables are already available.
load_dotenv()


class Settings(BaseSettings):
    """
    Manages application settings. Pydantic will now read the variables
    that have been pre-loaded into the environment by load_dotenv().
    """

    # NOTE: We no longer need the inner 'Config' or 'model_config'
    # because the file is loaded manually.

    # Define all required variables
    PROJECT_NAME: str = "SchoolOS API"
    SUPABASE_URL: str
    SUPABASE_KEY: str
    DATABASE_URL: str

    # Optional variables
    SUPABASE_PROJECT_REF: str | None = None
    TEST_ADMIN_TOKEN: str | None = None


# --- The rest of the file remains for database URL corrections ---
settings = Settings()

if "%3D" in settings.DATABASE_URL:
    settings.DATABASE_URL = unquote(settings.DATABASE_URL)

if "options=project=" in settings.DATABASE_URL:
    settings.DATABASE_URL = settings.DATABASE_URL.replace("options=project=", "options=-c project=")

print(">>> .env file loaded and settings configured.")
