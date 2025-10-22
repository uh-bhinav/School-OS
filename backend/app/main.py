# backend/backend/app/main.py
import logging

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.agents.api import router as agents_router

# Import your existing v1 API router and the new agents router
from app.api.v1.api import api_router
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Load .env file from the backend directory
load_dotenv()
logger.info("Environment variables loaded")

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="SchoolOS - Comprehensive School Management ERP System with AI Agents",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set up CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler"""
    detail = getattr(exc, "detail", f"The endpoint {request.url.path} does not exist")

    return JSONResponse(status_code=404, content={"detail": detail})


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Custom 500 handler"""
    logger.error(f"Internal server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. Please try again later.",
            "status_code": 500,
        },
    )


if __name__ == "__main__":
    import uvicorn

    logger.info("Starting development server...")
    logger.info("Access Swagger UI at: http://localhost:8000/docs")
    logger.info("Test agent at: POST http://localhost:8000/agents/chat/marks")

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
