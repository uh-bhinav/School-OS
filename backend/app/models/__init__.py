# backend/app/models/__init__.py
"""
Central model registry for SQLAlchemy ORM.

This file ensures all models are imported and registered in SQLAlchemy's
class registry BEFORE any test collection or application initialization.
This prevents circular import errors and clsregistry lookup failures.

Import Order Strategy:
1. Base models with no foreign key dependencies
2. Models with simple dependencies
3. Models with complex/circular dependencies
4. Association/junction models last
"""

# ruff: noqa: F401
# Note: All imports in this file are intentional for SQLAlchemy model registration
# and re-exporting. The F401 "unused import" warnings are suppressed.

# Import Base first (required for all models)
from app.db.base_class import Base

# ===========================================================================
# LEVEL 2: Models depending on Level 1 (School, Role, etc.)
# ===========================================================================
from app.models.academic_year import AcademicYear
from app.models.achievementPointRules import AchievementPointRule
from app.models.attendance_record import AttendanceRecord
from app.models.class_model import Class
from app.models.club import Club

# ===========================================================================
# LEVEL 6: Models depending on Level 4/5 (Club Activities, Student records, etc.)
# ===========================================================================
from app.models.club_activity import ClubActivity
from app.models.club_membership import ClubMembership
from app.models.employment_status import EmploymentStatus
from app.models.exam_type import ExamType
from app.models.exams import Exam
from app.models.mark import Mark
from app.models.period import Period
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition

# ===========================================================================
# LEVEL 1: Core/Independent Models (no or minimal FK dependencies)
# ===========================================================================
from app.models.school import School
from app.models.streams import Stream

# ===========================================================================
# LEVEL 4: Models depending on Level 3 (Student, Club, Timetable)
# ===========================================================================
from app.models.student import Student
from app.models.student_achievement import StudentAchievement
from app.models.student_contact import StudentContact
from app.models.subject import Subject

# ===========================================================================
# LEVEL 3: Models depending on Level 2 (Teacher, Class)
# ===========================================================================
from app.models.teacher import Teacher
from app.models.teacher_subject import TeacherSubject

# ===========================================================================
# LEVEL 5: Models with relationships to LEVEL 3/4 (Timetable, AttendanceRecord)
# CRITICAL: Import these AFTER Class, Teacher, Student are fully loaded
# ===========================================================================
from app.models.timetable import Timetable
from app.models.user_roles import UserRole

# ===========================================================================
# E-COMMERCE & FINANCE MODELS (can have circular dependencies)
# ===========================================================================
try:
    from app.models.applied_discount import AppliedDiscount
    from app.models.cart import Cart
    from app.models.cart_item import CartItem
    from app.models.class_fee_structure import ClassFeeStructure
    from app.models.discount import Discount
    from app.models.fee_component import FeeComponent
    from app.models.fee_template import FeeTemplate
    from app.models.fee_template_component import FeeTemplateComponent
    from app.models.fee_term import FeeTerm
    from app.models.gateway_webhook_event import GatewayWebhookEvent
    from app.models.invoice import Invoice
    from app.models.invoice_item import InvoiceItem
    from app.models.order import Order
    from app.models.order_item import OrderItem
    from app.models.payment import Payment
    from app.models.payment_allocation import PaymentAllocation
    from app.models.product import Product
    from app.models.product_album_link import ProductAlbumLink
    from app.models.product_category import ProductCategory
    from app.models.product_package import ProductPackage
    from app.models.refund import Refund
    from app.models.student_fee_assignment import StudentFeeAssignment
    from app.models.student_fee_discount import StudentFeeDiscount
except ImportError:
    pass

# ===========================================================================
# COMMUNICATION & MEDIA MODELS
# ===========================================================================
try:
    from app.models.album import Album
    from app.models.announcement import Announcement
    from app.models.announcement_target import AnnouncementTarget
    from app.models.conversation import Conversation
    from app.models.conversation_participant import ConversationParticipant
    from app.models.media_item import MediaItem
    from app.models.message import Message
except ImportError:
    pass

# ===========================================================================
# ADDITIONAL MODELS
# ===========================================================================
try:
    from app.models.album_target import AlbumTarget
    from app.models.audit import Audit
    from app.models.class_attendance_weekly import ClassAttendanceWeekly
    from app.models.log import Log
except ImportError:
    pass

# ===========================================================================
# Export all models for easy importing
# ===========================================================================
__all__ = [
    "Base",
    # Level 1
    "School",
    "RoleDefinition",
    "ExamType",
    "Exam",
    "EmploymentStatus",
    # Level 2
    "AcademicYear",
    "Profile",
    "Subject",
    "Class",
    "Stream",
    # Level 3
    "Student",
    "Teacher",
    "UserRole",
    # Level 4
    "Club",
    "AchievementPointRule",
    # Level 5
    "TeacherSubject",
    "StudentAchievement",
    "ClubMembership",
    "ClubActivity",
    # Level 6
    "Mark",
    "AttendanceRecord",
    "StudentContact",
    "Timetable",
    "Period",
    # E-commerce & Finance
    "Product",
    "ProductCategory",
    "ProductPackage",
    "Discount",
    "Cart",
    "CartItem",
    "Order",
    "OrderItem",
    "Invoice",
    "InvoiceItem",
    "Payment",
    "Refund",
    "FeeComponent",
    "FeeTemplate",
    "FeeTerm",
    "FeeTemplateComponent",
    "ClassFeeStructure",
    "StudentFeeAssignment",
    "StudentFeeDiscount",
    "AppliedDiscount",
    "GatewayWebhookEvent",
    "PaymentAllocation",
    "ProductAlbumLink",
    # Communication & Media
    "Announcement",
    "AnnouncementTarget",
    "Conversation",
    "ConversationParticipant",
    "Message",
    "Album",
    "MediaItem",
    "AlbumTarget",
    # Additional
    "Audit",
    "Log",
    "ClassAttendanceWeekly",
]
