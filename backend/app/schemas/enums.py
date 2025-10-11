# app/schemas/enums.py

import enum


class DiscountType(str, enum.Enum):
    """Represents the type of a discount."""

    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"


class PaymentStatus(str, enum.Enum):
    """Represents the lifecycle of a payment."""

    PENDING = "pending"
    AUTHORIZED = "authorized"
    CAPTURED = "captured"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    DISPUTED = "disputed"
    EXPIRED = "expired"


class ReconciliationStatus(str, enum.Enum):
    """Represents the settlement status of a payment."""

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
