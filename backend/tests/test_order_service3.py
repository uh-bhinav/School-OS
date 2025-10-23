# tests/test_order_service3.py

import pytest
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order
from app.models.product import Product
from app.models.profile import Profile
from app.models.student import Student
from app.schemas.cart_schema import CartItemIn
from app.schemas.order_schema import OrderCreateFromCart
from app.services.cart_service import CartService
from app.services.order_service import OrderService


@pytest.mark.asyncio
async def test_checkout_fails_if_any_product_deactivated(db_session: AsyncSession, parent_profile: Profile, student_22: Student):
    """
    Test 1.3: Checkout must fail if ANY product in cart is inactive.

    Setup:
    - Product 16 (T-Shirt): is_active=true, stock=100
    - Product 4 (School Tie): is_active=true, stock=50
    - Parent adds BOTH to cart
    - Admin deactivates ONLY Product 4

    Expected Result:
    ❌ Checkout fails
    ❌ Error mentions "School Tie is no longer available"
    ✅ Stock unchanged for BOTH products
    ✅ NO order created
    """
    # Step 1: Setup two products
    product_tshirt = await db_session.get(Product, 16)
    product_tie = await db_session.get(Product, 4)

    # Ensure both are initially active
    product_tshirt.is_active = True
    product_tshirt.stock_quantity = 100
    product_tie.is_active = True
    product_tie.stock_quantity = 50

    # Save the stock values BEFORE committing
    initial_tshirt_stock = product_tshirt.stock_quantity
    initial_tie_stock = product_tie.stock_quantity
    parent_user_id = parent_profile.user_id
    await db_session.commit()

    # Refresh objects after commit to prevent lazy loading issues
    await db_session.refresh(product_tshirt)
    await db_session.refresh(product_tie)

    # Step 2: Add both products to cart
    # If CartService methods are async, use await. If sync, this needs adjustment.

    cart_service = CartService(db_session)
    await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=2))
    await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=4, quantity=1))

    cart = await cart_service.get_hydrated_cart(parent_user_id)
    assert len(cart.items) == 2
    print("✓ Cart has 2 products")

    # Step 3: Admin deactivates ONLY the tie
    # Refresh to get latest state
    await db_session.refresh(product_tie)
    product_tie.is_active = False
    await db_session.commit()
    await db_session.refresh(product_tie)
    print("✓ Admin deactivated School Tie (product 4)")

    # Step 4: Parent attempts checkout
    checkout_data = OrderCreateFromCart(student_id=22, delivery_notes="Mixed cart test")

    # CRITICAL: Checkout MUST fail even though T-shirt is still active
    # Don't use asyncio.run() - we're already in an async context
    with pytest.raises(HTTPException) as exc_info:
        order_service = OrderService(db_session)
        await order_service.create_order_from_cart(checkout_data=checkout_data, current_profile=parent_profile)

    # Verify exception
    assert exc_info.value.status_code == 400
    error_detail = exc_info.value.detail.lower()
    assert "no longer available" in error_detail or "deactivated" in error_detail
    print(f"✓ Checkout failed: {exc_info.value.detail}")

    # Step 5: Verify NO stock changes
    # Step 5: Verify NO stock changes
    # Re-fetch products (can't refresh after rollback in OrderService)
    product_tshirt_check = await db_session.get(Product, 16)
    product_tie_check = await db_session.get(Product, 4)
    assert product_tshirt_check.stock_quantity == initial_tshirt_stock  # Still 100
    assert product_tie_check.stock_quantity == initial_tie_stock  # Still 50
    print("✓ Stock unchanged for BOTH products")

    # Step 6: Verify NO order created
    # Use proper async query syntax
    # Step 6: Verify NO order created
    # Use proper async query syntax (use pre-extracted parent_user_id)
    result = await db_session.execute(select(Order).filter(Order.parent_user_id == parent_user_id))
    orders = result.scalars().all()
    assert len(orders) == 0
    print("✓ No order created")

    print("\n🎉 Test 1.3 PASSED: All-or-nothing validation works correctly")
