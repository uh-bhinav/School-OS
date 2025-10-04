# backend/tests/conftest.py
from typing import Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.api import deps
from app.api.v1.endpoints import exam_types, exams
from app.db.session import SessionLocal, engine

# Import all models to ensure relationships are properly configured
# Import all models to ensure relationships are properly configured
# Import them all at once to avoid circular dependency issues


def override_get_db() -> Generator[Session, None, None]:
    """
    Dependency override for tests.
    Creates a new database session within a transaction
    that is rolled back after the test.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = SessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture(scope="module")
def app() -> FastAPI:
    """
    Create a minimal test app with exam_types and exams routers
    """
    test_app = FastAPI()
    test_app.include_router(exam_types.router, prefix="/api/v1/exam-types")
    test_app.include_router(exams.router, prefix="/api/v1/exams")
    test_app.dependency_overrides[deps.get_db] = override_get_db
    return test_app


@pytest.fixture(scope="module")
def client(app: FastAPI) -> Generator[TestClient, None, None]:
    """
    Pytest fixture that provides a synchronous TestClient for making API requests.
    """
    with TestClient(app) as c:
        yield c
