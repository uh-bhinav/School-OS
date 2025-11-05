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

# Import Base first (required for all models)
from app.db.base_class import Base

# ============================================================================
# LEVEL 2: Models depending on Level 1
# ============================================================================
from app.models.academic_year import AcademicYear
from app.models.achievementPointRules import AchievementPointRule
from app.models.attendance_record import AttendanceRecord
from app.models.class_model import Class

# ============================================================================
# LEVEL 4: Complex relationship models (clubs, achievements, etc.)
# ============================================================================
from app.models.club import Club
from app.models.club_activity import ClubActivity
from app.models.club_membership import ClubMembership
from app.models.employment_status import EmploymentStatus
from app.models.exam_type import ExamType

# ============================================================================
# LEVEL 6: Other dependent models (marks, attendance, fees, etc.)
# ============================================================================
from app.models.mark import Mark
from app.models.period import Period
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition

# ============================================================================
# LEVEL 1: Core/Independent Models (no or minimal FK dependencies)
# ============================================================================
from app.models.school import School
from app.models.streams import Stream

# ============================================================================
# LEVEL 3: Models with dependencies on Level 1 & 2
# ============================================================================
from app.models.student import Student
from app.models.student_achievement import StudentAchievement
from app.models.student_contact import StudentContact
from app.models.subject import Subject
from app.models.teacher import Teacher

# ============================================================================
# LEVEL 5: Association/Junction/Detail models
# ============================================================================
from app.models.teacher_subject import TeacherSubject
from app.models.timetable import Timetable
from app.models.user_roles import UserRole

# ============================================================================
# LEVEL 7: E-commerce/Payment models
# ============================================================================
try:
    from app.models.cart import Cart
    from app.models.cart_item import CartItem
    from app.models.discount import Discount
    from app.models.invoice import Invoice
    from app.models.invoice_item import InvoiceItem
    from app.models.order import Order
    from app.models.order_item import OrderItem
    from app.models.payment import Payment
    from app.models.product import Product
    from app.models.product_category import ProductCategory
    from app.models.product_package import ProductPackage
except ImportError:
    pass  # Some models may not exist yet

# ============================================================================
# LEVEL 8: Fee-related models
# ============================================================================
try:
    from app.models.fee_component import FeeComponent
    from app.models.fee_template import FeeTemplate
    from app.models.fee_term import FeeTerm
    from app.models.student_fee_assignment import StudentFeeAssignment
    from app.models.student_fee_discount import StudentFeeDiscount
except ImportError:
    pass

# ============================================================================
# LEVEL 9: Communication/Media models
# ============================================================================
try:
    from app.models.album import Album
    from app.models.announcement import Announcement
    from app.models.communication import Communication
    from app.models.conversation import Conversation
    from app.models.conversation_participant import ConversationParticipant
    from app.models.media_item import MediaItem
    from app.models.message import Message
except ImportError:
    pass

# ============================================================================
# Export all models for easy importing
# ============================================================================
__all__ = [
    "Base",
    # Level 1
    "School",
    "RoleDefinition",
    "ExamType",
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
    # Optional (if they exist)
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
    "FeeComponent",
    "FeeTemplate",
    "FeeTerm",
    "StudentFeeAssignment",
    "StudentFeeDiscount",
    "Announcement",
    "Communication",
    "Conversation",
    "ConversationParticipant",
    "Message",
    "Album",
    "MediaItem",
]
