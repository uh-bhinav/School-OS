# tests/test_order_service6.py
"""
Integration Tests for Order Lifecycle Management in OrderService.

Covers:
- Order Cancellation & Stock Restoration
- Order Status Transitions (State Machine Validation)
"""

from decimal import Decimal

import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order

# Models used for test setup and assertions
from app.models.product import Product
from app.models.profile import Profile
from app.models.student import Student
from app.schemas.cart_schema import CartItemIn
from app.schemas.enums import OrderStatus
from app.schemas.order_schema import OrderCancel, OrderCreateFromCart, OrderUpdate
from app.services.cart_service import CartService

# Core services and schemas to be tested
from app.services.order_service import OrderService


@pytest.mark.asyncio
async def test_cancel_order_success_and_restores_stock(db_session: AsyncSession, parent_profile: Profile, student_22: Student):
    """
    Test 4.1: Successful cancellation of a 'pending_payment' order.

    Expected Result:
    ✅ Order status is updated to 'cancelled'.
    ✅ The stock for the product(s) in the order is correctly restored.
    """
    print("\n--- Test 4.1: Cancel Order & Restore Stock ---")

    # Step 1: Setup product and extract IDs BEFORE commit
    product = await db_session.get(Product, 16)
    initial_stock = 100
    order_quantity = 2
    product.is_active = True
    product.stock_quantity = initial_stock

    # Step 2: Extract IDs BEFORE commit (while objects are fresh)
    await db_session.refresh(parent_profile)
    parent_user_id = parent_profile.user_id
    student_id = student_22.student_id  # ✅ Extract BEFORE commit

    # Now safe to commit
    await db_session.commit()

    # Step 3: Create cart and add item
    cart_service = CartService(db_session)
    await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=order_quantity))

    # Step 4: Create order from cart
    order_service = OrderService(db_session)
    checkout_data = OrderCreateFromCart(student_id=student_id)
    order = await order_service.create_order_from_cart(checkout_data=checkout_data, current_profile=parent_profile)

    # Step 5: Verify initial state after checkout
    await db_session.refresh(product)
    assert order.status == OrderStatus.PENDING_PAYMENT
    assert product.stock_quantity == initial_stock - order_quantity
    print(f"✓ Order created, stock decremented to {product.stock_quantity}")

    # Step 6: Prepare cancellation data
    cancel_data = OrderCancel(reason="Test cancellation - restoring stock", refund_payment=False)

    # Step 7: Cancel the order
    # FIXED: Use order_id, user_id, is_admin instead of db_order
    cancelled_order_dict = await order_service.cancel_order(order_id=order.order_id, user_id=parent_user_id, is_admin=False, cancel_data=cancel_data, cancelled_by_user_id=parent_user_id)

    # Step 8: Verify cancellation - result is now a dict
    await db_session.refresh(product)
    assert cancelled_order_dict["status"] == OrderStatus.CANCELLED
    print(f"✓ Order status successfully updated to '{cancelled_order_dict['status']}'")

    assert product.stock_quantity == initial_stock
    print(f"✓ Stock successfully restored to {product.stock_quantity}")


@pytest.mark.asyncio
async def test_cancel_order_fails_if_shipped(db_session: AsyncSession, parent_profile: Profile, student_22: Student):
    """
    Test 4.2: Attempting to cancel an already shipped order fails.

    Expected Result:
    ❌ HTTPException 400
    """
    print("\n--- Test 4.2: Fail to Cancel a Shipped Order ---")

    # Step 1: Extract parent_user_id BEFORE any commits
    await db_session.refresh(parent_profile)
    parent_user_id = parent_profile.user_id  # ✅ Extract early
    student_id = student_22.student_id  # ✅ Extract early

    # Step 2: Create a shipped order directly
    order = Order(student_id=student_id, parent_user_id=parent_user_id, school_id=parent_profile.school_id, order_number="ORD-TEST-SHIPPED", total_amount=Decimal("100.00"), status=OrderStatus.SHIPPED)
    db_session.add(order)
    await db_session.commit()
    await db_session.refresh(order)
    print(f"✓ Test order created with status '{order.status}'")

    # Step 3: Attempt to cancel
    order_service = OrderService(db_session)
    cancel_data = OrderCancel(reason="Test cancellation attempt", refund_payment=False)

    # Step 4: Should fail
    # FIXED: Use order_id, user_id, is_admin instead of db_order
    with pytest.raises(HTTPException) as exc_info:
        await order_service.cancel_order(order_id=order.order_id, user_id=parent_user_id, is_admin=False, cancel_data=cancel_data, cancelled_by_user_id=parent_user_id)

    assert exc_info.value.status_code == 400
    assert "cannot cancel" in exc_info.value.detail.lower()
    print(f"✓ Correctly failed with HTTP 400: {exc_info.value.detail}")


@pytest.mark.asyncio
async def test_update_order_status_fails_invalid_transition(db_session: AsyncSession, mock_admin_profile: Profile, parent_profile: Profile):
    """
    Test 4.3: Validate the state machine by attempting an invalid status transition.

    Expected Result:
    ❌ HTTPException 400 for moving from 'delivered' back to 'processing'.
    """
    print("\n--- Test 4.3: Fail on Invalid Status Transition ---")

    # Step 1: Create a delivered order
    order = Order(student_id=22, parent_user_id=parent_profile.user_id, school_id=mock_admin_profile.school_id, order_number="ORD-TEST-DELIVERED", total_amount=Decimal("100.00"), status=OrderStatus.DELIVERED)
    db_session.add(order)
    await db_session.commit()
    await db_session.refresh(order)
    print(f"✓ Test order created with status '{order.status}'")

    # Step 2: Attempt invalid transition
    order_service = OrderService(db_session)
    update_data = OrderUpdate(status=OrderStatus.PROCESSING)

    # Step 3: Should fail
    # FIXED: Use order_id, user_id, is_admin instead of db_order
    with pytest.raises(HTTPException) as exc_info:
        await order_service.update_order(order_id=order.order_id, user_id=mock_admin_profile.user_id, is_admin=True, order_update=update_data)

    assert exc_info.value.status_code == 400
    assert "invalid status transition" in exc_info.value.detail.lower()
    print(f"✓ Correctly failed with HTTP 400: {exc_info.value.detail}")

    print("\n🎉 All order lifecycle tests passed!")
