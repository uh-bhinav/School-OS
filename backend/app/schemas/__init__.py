# backend/app/schemas/__init__.py

# Import enums first (since models depend on them)
# Academic Year schemas

# Album schemas
from app.schemas.album_schema import *  # noqa: F403

# Album Target schemas
from app.schemas.album_target_schema import *  # noqa: F403

# Announcement schemas
from app.schemas.announcement_schema import *  # noqa: F403

# Applied Discount schemas
from app.schemas.applied_discount_schema import *  # noqa: F403

# Attendance Record schemas
from app.schemas.attendance_record_schema import *  # noqa: F403

# Audit schemas
from app.schemas.audit_schema import *  # noqa: F403

# Cart schemas
from app.schemas.cart_schema import *  # noqa: F403

# Class Fee Structure schemas
from app.schemas.class_fee_structure_schema import *  # noqa: F403

# Class schemas
# Communication schemas
from app.schemas.communication_schema import *  # noqa: F403

# Discount schemas
from app.schemas.discount_schema import *  # noqa: F403

# Employment Status schemas
from app.schemas.employment_status_schema import *  # noqa: F403
from app.schemas.enums import *  # noqa: F403

# Exam schemas
from app.schemas.exam_schema import *  # noqa: F403

# Exam Type schemas
from app.schemas.exam_type_schema import *  # noqa: F403

# Fee Component schemas
from app.schemas.fee_component_schema import *  # noqa: F403

# Fee Template schemas
from app.schemas.fee_template_schema import *  # noqa: F403

# Fee Term schemas
from app.schemas.fee_term_schema import *  # noqa: F403

# Invoice Item schemas
from app.schemas.invoice_item_schema import *  # noqa: F403

# Invoice schemas
from app.schemas.invoice_schema import *  # noqa: F403

# Log schemas
from app.schemas.log_schema import *  # noqa: F403

# Mark schemas
from app.schemas.mark_schema import *  # noqa: F403

# Media Item schemas
from app.schemas.media_item_schema import *  # noqa: F403

# Order schemas
from app.schemas.order_schema import *  # noqa: F403

# Payment Allocation schemas
from app.schemas.payment_allocation_schema import *  # noqa: F403

# Payment Gateway schemas
from app.schemas.payment_gateway_schema import *  # noqa: F403

# Payment schemas
from app.schemas.payment_schema import *  # noqa: F403

# Period schemas
from app.schemas.period_schema import *  # noqa: F403

# Product Album Link schemas
from app.schemas.product_album_link_schema import *  # noqa: F403

# Product Category schemas
from app.schemas.product_category_schema import *  # noqa: F403

# Product Package schemas
from app.schemas.product_package_schema import *  # noqa: F403

# Product schemas
from app.schemas.product_schema import *  # noqa: F403

# Profile schemas
from app.schemas.profile_schema import *  # noqa: F403

# Refund schemas
from app.schemas.refund_schema import *  # noqa: F403

# Report Card schemas - Import LAST to avoid circular dependencies
from app.schemas.report_card_schema import ExamSummary, ReportCard, SubjectMark

# School schemas
from app.schemas.school_schema import *  # noqa: F403

# Stream schemas
from app.schemas.stream_schema import *  # noqa: F403

# Student Contact schemas
from app.schemas.student_contact_schema import *  # noqa: F403

# Student Fee Assignment schemas
from app.schemas.student_fee_assignment_schema import *  # noqa: F403

# Student Fee Discount schemas
from app.schemas.student_fee_discount_schema import *  # noqa: F403

# Student schemas
# Subject schemas
from app.schemas.subject_schema import *  # noqa: F403

# Teacher schemas
from app.schemas.teacher_schema import *  # noqa: F403

# Timetable schemas
from app.schemas.timetable_schema import *  # noqa: F403

# User schemas

# Explicitly export the report card schemas
__all__ = [
    "ReportCard",
    "ExamSummary",
    "SubjectMark",
]
