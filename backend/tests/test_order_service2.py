# tests/test_order_service2.py
"""
Test 1.2: Product Deactivated During Checkout (CRITICAL FIX VERIFICATION)
SYNC VERSION
"""


import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession  # Change Session to AsyncSession
from sqlalchemy.future import select

from app.models.order import Order
from app.models.product import Product
from app.models.profile import Profile
from app.models.student import Student
from app.schemas.cart_schema import CartItemIn
from app.schemas.order_schema import OrderCreateFromCart
from app.services.cart_service import CartService
from app.services.order_service import OrderService


@pytest.mark.asyncio
async def test_checkout_fails_when_product_deactivated(db_session: AsyncSession, parent_profile: Profile, student_22: Student):
    """
    Test 1.2: CRITICAL - Checkout must fail if product deactivated after cart addition.

    Timeline:
    10:00 AM: Parent adds T-shirt to cart (is_active=true, stock=100)
    10:05 AM: Admin deactivates T-shirt (is_active=false)
    10:10 AM: Parent attempts checkout

    Expected Result (AFTER FIX):
    ❌ HTTPException 400
    ❌ Error message: "T-shirt is no longer available for purchase"
    ✅ Stock unchanged (still 100)
    ✅ Cart NOT cleared
    ✅ NO order created
    """
    # Step 1: Verify product is initially active
    product = await db_session.get(Product, 16)
    product.is_active = True
    product.stock_quantity = 100
    await db_session.commit()
    await db_session.refresh(product)

    assert product.is_active is True
    assert product.stock_quantity == 100
    initial_stock = product.stock_quantity

    # Step 2: Parent adds product to cart (10:00 AM simulation)
    # Step 2: Parent adds product to cart (10:00 AM simulation)
    cart_item = CartItemIn(product_id=16, quantity=2)

    await db_session.refresh(parent_profile)
    parent_user_id = parent_profile.user_id

    # Record existing orders for this parent so we can assert no new ones are created.
    baseline_stmt = select(Order.order_id).where(Order.parent_user_id == parent_user_id)
    baseline_result = await db_session.execute(baseline_stmt)
    baseline_order_ids = set(baseline_result.scalars().all())

    # Create CartService instance
    cart_service = CartService(db_session)

    # ✅ Call without db=
    await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=cart_item)

    # Verify cart has items
    await db_session.refresh(parent_profile)
    cart = await cart_service.get_hydrated_cart(parent_profile.user_id)
    assert len(cart.items) == 1
    print("✓ Cart populated with 2 T-shirts")

    # Step 3: Admin deactivates product (10:05 AM simulation)
    product.is_active = False
    await db_session.commit()
    await db_session.refresh(product)
    assert product.is_active is False
    print("✓ Admin deactivated product")

    # Step 4: Parent attempts checkout (10:10 AM simulation)
    checkout_data = OrderCreateFromCart(student_id=22, delivery_notes="Attempting to checkout deactivated product")

    # CRITICAL ASSERTION: Checkout MUST fail

    with pytest.raises(HTTPException) as exc_info:
        order_service = OrderService(db_session)

        await order_service.create_order_from_cart(checkout_data=checkout_data, current_profile=parent_profile)

    # Verify exception details
    assert exc_info.value.status_code == 400
    assert "no longer available" in exc_info.value.detail.lower()
    print(f"✓ Checkout failed correctly with: {exc_info.value.detail}")

    # Step 5: Verify no side effects occurred
    # Note: After rollback, we need to query fresh data

    # 5a. Stock unchanged - query product directly
    stmt = select(Product).where(Product.product_id == 16)
    result = await db_session.execute(stmt)
    product_check = result.scalars().first()
    assert product_check.stock_quantity == initial_stock  # Still 100
    print("✓ Stock unchanged (no decrement)")

    # 5b. Cart NOT cleared (user can remove item manually)
    cart = await cart_service.get_hydrated_cart(parent_profile.user_id)
    assert len(cart.items) == 1  # Cart still has the item
    print("✓ Cart not cleared (user can manually remove)")

    # 5c. NO order created
    stmt = select(Order.order_id).where(Order.parent_user_id == parent_user_id)
    result = await db_session.execute(stmt)
    current_order_ids = set(result.scalars().all())
    assert current_order_ids == baseline_order_ids
    print("✓ No new order created in database")
    # 5c. NO order created

    print("\n🎉 Test 1.2 PASSED: Race condition FIXED!")
    print("   Product deactivation is now enforced at checkout.")
