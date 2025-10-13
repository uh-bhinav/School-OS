# backend/app/api/v1/endpoints/orders.py
"""
Order API Endpoints.

These endpoints handle order creation, viewing, and management.
The /checkout endpoint is the MOST CRITICAL endpoint in the e-commerce module.

Security:
- All endpoints require authentication
- Parents can only access their own orders
- Admins can access all orders in their school
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user_profile, get_db, require_role
from app.models.profile import Profile
from app.schemas.enums import OrderStatus
from app.schemas.order_schema import (
    OrderCancel,
    OrderCreateFromCart,
    OrderOut,
    OrderStatistics,
    OrderUpdate,
)
from app.schemas.payment_schema import PaymentInitiateRequest
from app.services.order_service import OrderService
from app.services.payment_service import PaymentService

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


# Dependency injector for PaymentService
def get_payment_service(db: Session = Depends(get_db)) -> PaymentService:
    return PaymentService(db)


@router.post(
    "/checkout",
    status_code=status.HTTP_201_CREATED,
)
async def checkout(
    checkout_data: OrderCreateFromCart,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
    payment_service: PaymentService = Depends(get_payment_service),
):
    """
    UNIFIED CHECKOUT: Creates order + initiates payment in single atomic flow.

    This is the PRIMARY e-commerce flow and the most critical endpoint.

    CRITICAL BUSINESS LOGIC:
    - Step 1: Converts cart contents to permanent order
    - Step 2: Immediately initiates payment via unified payment engine
    - Step 3: Returns order + payment details for Razorpay frontend integration

    Flow:
    1. Cart → Order (status: pending_payment)
    2. Order → Payment (status: pending, creates Razorpay order)
    3. Response → Frontend launches Razorpay Checkout UI
    4. Parent completes payment
    5. Frontend calls POST /api/v1/payments/verify
    6. Backend verifies signature → Updates Payment + Order status

    Request Body:
    - student_id: Student for whom order is being placed
    - delivery_notes: Optional delivery instructions

    Returns:
    - Unified response with order details + Razorpay credentials

    Raises:
    - 400: If cart is empty or insufficient stock
    - 403: If student doesn't belong to parent
    - 404: If student not found
    - 503: If payment gateway not configured
    """
    # Step 1: Create order from cart (atomic transaction with stock locking)
    db_order = await OrderService.create_order_from_cart(
        db=db,
        checkout_data=checkout_data,
        current_profile=current_profile,
    )

    # Step 2: Initiate payment via unified payment engine
    payment_request = PaymentInitiateRequest(invoice_id=None, order_id=db_order.order_id)  # Link payment to order

    payment_response = await payment_service.initiate_payment(request_data=payment_request, user_id=str(current_profile.user_id))

    # Step 3: Return unified response (order + payment details)
    return {
        "success": True,
        "message": "Order created successfully. Please complete payment.",
        # Order details
        "order_id": db_order.order_id,
        "order_number": db_order.order_number,
        "total_amount": str(db_order.total_amount),
        "status": db_order.status.value,
        # Payment details (for Razorpay frontend integration)
        "razorpay_order_id": payment_response["razorpay_order_id"],
        "razorpay_key_id": payment_response["razorpay_key_id"],
        "amount": payment_response["amount"],
        "internal_payment_id": payment_response["internal_payment_id"],
        "school_name": payment_response["school_name"],
        "description": payment_response["description"],
    }


@router.get(
    "/",
    response_model=list[OrderOut],
)
async def get_my_orders(
    student_id: Optional[int] = Query(None, description="Filter by student ID"),
    status: Optional[OrderStatus] = Query(None, description="Filter by order status"),
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get all orders for current parent user.

    Query Parameters:
    - student_id: Optional filter by student
    - status: Optional filter by order status

    Returns:
    - List of orders with items and student details
    """
    return await OrderService.get_user_orders(
        db=db,
        user_id=current_profile.user_id,
        student_id=student_id,
        status=status,
    )


@router.get(
    "/{order_id}",
    response_model=OrderOut,
)
async def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get detailed information for a specific order.

    Security:
    - Parents can only view their own orders
    - Order must belong to current user

    Returns:
    - Complete order details with items, student, payment info
    """
    return await OrderService.get_order_by_id(
        db=db,
        order_id=order_id,
        user_id=current_profile.user_id,
        is_admin=False,
    )


@router.post(
    "/{order_id}/cancel",
    response_model=OrderOut,
)
async def cancel_order(
    order_id: int,
    cancel_data: OrderCancel,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Cancel an order (Parent or Admin).

    Business Rules:
    - Can only cancel orders with status: pending_payment, processing
    - Cannot cancel shipped/delivered orders
    - Stock is restored

    Request Body:
    - reason: Mandatory cancellation reason
    - refund_payment: Whether to initiate refund (if payment captured)

    Returns:
    - Cancelled order
    """
    # Fetch order (validates ownership)
    db_order = await OrderService.get_order_by_id(
        db=db,
        order_id=order_id,
        user_id=current_profile.user_id,
        is_admin=False,
    )

    return await OrderService.cancel_order(
        db=db,
        db_order=db_order,
        cancel_data=cancel_data,
        cancelled_by_user_id=current_profile.user_id,
    )


# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================


@router.get(
    "/admin/all",
    response_model=list[OrderOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def admin_get_all_orders(
    student_id: Optional[int] = Query(None),
    status: Optional[OrderStatus] = Query(None),
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get all orders for school (Admin only).

    Query Parameters:
    - student_id: Optional filter by student
    - status: Optional filter by order status

    Returns:
    - List of all orders in school
    """
    # TODO: Implement admin version that filters by school_id
    # For now, return empty list
    return []


@router.get(
    "/admin/{order_id}",
    response_model=OrderOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def admin_get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get order details (Admin only).

    Admins can view any order in their school.
    """
    return await OrderService.get_order_by_id(
        db=db,
        order_id=order_id,
        user_id=current_profile.user_id,
        is_admin=True,
    )


@router.patch(
    "/admin/{order_id}",
    response_model=OrderOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def admin_update_order(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Update order status and metadata (Admin only).

    Valid Status Transitions:
    - pending_payment → processing (after payment)
    - processing → shipped
    - shipped → delivered
    - Any non-shipped → cancelled

    Request Body:
    - status: New order status
    - tracking_number: Shipping tracking number
    - admin_notes: Internal notes
    """
    # Fetch order (admin can access any order in school)
    db_order = await OrderService.get_order_by_id(
        db=db,
        order_id=order_id,
        user_id=current_profile.user_id,
        is_admin=True,
    )

    return await OrderService.update_order(
        db=db,
        db_order=db_order,
        order_update=order_update,
    )


@router.post(
    "/admin/{order_id}/cancel",
    response_model=OrderOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def admin_cancel_order(
    order_id: int,
    cancel_data: OrderCancel,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Cancel an order (Admin).

    Admins can cancel any order in their school.
    """
    # Fetch order
    db_order = await OrderService.get_order_by_id(
        db=db,
        order_id=order_id,
        user_id=current_profile.user_id,
        is_admin=True,
    )

    return await OrderService.cancel_order(
        db=db,
        db_order=db_order,
        cancel_data=cancel_data,
        cancelled_by_user_id=current_profile.user_id,
    )


@router.get(
    "/admin/statistics",
    response_model=OrderStatistics,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_order_statistics(
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get aggregated order statistics for admin dashboard.

    Returns:
    - Total orders
    - Count by status
    - Total revenue
    - Pending revenue
    - Average order value
    """
    stats = await OrderService.get_order_statistics(
        db=db,
        school_id=current_profile.school_id,
    )

    return OrderStatistics(**stats)
