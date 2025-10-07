# backend/app/core/config.py

from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Manages application settings and environment variables.
    """

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


settings = Settings()
