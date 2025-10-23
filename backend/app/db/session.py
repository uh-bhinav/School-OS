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
    """

    engine = create_async_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
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
