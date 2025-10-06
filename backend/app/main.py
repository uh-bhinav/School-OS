# backend/app/main.py
import asyncio
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1.api import api_router as v1_api_router
from app.db.session import init_engine

if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan manager for the FastAPI application.
    This function will be called once when the application starts.
    """
    init_engine()
    yield
    # Any cleanup code would go here, after the yield.


app = FastAPI(title="SchoolOS API", lifespan=lifespan)

app.include_router(v1_api_router, prefix="/v1")


@app.get("/", tags=["Health Check"])
async def root():
    """
    A simple health check endpoint.
    """
    return {"message": "SchoolOS API is running!"}
