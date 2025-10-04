# app/main.py

from fastapi import FastAPI

from app.api.v1.api import api_router

app = FastAPI(title="SchoolOS API")

# Include the API v1 router
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["Health Check"])
async def root():
    """
    A simple health check endpoint.
    """
    return {"message": "SchoolOS API is running!"}
