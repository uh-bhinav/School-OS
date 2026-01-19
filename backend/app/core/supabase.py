"""
Supabase Client Singleton
=========================
CRITICAL: This module provides a single, reusable Supabase client instance
to prevent connection pool exhaustion.

The client is initialized once at application startup and closed on shutdown.
All FastAPI dependencies should use get_supabase_client() to retrieve the singleton.
"""

from app.core.config import settings
from supabase import Client, create_async_client

# Global singleton client (initialized at startup)
_supabase_client: Client | None = None


async def init_supabase_client() -> Client:
    """
    Initialize the global Supabase client at application startup.

    CRITICAL: This must be called exactly once during FastAPI lifespan startup.

    Returns:
        Client: The initialized Supabase client

    Raises:
        RuntimeError: If client is already initialized (should never happen)
    """
    global _supabase_client

    if _supabase_client is not None:
        raise RuntimeError("Supabase client already initialized. " "init_supabase_client() should only be called once at startup.")

    _supabase_client = await create_async_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

    print("✅ Supabase client initialized (singleton)")
    return _supabase_client


async def close_supabase_client() -> None:
    """
    Close the global Supabase client on application shutdown.

    CRITICAL: This must be called exactly once during FastAPI lifespan shutdown.

    This properly closes all connection pools and prevents resource leaks.
    """
    global _supabase_client

    if _supabase_client is not None:
        await _supabase_client.close()
        _supabase_client = None
        print("✅ Supabase client closed")


def get_supabase_client() -> Client:
    """
    FastAPI dependency to get the singleton Supabase client.

    CRITICAL: This function is NOT async because it simply returns the
    already-initialized singleton. Making it async would cause FastAPI
    to treat it as a dependency that needs to be awaited.

    Returns:
        Client: The singleton Supabase client

    Raises:
        RuntimeError: If client is not initialized (startup not completed)

    Usage:
        async def my_endpoint(
            supabase: Client = Depends(get_supabase_client)
        ):
            # Use supabase client
            pass
    """
    if _supabase_client is None:
        raise RuntimeError("Supabase client not initialized. " "Ensure init_supabase_client() is called during app startup.")

    return _supabase_client
