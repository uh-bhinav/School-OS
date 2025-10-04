# backend/app/core/config.py

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Manages application settings and environment variables.
    """

    PROJECT_NAME: str = "SchoolOS API"
    SUPABASE_URL: str
    SUPABASE_KEY: str
    DATABASE_URL: str  # Your PostgreSQL connection string from Supabase

    class Config:
        env_file = ".env"
        # In a team, you might place the .env file in the root directory.
        # This line helps pydantic find it relative to this file's location.
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore extra fields in .env file


settings = Settings()
