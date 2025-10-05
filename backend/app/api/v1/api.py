# backend/app/api/v1/api.py
from fastapi import APIRouter

from app.api.v1.endpoints import (
    academic_years,
    attendance_records,
    classes,
    communication,
    employment_statuses,
    exam_types,
    marks,
    periods,
    profiles,  # Added this import
    schools,
    subjects,
    timetable,
    users,
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
# Include fee management endpoints for handling fee templates
"""api_router.include_router(
    fee_templates.router, prefix="/fee-templates", tags=["Fee Management"]
)
api_router.include_router(
invoices.router,
prefix="/invoices",
tags=["Fee Management"])"""
# Admin-managed lookup tables
api_router.include_router(
    employment_statuses.router,
    prefix="/employment-statuses",
    tags=["Admin: Lookup Tables"],
)
api_router.include_router(
    exam_types.router, prefix="/exam-types", tags=["Admin: Lookup Tables"]
)
"""api_router.include_router(
    product_categories.router,
    prefix="/product-categories",
    tags=["Admin: Lookup Tables"],
)"""
api_router.include_router(
    attendance_records.router, prefix="/attendance", tags=["Attendance"]
)
api_router.include_router(timetable.router, prefix="/timetable", tags=["Timetable"])
api_router.include_router(marks.router, prefix="/marks", tags=["Marks"])
# api_router.include_router(products.router, prefix="/products", tags=["E-commerce"])
"""api_router.include_router(
    product_packages.router, prefix="/product-packages", tags=["E-commerce"]
)
api_router.include_router(orders.router, prefix="/orders", tags=["E-commerce: Orders"])
api_router.include_router(carts.router, prefix="/carts", tags=["E-commerce: Cart"])"""
"""api_router.include_router(
    announcements.router, prefix="/announcements", tags=["Communication: Announcements"]
)"""
api_router.include_router(
    communication.router, prefix="/comms", tags=["Communication: Chat"]
)

# Added the profiles router
api_router.include_router(profiles.router, prefix="/profiles", tags=["Profiles"])

api_router.include_router(users.router, prefix="/users", tags=["Users"])
