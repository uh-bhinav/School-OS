# backend/app/api/v1/api.py
from fastapi import APIRouter

from app.api.v1.endpoints import (
    academic_years,
    admin_product_categories,
    admin_product_packages,
    admin_products,
    announcements,
    attendance_records,
    carts,
    classes,
    communication,
    discounts,
    employment_statuses,
    exam_types,
    exams,
    fee_structure,
    fee_templates,
    invoices,
    marks,
    orders,
    periods,
    products,
    profiles,  # Added this import
    schools,
    student_fee_assignments,
    students,
    subjects,
    timetable,
    users,
)

api_router = APIRouter()

# Include all the individual routers into the main v1 router
api_router.include_router(schools.router, prefix="/schools", tags=["Schools"])
api_router.include_router(academic_years.router, prefix="/academic-years", tags=["Academic Years"])
api_router.include_router(classes.router, prefix="/classes", tags=["Classes"])
api_router.include_router(subjects.router, prefix="/subjects", tags=["Subjects"])
api_router.include_router(periods.router, prefix="/periods", tags=["Periods"])
# Include fee management endpoints for handling fee templates
api_router.include_router(fee_templates.router, prefix="/fee-templates", tags=["Fee Management"])
# Admin-managed lookup tables
api_router.include_router(
    employment_statuses.router,
    prefix="/employment-statuses",
    tags=["Admin: Lookup Tables"],
)
api_router.include_router(exam_types.router, prefix="/exam-types", tags=["Admin: Lookup Tables"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(exams.router, prefix="/exams", tags=["Exams"])

api_router.include_router(attendance_records.router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(timetable.router, prefix="/timetable", tags=["Timetable"])
api_router.include_router(marks.router, prefix="/marks", tags=["Marks"])

# Admin Endpoints - Catalog Management
api_router.include_router(admin_product_categories.router, tags=["Admin - Product Categories"])
api_router.include_router(admin_products.router, tags=["Admin - Products"])
api_router.include_router(admin_product_packages.router, tags=["Admin - Product Packages"])

# Parent-Facing Endpoints - Shopping Experience
api_router.include_router(products.router, tags=["Products - Parent Store"])
api_router.include_router(carts.router, tags=["Shopping Cart"])
api_router.include_router(orders.router, tags=["Orders"])
api_router.include_router(announcements.router, prefix="/announcements", tags=["Communication: Announcements"])
api_router.include_router(communication.router, prefix="/comms", tags=["Communication: Chat"])

# Added the profiles router
api_router.include_router(profiles.router, prefix="/profiles", tags=["Profiles"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])

api_router.include_router(fee_structure.router, prefix="/finance", tags=["Finance - Structure"])
api_router.include_router(discounts.router, prefix="/finance", tags=["Finance - Discounts"])
api_router.include_router(invoices.router, prefix="/finance", tags=["Finance - Invoices & Payments"])
api_router.include_router(student_fee_assignments.router, prefix="/finance", tags=["Finance - Overrides"])
