# tests/test_order_service.py
"""
Test 1.1: Normal Checkout with Active Product
FULLY ASYNC VERSION - All greenlet errors fixed
"""

from decimal import Decimal

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.profile import Profile
from app.models.student import Student
from app.schemas.cart_schema import CartItemIn
from app.schemas.enums import OrderStatus
from app.schemas.order_schema import OrderCreateFromCart
from app.services.cart_service import CartService
from app.services.order_service import OrderService


@pytest.mark.asyncio
async def test_normal_checkout_with_active_product(db_session: AsyncSession, parent_profile: Profile, student_22: Student):
    """
    Test 1.1: Baseline - Normal checkout with active product should succeed.

    Setup:
    - Product: House T-Shirt (Blue), product_id=16
    - is_active=true, stock_quantity=100
    - Parent adds 2 items to cart

    Expected Result:
    ✅ Order created successfully
    ✅ Order status = 'pending_payment'
    ✅ Stock decremented from 100 to 98
    ✅ Cart cleared
    """
    # Step 1: Ensure product is active with sufficient stock
    product = await db_session.get(Product, 16)
    product.is_active = True
    product.stock_quantity = 100
    await db_session.commit()
    await db_session.refresh(product)

    # Step 2: Add product to cart using ASYNC service
    cart_service = CartService(db_session)
    cart_item = CartItemIn(product_id=16, quantity=2)
    await db_session.refresh(parent_profile)
    user_id = parent_profile.user_id

    await cart_service.add_item_to_cart(user_id=user_id, item_in=cart_item)

    # Step 3: Verify cart has items
    await db_session.refresh(parent_profile)
    cart = await cart_service.get_hydrated_cart(parent_profile.user_id)
    assert len(cart.items) == 1
    assert cart.items[0].quantity == 2
    print("✓ Cart populated with 2 T-shirts")

    print("Parent Profile User ID:", parent_profile.user_id)
    print("Expected:", "1ef75d00-3349-4274-8bc8-da135015ab5d")

    # Step 4: Checkout using ASYNC service
    checkout_data = OrderCreateFromCart(student_id=22, delivery_notes="Test order - normal checkout")

    order_service = OrderService(db_session)
    order = await order_service.create_order_from_cart(checkout_data=checkout_data, current_profile=parent_profile)

    # Assertions
    assert order is not None
    assert order.status == OrderStatus.PENDING_PAYMENT
    assert order.total_amount == Decimal("1500.00")  # 2 x 750
    assert len(order.items) == 1
    assert order.items[0].quantity == 2
    print("✓ Order created successfully")

    # Step 5: Verify stock decremented
    await db_session.refresh(product)
    assert product.stock_quantity == 98  # 100 - 2
    print("✓ Stock decremented correctly")

    # Step 6: Verify cart cleared
    await db_session.refresh(parent_profile)
    cart = await cart_service.get_hydrated_cart(parent_profile.user_id)
    assert len(cart.items) == 0
    print("✓ Cart cleared after checkout")

    print("\n🎉 Test 1.1 PASSED: Normal checkout works correctly")
