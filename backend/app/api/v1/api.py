# backend/app/api/v1/api.py
from fastapi import APIRouter

from app.api.v1.endpoints import (
    academic_years,
    achievements,
    admin_product_categories,
    admin_product_packages,
    admin_products,
    albums,
    announcements,
    attendance_records,
    carts,
    classes,
    clubs,
    communication,
    discounts,
    employment_statuses,
    exam_types,
    exams,
    fee_structure,
    fee_templates,
    invoices,
    leaderboards,
    marks,
    media,
    orders,
    payment_gateway,
    payments,
    periods,
    products,
    profiles,  # Added this import
    refunds,
    report_cards,  # <-- 1. ADDED THIS LINE
    schools,
    student_contacts,
    student_fee_assignments,
    students,
    subjects,
    teachers,
    timetable,
    users,
    webhooks,
)

api_router = APIRouter()

# Include all the individual routers into the main v1 router
api_router.include_router(schools.router, prefix="/schools", tags=["Schools"])
api_router.include_router(academic_years.router, prefix="/academic-years", tags=["Academic Years"])
api_router.include_router(classes.router, prefix="/classes", tags=["Classes"])
api_router.include_router(subjects.router, prefix="/subjects", tags=["Subjects"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(student_contacts.router, prefix="/student-contacts", tags=["Students"])

# Academics
api_router.include_router(exams.router, prefix="/exams", tags=["Exams"])
api_router.include_router(exam_types.router, prefix="/exam-types", tags=["Exams"])
api_router.include_router(marks.router, prefix="/marks", tags=["Marks"])
api_router.include_router(report_cards.router, prefix="/report-card", tags=["Report Cards"])  # <-- 2. ADDED THIS LINE
api_router.include_router(attendance_records.router, prefix="/attendance", tags=["Attendance"])

# E-commerce
api_router.include_router(products.router, prefix="/products", tags=["E-Commerce: Products"])
api_router.include_router(admin_products.router, prefix="/admin/products", tags=["Admin: Products"])
api_router.include_router(admin_product_categories.router, prefix="/admin/product-categories", tags=["Admin: Product Categories"])
api_router.include_router(admin_product_packages.router, prefix="/admin/product-packages", tags=["Admin: Product Packages"])
api_router.include_router(carts.router, prefix="/cart", tags=["E-Commerce: Cart"])
api_router.include_router(orders.router, prefix="/orders", tags=["E-Commerce: Orders"])

# Staff
api_router.include_router(employment_statuses.router, prefix="/employment-statuses", tags=["Staff"])

# Communication
api_router.include_router(announcements.router, prefix="/announcements", tags=["Communication: Announcements"])
api_router.include_router(communication.router, prefix="/comms", tags=["Communication: Chat"])

# Added the profiles router
api_router.include_router(profiles.router, prefix="/profiles", tags=["Profiles"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])

api_router.include_router(fee_structure.router, prefix="/finance", tags=["Finance - Structure"])
api_router.include_router(fee_templates.router, prefix="/finance/templates", tags=["Finance - Templates"])
api_router.include_router(discounts.router, prefix="/finance", tags=["Finance - Discounts"])
api_router.include_router(invoices.router, prefix="/finance", tags=["Finance - Invoices & Payments"])
api_router.include_router(student_fee_assignments.router, prefix="/finance", tags=["Finance - Overrides"])
api_router.include_router(refunds.router, prefix="/finance/refunds", tags=["Finance - Refunds"])
api_router.include_router(payment_gateway.router, prefix="/finance/gateway", tags=["Finance - Gateway Configuration"])
api_router.include_router(payments.router, prefix="/finance/payments", tags=["Finance - Payments"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])

api_router.include_router(albums.router, prefix="/albums", tags=["albums"])
api_router.include_router(media.router, prefix="/media", tags=["media"])
api_router.include_router(teachers.router, prefix="/teachers", tags=["teachers"])
api_router.include_router(timetable.router, prefix="/timetable", tags=["timetable"])
api_router.include_router(periods.router, prefix="/periods", tags=["periods"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["Achievements"])
api_router.include_router(leaderboards.router, prefix="/leaderboard", tags=["Leaderboards"])
api_router.include_router(clubs.router, prefix="/clubs", tags=["Clubs"])
