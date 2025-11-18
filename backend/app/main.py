# backend/backend/app/main.py
import asyncio
import logging
import os
import sys
from contextlib import asynccontextmanager

import sentry_sdk
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.agents.api import router as agents_router

# Import your existing v1 API router and the new agents router
from app.api.v1.api import api_router
from app.api.v1.api import api_router as v1_api_router
from app.core.config import settings
from app.core.supabase import close_supabase_client, init_supabase_client

# CRITICAL: Import base BEFORE init_engine to register all SQLAlchemy models
# This ensures all models are registered before any database operations
from app.db import base  # noqa: F401
from app.db.session import init_engine
from app.dependencies import limiter
from app.middleware import RawBodyMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Load .env file from the backend directory
load_dotenv()
logger.info("Environment variables loaded")

SENTRY_DSN = os.getenv("SENTRY_DSN")
APP_ENV = os.getenv("APP_ENV", "development")

if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=APP_ENV,
        integrations=[
            FastApiIntegration(),
            SqlalchemyIntegration(),  # ✅ replaces SqlAlchemyIntegration
        ],
        traces_sample_rate=1.0,  # capture 100% of performance traces (tune in prod)
        profiles_sample_rate=1.0,  # capture 100% of profiling data
    )
    print("✅ Sentry integration initialized.")
else:
    print("⚠️ SENTRY_DSN not found. Sentry integration is disabled.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    CRITICAL: This ensures proper initialization and cleanup of global resources.
    All singleton initialization (database engine, Supabase client) happens here.
    """
    # === STARTUP ===
    print("🚀 Application starting...")

    # Initialize database engine (existing)
    engine = init_engine()
    print("✅ Database engine initialized")

    # Initialize Supabase client (NEW)
    await init_supabase_client()
    print("✅ Supabase client initialized")

    print("✅ Application startup complete")

    yield  # Application runs here

    # === SHUTDOWN ===
    print("🛑 Application shutting down...")

    # Close Supabase client (NEW)
    await close_supabase_client()
    print("✅ Supabase client closed")

    # Any cleanup code would go here, after the yield.
    if engine:
        await engine.dispose()
        print("✅ Database engine disposed")

    print("✅ Application shutdown complete")


# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json", description="SchoolOS - Comprehensive School Management ERP System with AI Agents", version="1.0.0", docs_url="/docs", redoc_url="/redoc", lifespan=lifespan
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

Instrumentator().instrument(app).expose(app)

# ============================================================================
# MIDDLEWARE REGISTRATION (Order Matters!)
# ============================================================================

# Register Raw Body Middleware FIRST (must run before any body-consuming middleware)
# This captures the raw request body for webhook signature verification
app.add_middleware(RawBodyMiddleware)
logger.info("Raw Body Middleware registered (for webhook signature verification)")

# Set up CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)
logger.info("CORS middleware configured")


@app.on_event("startup")
async def startup_event():
    """Actions to perform on application startup."""
    logger.info("=" * 80)
    logger.info(f"Starting {settings.PROJECT_NAME}")
    logger.info(f"API Version: {settings.API_V1_STR}")
    logger.info("Docs available at: /docs")
    logger.info("Agent testing available at: POST /agents/chat/marks")
    logger.info("=" * 80)


@app.on_event("shutdown")
async def shutdown_event():
    """Actions to perform on application shutdown."""
    logger.info("Shutting down SchoolOS API")


if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# app = FastAPI(title="SchoolOS API", lifespan=lifespan)

app.include_router(v1_api_router, prefix="/v1")


@app.get("/", tags=["Health Check"])
async def root():
    """Root endpoint - Health check for the API."""
    return {
        "message": "SchoolOS API is running!",
        "status": "healthy",
        "version": "1.0.0",
        "docs": "/docs",
        "agent_endpoint": "POST /agents/chat/marks",
    }


@app.get("/health", tags=["Health Check"])
async def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "api": "operational",
        "agents": "operational",
        "database": "operational",
    }


# ============================================================================
# Router Registration
# ============================================================================

# Include the main API router for your application (v1 endpoints)
app.include_router(api_router, prefix=settings.API_V1_STR)
logger.info(f"Main API router registered at {settings.API_V1_STR}")

# Include the agents router - it already has prefix="/agents" defined
app.include_router(agents_router)
logger.info("Agents router registered at /agents")


# ============================================================================
# Error Handlers
# ============================================================================


# @app.exception_handler(404)
# async def not_found_handler(request, exc):
#     """Custom 404 handler"""
#     return {
#         "error": "Not Found",
#         "message": f"The endpoint {request.url.path} does not exist",
#         "status_code": 404,
#     }


# @app.exception_handler(500)
# async def internal_error_handler(request, exc):
#     """Custom 500 handler"""
#     logger.error(f"Internal server error: {exc}", exc_info=True)
#     return JSONResponse(
#         status_code=exc.status_code,
#         content={"detail": exc.detail},
#     )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Custom exception handler to ensure all HTTPExceptions return a
    proper JSONResponse, preventing the 'dict is not callable' TypeError.
    """
    # ...and correctly wrap the error detail in a JSONResponse object.
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Handles any unexpected, unhandled exception and returns a generic
    500 Internal Server Error, preventing the application from crashing
    and leaking raw exception objects.
    """
    # Log the full error for debugging
    logger.error(f"Internal server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )


if __name__ == "__main__":
    import uvicorn

    logger.info("Starting development server...")
    logger.info("Access Swagger UI at: http://localhost:8000/docs")
    logger.info("Test agent at: POST http://localhost:8000/agents/chat/marks")

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
