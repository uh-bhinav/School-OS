# backend/app/db/session.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Create an asynchronous engine to connect to the database
engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)

# Create a session factory
AsyncSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)


async def get_db() -> AsyncSession:
    """
    FastAPI dependency that provides a database session for each request.
    """
    async with AsyncSessionLocal() as session:
        yield session
