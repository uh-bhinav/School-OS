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

# ===========================================================================
# LEVEL 1: Core/Independent Models (no or minimal FK dependencies)
# ===========================================================================

# ===========================================================================
# LEVEL 2: Models depending on Level 1
# ===========================================================================

# ===========================================================================
# LEVEL 3: Models depending on Level 1 & 2
# ===========================================================================

# ===========================================================================
# LEVEL 4: Models depending on Level 3
# ===========================================================================

# ===========================================================================
# LEVEL 5: Models depending on Level 4
# ===========================================================================

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
    "Announcement",
    "AnnouncementTarget",
    "Conversation",
    "ConversationParticipant",
    "Message",
    "Album",
    "MediaItem",
]
