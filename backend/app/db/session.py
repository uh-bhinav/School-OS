# # backend/app/db/session.py
# from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
# from sqlalchemy.orm import sessionmaker

# from app.core.config import settings

# # Create an asynchronous engine to connect to the database
# engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)

# # Create a session factory
# AsyncSessionLocal = sessionmaker(
#     autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
# )


# async def get_db() -> AsyncSession:
#     """
#     FastAPI dependency that provides a database session for each request.
#     """
#     async with AsyncSessionLocal() as session:
#         yield session
# backend/app/db/session.py
import os
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# Get the schema from environment variables, defaulting to 'public'
db_schema = os.getenv("DB_SCHEMA", "public")

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)


# Set the search_path after connection is established
@event.listens_for(engine, "connect")
def set_search_path(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute(f"SET search_path TO {db_schema}")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get a database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
