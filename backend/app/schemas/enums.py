# app/schemas/enums.py
"""
Shared enumerations for the SchoolOS platform.
These enums ensure type safety, eliminate string-based bugs, and create
a self-documenting API contract across all modules.

Used by: Financial Module, E-commerce Module, and future extensions.
"""

import enum

# ============================================================================
# FINANCIAL MODULE ENUMS
# ============================================================================


class DiscountType(str, enum.Enum):
    """Represents the type of a discount."""

    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"


class PaymentStatus(str, enum.Enum):
    """
    Represents the lifecycle of a payment.
    Used by both fee payments and e-commerce orders.

    NOTE: This enum mirrors the payment_status PostgreSQL enum type
    defined in the database schema.
    """

    PENDING = "pending"
    AUTHORIZED = "authorized"
    CAPTURED = "captured"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    DISPUTED = "disputed"
    EXPIRED = "expired"
    CAPTURED_ALLOCATION_FAILED = "captured_allocation_failed"


class ReconciliationStatus(str, enum.Enum):
    """
    Represents the settlement status of a payment.

    NOTE: This enum mirrors the reconciliation_status PostgreSQL enum type.
    """

    PENDING = "pending"
    RECONCILED = "reconciled"
    DISCREPANCY = "discrepancy"
    UNDER_REVIEW = "under_review"
    SETTLED = "settled"


class RefundStatus(str, enum.Enum):
    """Represents the status of a refund attempt."""

    PENDING = "pending"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AllocationStatus(str, enum.Enum):
    """Represents the status of a payment allocation to an invoice item."""

    PENDING = "pending"
    ALLOCATED = "allocated"
    REVERSED = "reversed"
    ADJUSTED = "adjusted"


class InvoicePaymentStatus(str, enum.Enum):
    """
    Valid payment statuses for fee invoices.
    """

    UNPAID = "unpaid"
    PARTIALLY_PAID = "partially_paid"
    PAID = "paid"
    OVERDUE = "overdue"


# ============================================================================
# E-COMMERCE MODULE ENUMS
# ============================================================================


class OrderStatus(str, enum.Enum):
    """
    Valid statuses for an e-commerce order throughout its lifecycle.

    State Machine Flow:
    PENDING_PAYMENT → PROCESSING → SHIPPED → DELIVERED
                   ↓
                CANCELLED (terminal state, can occur at any point before SHIPPED)

    Business Rules:
    - Orders start in PENDING_PAYMENT when created from cart
    - Transition to PROCESSING after payment is captured
    - Can be CANCELLED before SHIPPED
    - DELIVERED and CANCELLED are terminal states
    """

    PENDING_PAYMENT = "pending_payment"  # Order created, awaiting payment verification
    PROCESSING = "processing"  # Payment captured, order being prepared
    SHIPPED = "shipped"  # Order dispatched to customer
    DELIVERED = "delivered"  # Order received by customer (terminal state)
    CANCELLED = "cancelled"  # Order cancelled (terminal state)


class OrderItemStatus(str, enum.Enum):
    """
    Individual order item statuses for granular fulfillment tracking.
    Allows partial order fulfillment (e.g., "2 of 3 items shipped").

    Business Use Case:
    - Track each item independently in a multi-item order
    - Support partial fulfillment scenarios
    - Enable item-level cancellations (e.g., out of stock)
    """

    PENDING = "pending"  # Item awaiting fulfillment
    FULFILLED = "fulfilled"  # Item picked and packed
    SHIPPED = "shipped"  # Item dispatched
    CANCELLED = "cancelled"  # Item cancelled (e.g., out of stock)


class ProductAvailability(str, enum.Enum):
    """
    Product availability states for inventory management.

    Computed Status Logic (in service layer):
    - IN_STOCK: stock_quantity > reorder_level AND is_active = True
    - LOW_STOCK: 0 < stock_quantity <= reorder_level AND is_active = True
    - OUT_OF_STOCK: stock_quantity = 0 AND is_active = True
    - DISCONTINUED: is_active = False
    """

    IN_STOCK = "in_stock"  # Available for purchase
    LOW_STOCK = "low_stock"  # Below reorder level
    OUT_OF_STOCK = "out_of_stock"  # Stock quantity = 0
    DISCONTINUED = "discontinued"  # Product no longer sold (is_active = False)
