# backend/app/api/v1/api.py
from fastapi import APIRouter

from app.api.v1.endpoints import (
    academic_years,
    classes,
    employment_statuses,
    exam_types,
    periods,
    product_categories,
    schools,
    subjects,
)

api_router = APIRouter()

# Include all the individual routers into the main v1 router
api_router.include_router(schools.router, prefix="/schools", tags=["Schools"])
api_router.include_router(
    academic_years.router, prefix="/academic-years", tags=["Academic Years"]
)
api_router.include_router(classes.router, prefix="/classes", tags=["Classes"])
api_router.include_router(subjects.router, prefix="/subjects", tags=["Subjects"])
api_router.include_router(periods.router, prefix="/periods", tags=["Periods"])

# Admin-managed lookup tables
api_router.include_router(
    employment_statuses.router,
    prefix="/employment-statuses",
    tags=["Admin: Lookup Tables"],
)
api_router.include_router(
    exam_types.router, prefix="/exam-types", tags=["Admin: Lookup Tables"]
)
api_router.include_router(
    product_categories.router,
    prefix="/product-categories",
    tags=["Admin: Lookup Tables"],
)
