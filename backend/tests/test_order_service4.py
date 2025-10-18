# tests/test_order_service4.py
"""
Test 2.1: Insufficient Stock Validation
ASYNC VERSION - FIXED
"""

import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.profile import Profile
from app.models.student import Student
from app.schemas.cart_schema import CartItemIn
from app.schemas.order_schema import OrderCreateFromCart
from app.services.cart_service import CartService
from app.services.order_service import OrderService


@pytest.mark.asyncio
async def test_checkout_fails_when_insufficient_stock(db_session: AsyncSession, parent_profile: Profile, student_22: Student):
    """
    Test 2.1: Checkout must fail if stock is insufficient.

    Setup:
    - Product 16: is_active=true, stock_quantity=5
    - Parent tries to order 10 items (but we add 5 to cart, then reduce stock)

    Expected Result:
    ❌ HTTPException 400
    ❌ Error: "Insufficient stock..."
    ✅ Stock unchanged
    """
    # Step 1: Set low stock and extract user_id BEFORE any commits
    product = await db_session.get(Product, 16)
    product.is_active = True
    product.stock_quantity = 5  # Low stock

    # Extract parent_user_id BEFORE commit to prevent lazy loading issues
    parent_user_id = parent_profile.user_id

    await db_session.commit()

    # Refresh product after commit
    await db_session.refresh(product)

    # Step 2: Add items to cart (5 items when stock is 5)
    cart_service = CartService(db_session)
    cart_item = CartItemIn(product_id=16, quantity=5)
    await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=cart_item)

    # Now reduce stock AFTER adding to cart (simulates race condition)
    # Re-fetch product to ensure we have latest state
    await db_session.refresh(product)
    product.stock_quantity = 3  # Reduce to 3, but cart has 5
    await db_session.commit()

    # Refresh to get the updated stock value
    await db_session.refresh(product)

    # Step 3: Attempt checkout
    checkout_data = OrderCreateFromCart(student_id=22, delivery_notes="Over-order test")

    # Create OrderService instance and attempt checkout
    with pytest.raises(HTTPException) as exc_info:
        order_service = OrderService(db_session)
        await order_service.create_order_from_cart(checkout_data=checkout_data, current_profile=parent_profile)

    # Verify error details
    assert exc_info.value.status_code == 400
    error_msg = exc_info.value.detail.lower()
    assert "insufficient stock" in error_msg
    # Check that the error mentions the product and quantities
    assert "5" in exc_info.value.detail  # Requested quantity
    assert "3" in exc_info.value.detail  # Available quantity
    print(f"✓ Error message correct: {exc_info.value.detail}")

    # Verify stock unchanged (re-fetch after failed checkout)
    product_check = await db_session.get(Product, 16)
    assert product_check.stock_quantity == 3
    print("✓ Stock unchanged")

    print("\n✅ Test 2.1 PASSED: Stock validation working")
