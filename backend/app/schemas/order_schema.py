# backend/app/schemas/order_schema.py
"""
Order schema definitions for the SchoolOS e-commerce module.

These schemas define the API contract for order management.
Orders represent permanent, immutable records of e-commerce transactions
created either from the cart checkout flow or manual admin creation.

Architectural Notes:
- Two distinct creation flows: cart checkout (parent) vs manual creation (admin)
- Orders are immutable once created (status updates only, no item modifications)
- Integration with unified payment engine via order_id
- Full audit trail with timestamps and status transitions
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, computed_field, field_validator

from app.schemas.enums import OrderItemStatus, OrderStatus, PaymentStatus

# ============================================================================
# ORDER ITEM SCHEMAS
# ============================================================================


class OrderItemCreate(BaseModel):
    """
    Schema for defining a single item in a manual order creation (Admin only).

    Business Context:
    - Used ONLY for admin manual order creation
    - Parent checkout flow does NOT use this (items come from cart)

    Business Rules:
    - Product must exist and be active
    - Quantity must not exceed available stock
    - Price is captured at time of order (not from this input)

    Used by: POST /api/v1/admin/orders (manual order creation)
    """

    product_id: Optional[int] = Field(None, description="ID of the product (mutually exclusive with package_id)")

    package_id: Optional[int] = Field(None, description="ID of the package (mutually exclusive with product_id)")

    quantity: int = Field(..., ge=1, le=100, description="Quantity to order (1-100)")

    @field_validator("product_id", "package_id")
    @classmethod
    def validate_exclusive_ids(cls, v, info):
        """
        Ensure either product_id OR package_id is provided, not both.

        Business Rule: An order item cannot be both a product and a package.
        """
        values = info.data
        product_id = values.get("product_id")
        package_id = values.get("package_id")

        # Check if we're validating the second field
        if info.field_name == "package_id":
            if product_id and package_id:
                raise ValueError("Cannot specify both product_id and package_id")
            if not product_id and not package_id:
                raise ValueError("Must specify either product_id or package_id")

        return v

    class Config:
        json_schema_extra = {"example": {"product_id": 42, "package_id": None, "quantity": 2}}


class OrderItemOut(BaseModel):
    """
    Complete order item representation with product details.

    This schema represents a historical snapshot of a product/package
    at the time the order was placed.

    Design Decisions:
    - Includes product_name (from JOIN) for display without additional queries
    - price_at_time_of_order is immutable (preserves historical pricing)
    - status allows item-level tracking (pending, fulfilled, shipped, cancelled)

    Used in: OrderOut.items, OrderDetailOut.items
    """

    id: int
    order_id: int

    product_id: Optional[int] = Field(None, description="Product ID (null if this is a package item)")

    package_id: Optional[int] = Field(None, description="Package ID (null if this is a product item)")

    # Hydrated product/package name (from JOIN)
    item_name: str = Field(..., description="Product or package name at time of order")

    item_image_url: Optional[str] = Field(None, description="Product or package image URL")

    item_sku: Optional[str] = Field(None, description="Product SKU (null for packages)")

    quantity: int

    price_at_time_of_order: Decimal = Field(..., description="Price per unit at time of order (immutable historical record)")

    status: Optional[OrderItemStatus] = Field(None, description="Individual item fulfillment status")

    @computed_field
    @property
    def line_total(self) -> Decimal:
        """
        Computed field: Line item total (price × quantity).

        This is the historical total, based on price_at_time_of_order.
        """
        return self.price_at_time_of_order * Decimal(self.quantity)

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 201,
                "order_id": 101,
                "product_id": 42,
                "package_id": None,
                "item_name": "House T-Shirt (Blue)",
                "item_image_url": "https://cdn.schoolos.io/products/tshirt-blue.jpg",
                "item_sku": "UNIFORM-TSHIRT-BLUE-M",
                "quantity": 2,
                "price_at_time_of_order": "750.00",
                "status": "pending",
                "line_total": "1500.00",
            }
        }


# ============================================================================
# INPUT SCHEMAS (Request Bodies)
# ============================================================================


class OrderCreateFromCart(BaseModel):
    """
    Schema for creating an order from cart during checkout (Parent flow).

    Business Context:
    - This is the PRIMARY e-commerce flow
    - Parent clicks "Checkout" → cart contents converted to order
    - Cart is automatically cleared after successful order creation

    Security Notes:
    - parent_user_id auto-populated from JWT
    - Cart ownership validated via RLS
    - Items and pricing pulled from cart + products table (not client input)

    Business Rules:
    - User must have items in cart
    - All cart items must be in stock
    - Student must belong to the authenticated parent

    Used by: POST /api/v1/orders/checkout
    """

    student_id: int = Field(..., description="Student for whom the order is being placed")

    delivery_notes: Optional[str] = Field(None, max_length=500, description="Special delivery instructions or notes")

    class Config:
        json_schema_extra = {"example": {"student_id": 22, "delivery_notes": "Please deliver to admin office"}}


class OrderCreateManual(BaseModel):
    """
    Schema for creating an order manually (Admin flow).

    Business Context:
    - Admin creates order on behalf of parent (phone order, correction, etc.)
    - Bypasses cart system entirely
    - Requires explicit item list with quantities

    Security Notes:
    - Requires Admin role
    - school_id auto-populated from JWT
    - parent_user_id must belong to same school (validated in service)

    Business Rules:
    - Must specify at least 1 item
    - All items must be in stock
    - Student must belong to the specified parent

    Used by: POST /api/v1/admin/orders
    """

    student_id: int = Field(..., description="Student for whom the order is being placed")

    parent_user_id: UUID = Field(..., description="Parent/guardian user ID (must belong to same school)")

    items: list[OrderItemCreate] = Field(..., min_length=1, description="List of products/packages to order (minimum 1 item)")

    delivery_notes: Optional[str] = Field(None, max_length=500, description="Special delivery instructions or notes")

    @field_validator("items")
    @classmethod
    def validate_items(cls, v: list[OrderItemCreate]) -> list[OrderItemCreate]:
        """
        Validate items list.

        Business Rules:
        - Must contain at least 1 item
        - No duplicate product_ids or package_ids
        """
        if len(v) < 1:
            raise ValueError("Order must contain at least 1 item")

        # Check for duplicate product_ids
        product_ids = [item.product_id for item in v if item.product_id is not None]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("Order cannot contain duplicate products")

        # Check for duplicate package_ids
        package_ids = [item.package_id for item in v if item.package_id is not None]
        if len(package_ids) != len(set(package_ids)):
            raise ValueError("Order cannot contain duplicate packages")

        return v

    class Config:
        json_schema_extra = {"example": {"student_id": 22, "parent_user_id": "123e4567-e89b-12d3-a456-426614174000", "items": [{"product_id": 42, "quantity": 2}, {"package_id": 1, "quantity": 1}], "delivery_notes": "Rush order - needed by Friday"}}


class OrderUpdate(BaseModel):
    """
    Schema for updating order status and metadata (Admin only).

    Design Pattern: Partial update (all fields optional)

    Important Constraints:
    - Order items CANNOT be modified after creation (immutable)
    - Only status, delivery info, and admin notes can be updated
    - total_amount is read-only (calculated at creation)

    Business Rules - Status Transitions:
    - pending_payment → processing (after payment captured)
    - processing → shipped (when dispatched)
    - shipped → delivered (when received)
    - Any non-shipped status → cancelled (before dispatch)

    Used by: PATCH /api/v1/admin/orders/{order_id}
    """

    status: Optional[OrderStatus] = Field(None, description="New order status (must follow valid state transitions)")

    delivery_notes: Optional[str] = Field(None, max_length=500)

    tracking_number: Optional[str] = Field(None, max_length=100, description="Shipping tracking number (set when status changes to 'shipped')")

    # admin_notes: Optional[str] = Field(None, max_length=1000, description="Internal notes (not visible to parents)")

    class Config:
        json_schema_extra = {"example": {"status": "shipped", "tracking_number": "TRK123456789", "admin_notes": "Dispatched via BlueDart"}}


class OrderCancel(BaseModel):
    """
    Schema for cancelling an order (Admin or Parent).

    Business Rules:
    - Can only cancel orders with status: pending_payment, processing
    - Cannot cancel orders that are shipped or delivered
    - Cancellation reason is mandatory for audit trail

    Used by: POST /api/v1/orders/{order_id}/cancel
    """

    reason: str = Field(..., min_length=1, max_length=500, description="Reason for cancellation (mandatory)")

    refund_payment: bool = Field(default=False, description="Whether to initiate refund if payment was captured")

    class Config:
        json_schema_extra = {"example": {"reason": "Parent requested cancellation - ordered wrong size", "refund_payment": True}}


# ============================================================================
# OUTPUT SCHEMAS (API Responses)
# ============================================================================


class OrderOut(BaseModel):
    """
    Complete order representation for API responses.

    Used by:
    - GET /api/v1/orders (parent's order history)
    - GET /api/v1/orders/{order_id} (order details)
    - GET /api/v1/admin/orders (admin order management)
    - POST /api/v1/orders/checkout response (after successful order creation)

    Design Decisions:
    - Includes all order items with full details
    - Shows payment status and reconciliation info
    - Computed fields provide quick insights (total_items, can_cancel)
    """

    order_id: int
    order_number: str = Field(..., description="Human-readable order number (e.g., 'ORD-3-20250115-101')")

    student_id: int
    parent_user_id: UUID

    # Hydrated student and parent names (from JOIN)
    student_name: Optional[str] = Field(None, description="Student full name for display")
    parent_name: Optional[str] = Field(None, description="Parent full name for display")

    total_amount: Decimal = Field(..., description="Total order amount (sum of all line_totals, immutable)")

    status: OrderStatus = Field(..., description="Current order status")

    delivery_notes: Optional[str] = None
    tracking_number: Optional[str] = None
    # admin_notes: Optional[str] = None

    # Order items (hydrated with product details)
    items: list[OrderItemOut] = Field(default_factory=list, description="List of order items with product details")

    # Payment information (if payment exists)
    payment_id: Optional[int] = Field(None, description="Associated payment ID (from payments table)")
    payment_status: Optional[PaymentStatus] = Field(None, description="Payment status (pending, captured, failed, etc.)")
    payment_method: Optional[str] = Field(None, description="Payment method used (UPI, Card, NetBanking, etc.)")

    # Timestamps for audit trail
    created_at: datetime = Field(..., description="When the order was created")
    updated_at: datetime = Field(..., description="Last modification timestamp")

    @computed_field
    @property
    def total_items(self) -> int:
        """
        Computed field: Total number of individual items.

        Example: 2 shirts + 3 ties = 5 total items
        """
        return sum(item.quantity for item in self.items)

    @computed_field
    @property
    def unique_product_count(self) -> int:
        """
        Computed field: Number of distinct products/packages.

        Example: 2 shirts + 3 ties = 2 unique items
        """
        return len(self.items)

    @computed_field
    @property
    def is_paid(self) -> bool:
        """
        Computed field: Whether payment has been captured.

        Business Logic:
        - True if payment_status is 'captured'
        - False otherwise (pending, failed, or no payment yet)
        """
        return self.payment_status == PaymentStatus.CAPTURED

    @computed_field
    @property
    def can_cancel(self) -> bool:
        """
        Computed field: Whether this order can be cancelled.

        Business Rules:
        - Can cancel if status is pending_payment or processing
        - Cannot cancel if shipped, delivered, or already cancelled
        """
        cancellable_statuses = [OrderStatus.PENDING_PAYMENT, OrderStatus.PROCESSING]
        return self.status in cancellable_statuses

    @computed_field
    @property
    def can_track(self) -> bool:
        """
        Computed field: Whether tracking information is available.

        Logic: tracking_number exists AND status is shipped or delivered
        """
        trackable_statuses = [OrderStatus.SHIPPED, OrderStatus.DELIVERED]
        return bool(self.tracking_number) and self.status in trackable_statuses

    @computed_field
    @property
    def estimated_delivery_message(self) -> Optional[str]:
        """
        Computed field: User-friendly status message.

        Examples:
        - "Awaiting payment"
        - "Order confirmed, being prepared"
        - "Shipped - Track your order"
        - "Delivered"
        - "Cancelled"
        """
        status_messages = {
            OrderStatus.PENDING_PAYMENT: "Awaiting payment",
            OrderStatus.PROCESSING: "Order confirmed, being prepared for dispatch",
            OrderStatus.SHIPPED: "Shipped - Track your order",
            OrderStatus.DELIVERED: "Delivered successfully",
            OrderStatus.CANCELLED: "Order cancelled",
        }
        return status_messages.get(self.status)

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "order_id": 101,
                "order_number": "ORD-3-20250115-101",
                "student_id": 22,
                "parent_user_id": "123e4567-e89b-12d3-a456-426614174000",
                "student_name": "Aarav Sharma",
                "parent_name": "Mr. Sharma",
                "total_amount": "2050.00",
                "status": "processing",
                "delivery_notes": "Please deliver to admin office",
                "tracking_number": None,
                # "admin_notes": None,
                "items": [{"id": 201, "order_id": 101, "product_id": 42, "item_name": "House T-Shirt (Blue)", "quantity": 2, "price_at_time_of_order": "750.00", "status": "pending", "line_total": "1500.00"}],
                "payment_id": 601,
                "payment_status": "captured",
                "payment_method": "UPI",
                "created_at": "2025-01-15T10:30:00Z",
                "updated_at": "2025-01-15T10:35:00Z",
                "total_items": 3,
                "unique_product_count": 2,
                "is_paid": True,
                "can_cancel": True,
                "can_track": False,
                "estimated_delivery_message": "Order confirmed, being prepared for dispatch",
            }
        }


class OrderListOut(BaseModel):
    """
    Simplified order representation for list endpoints.

    Used by: GET /api/v1/orders (parent order history list)

    Design Rationale:
    - Lighter payload than OrderOut (excludes items list)
    - Shows summary info for "order card" UI component
    - Includes key metrics (total_items, is_paid)
    """

    order_id: int
    order_number: str
    student_name: Optional[str]
    total_amount: Decimal
    status: OrderStatus
    payment_status: Optional[PaymentStatus]
    created_at: datetime

    @computed_field
    @property
    def total_items(self) -> int:
        """
        Total items in order (computed in service layer from items count).

        Note: Populated via subquery in service layer:
        SELECT COUNT(*) FROM order_items WHERE order_id = ...
        """
        return 0  # Placeholder, overridden by service layer

    @computed_field
    @property
    def is_paid(self) -> bool:
        """Whether payment has been captured."""
        return self.payment_status == PaymentStatus.CAPTURED

    class Config:
        from_attributes = True


class OrderCheckoutResponse(BaseModel):
    """
    Response schema for successful checkout operation.

    This is returned after POST /api/v1/orders/checkout succeeds.

    Design Purpose:
    - Confirms order creation
    - Provides order_id and total_amount for payment initiation
    - Frontend uses these values to call payment gateway

    Next Step in Flow:
    Frontend receives this response → Calls payment initiation endpoint:
    POST /api/v1/payments/initiate with order_id=101
    """

    success: bool = Field(default=True)
    message: str = Field(default="Order created successfully. Please proceed to payment.", description="User-friendly success message")

    order_id: int = Field(..., description="ID of the newly created order")
    order_number: str = Field(..., description="Human-readable order number")
    total_amount: Decimal = Field(..., description="Total amount to be paid (for payment gateway)")

    # Full order details (optional, can be used for order confirmation page)
    order: Optional[OrderOut] = Field(None, description="Complete order details (if requested)")

    class Config:
        json_schema_extra = {"example": {"success": True, "message": "Order created successfully. Please proceed to payment.", "order_id": 101, "order_number": "ORD-3-20250115-101", "total_amount": "2050.00"}}


# ============================================================================
# FILTER & PAGINATION SCHEMAS
# ============================================================================


class OrderFilterParams(BaseModel):
    """
    Query parameters for filtering order lists.

    Used by: GET /api/v1/orders?status=processing&student_id=22

    All filters are optional (AND logic when multiple provided).
    """

    status: Optional[OrderStatus] = Field(None, description="Filter by order status")

    payment_status: Optional[PaymentStatus] = Field(None, description="Filter by payment status")

    student_id: Optional[int] = Field(None, description="Filter by student (parent can only see own students)")

    from_date: Optional[datetime] = Field(None, description="Filter orders created after this date")

    to_date: Optional[datetime] = Field(None, description="Filter orders created before this date")

    min_amount: Optional[Decimal] = Field(None, ge=0, description="Minimum order amount filter")

    max_amount: Optional[Decimal] = Field(None, ge=0, description="Maximum order amount filter")


# ============================================================================
# ANALYTICS SCHEMAS (Admin Dashboard)
# ============================================================================


class OrderStatistics(BaseModel):
    """
    Aggregated order statistics for admin dashboard.

    Used by: GET /api/v1/admin/orders/statistics

    Provides high-level metrics for school admin insights.
    """

    total_orders: int = Field(..., description="Total number of orders")

    pending_payment_count: int = Field(..., description="Orders awaiting payment")
    processing_count: int = Field(..., description="Orders being prepared")
    shipped_count: int = Field(..., description="Orders in transit")
    delivered_count: int = Field(..., description="Orders delivered")
    cancelled_count: int = Field(..., description="Orders cancelled")

    total_revenue: Decimal = Field(..., description="Total revenue from paid orders (sum of paid order amounts)")

    pending_revenue: Decimal = Field(..., description="Potential revenue from pending_payment orders")

    average_order_value: Decimal = Field(..., description="Average amount per order (total_revenue / paid_orders)")

    class Config:
        json_schema_extra = {
            "example": {
                "total_orders": 245,
                "pending_payment_count": 12,
                "processing_count": 28,
                "shipped_count": 15,
                "delivered_count": 185,
                "cancelled_count": 5,
                "total_revenue": "487500.00",
                "pending_revenue": "24000.00",
                "average_order_value": "2635.14",
            }
        }
