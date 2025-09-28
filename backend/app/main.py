# app/main.py

from fastapi import FastAPI

app = FastAPI(title="SchoolOS API")


@app.get("/", tags=["Health Check"])
async def root():
    """
    A simple health check endpoint.
    """
    return {"message": "SchoolOS API is running!"}
