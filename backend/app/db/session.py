# app/db/session.py
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

# Shared context so tests can override
db_context: dict = {}


def init_engine():
    """
    Initialize the SQLAlchemy async engine and sessionmaker.
    Uses Supabase session pooler (5432), works over IPv4.

    CRITICAL CONFIG FOR SUPABASE:
    - pool_size=3: Small pool to avoid hitting Supabase limits
    - max_overflow=2: Allow temporary connections during bursts
    - pool_recycle=300: Recycle connections every 5 minutes (prevents stale connections)
    - pool_pre_ping=True: Verify connections before use
    - pool_timeout=30: Wait max 30s for connection
    """

    engine = create_async_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,  # Reduced from 10 to 3
        max_overflow=5,  # Allow 2 extra connections during bursts (total max: 5)
        pool_recycle=300,  # Recycle connections every 5 minutes
        pool_timeout=30,  # Wait 30s for connection before failing
    )

    SessionLocal = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    # Save so the app can import and use
    db_context["engine"] = engine
    db_context["SessionLocal"] = SessionLocal

    return engine


# FastAPI dependency


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    SessionLocal = db_context.get("SessionLocal")
    if SessionLocal is None:
        raise RuntimeError("Database engine not initialized. Call init_engine() first.")
    async with SessionLocal() as session:
        try:
            yield session
            # If the route completes successfully, commit
            await session.commit()
        except Exception:
            # If an error occurs, rollback
            await session.rollback()
            raise
        finally:
            await session.close()
