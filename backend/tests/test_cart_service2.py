# tests/test_cart_service2.py
"""
Integration Tests for Cart Service - Stock Validation & Constraints (Sad Paths)

Covers:
- Add item failures (insufficient stock, product not found, inactive product)
- Quantity increment failures (exceeding stock limits)
- Stock validation edge cases
- Business rule enforcement

Test Philosophy:
These tests validate that the cart service correctly REJECTS invalid operations.
They ensure data integrity and prevent overselling scenarios.
"""


import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.profile import Profile
from app.schemas.cart_schema import CartItemIn
from app.services.cart_service import CartService

# ===========================================================================
# Test 2.1: Add Item Fails - Insufficient Stock (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_add_item_fails_insufficient_stock(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 2.1: Adding more items than available stock fails immediately.

    Setup:
    - Product 16 has stock=5
    - Parent tries to add quantity=6

    Expected Result:
    ❌ HTTPException 400 "Insufficient stock"
    ✅ Error message shows requested vs available quantities
    ✅ No CartItem created in database
    """
    print("\n--- Test 2.1: Add Item Fails - Insufficient Stock ---")

    # Step 1: Setup product with low stock
    product = await db_session.get(Product, 16)
    product.is_active = True
    product.stock_quantity = 5  # Only 5 available

    parent_user_id = parent_profile.user_id
    product_name = product.name

    await db_session.commit()
    await db_session.refresh(product)
    print(f"✓ Product setup: '{product_name}' with stock=5")

    # Step 2: Attempt to add 6 items (exceeds stock)
    cart_service = CartService(db_session)

    with pytest.raises(HTTPException) as exc_info:
        await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=6))

    # Step 3: Verify error details
    assert exc_info.value.status_code == 400
    error_msg = exc_info.value.detail.lower()
    assert "insufficient stock" in error_msg
    assert "6" in exc_info.value.detail  # Requested quantity
    assert "5" in exc_info.value.detail  # Available quantity
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 4: Verify no cart item was created
    cart = await cart_service.get_hydrated_cart(parent_user_id)
    assert len(cart.items) == 0, "Cart should be empty after failed addition"
    print("✓ No CartItem created in database")

    # Step 5: Verify stock unchanged
    await db_session.refresh(product)
    assert product.stock_quantity == 5, "Stock should remain unchanged"
    print("✓ Product stock unchanged")

    print("\n🎉 Test 2.1 PASSED: Insufficient stock validation works")


# ===========================================================================
# Test 2.2: Add Item Fails - Product Not Found (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_add_item_fails_product_not_found(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 2.2: Adding non-existent product fails with 404.

    Setup:
    - Parent tries to add product_id=99999 (doesn't exist)

    Expected Result:
    ❌ HTTPException 404 "Product not found"
    ✅ No cart created
    """
    print("\n--- Test 2.2: Add Item Fails - Product Not Found ---")

    parent_user_id = parent_profile.user_id
    fake_product_id = 99999

    # Step 1: Attempt to add non-existent product
    cart_service = CartService(db_session)

    with pytest.raises(HTTPException) as exc_info:
        await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=fake_product_id, quantity=1))

    # Step 2: Verify error details
    assert exc_info.value.status_code == 404
    assert "not found" in exc_info.value.detail.lower()
    assert str(fake_product_id) in exc_info.value.detail
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 3: Verify no cart items created
    cart = await cart_service.get_hydrated_cart(parent_user_id)
    assert len(cart.items) == 0
    print("✓ No CartItem created")

    print("\n🎉 Test 2.2 PASSED: Non-existent product validation works")


# ===========================================================================
# Test 2.3: Add Item Fails - Inactive Product (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_add_item_fails_inactive_product(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 2.3: Adding inactive product fails with 400.

    Setup:
    - Product 16 exists but is_active=False
    - Parent tries to add it to cart

    Expected Result:
    ❌ HTTPException 400 "no longer available"
    ✅ No CartItem created
    """
    print("\n--- Test 2.3: Add Item Fails - Inactive Product ---")

    # Step 1: Setup inactive product
    product = await db_session.get(Product, 16)
    product.is_active = False  # Deactivated
    product.stock_quantity = 100  # Has stock, but inactive

    parent_user_id = parent_profile.user_id
    product_name = product.name

    await db_session.commit()
    await db_session.refresh(product)
    print(f"✓ Product setup: '{product_name}' is inactive")

    # Step 2: Attempt to add inactive product
    cart_service = CartService(db_session)

    with pytest.raises(HTTPException) as exc_info:
        await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=2))

    # Step 3: Verify error details
    assert exc_info.value.status_code == 400
    error_msg = exc_info.value.detail.lower()
    assert "no longer available" in error_msg or "not available" in error_msg
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 4: Verify no cart item created
    cart = await cart_service.get_hydrated_cart(parent_user_id)
    assert len(cart.items) == 0
    print("✓ No CartItem created")

    print("\n🎉 Test 2.3 PASSED: Inactive product validation works")


# ===========================================================================
# Test 2.4: Increment Quantity Beyond Stock Limit (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_increment_quantity_beyond_stock_fails(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 2.4: Incrementing existing cart item beyond stock fails.

    Setup:
    - Product has stock=10
    - Cart already has 7 items
    - Parent tries to add 4 more (total would be 11)

    Expected Result:
    ❌ HTTPException 400 "Insufficient stock. Requested: 11, Available: 10"
    ✅ Cart quantity remains at 7
    """
    print("\n--- Test 2.4: Increment Quantity Beyond Stock ---")

    # Step 1: Setup product with limited stock
    product = await db_session.get(Product, 16)
    product.is_active = True
    product.stock_quantity = 10  # Only 10 available

    parent_user_id = parent_profile.user_id
    product_name = product.name

    await db_session.commit()
    await db_session.refresh(product)
    print(f"✓ Product setup: '{product_name}' with stock=10")

    # Step 2: Add 7 items to cart (within stock)
    cart_service = CartService(db_session)
    cart = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=7))

    assert cart.items[0].quantity == 7
    print("✓ Initial cart: quantity=7")

    # Step 3: Attempt to add 4 more (total would be 11, exceeds stock of 10)
    with pytest.raises(HTTPException) as exc_info:
        await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=4))

    # Step 4: Verify error details
    assert exc_info.value.status_code == 400
    error_msg = exc_info.value.detail.lower()
    assert "insufficient stock" in error_msg
    # Should show cumulative quantity (7+4=11) vs available (10)
    assert "11" in exc_info.value.detail  # Requested total
    assert "10" in exc_info.value.detail  # Available
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 5: Verify cart quantity unchanged at 7
    cart = await cart_service.get_hydrated_cart(parent_user_id)
    assert len(cart.items) == 1
    assert cart.items[0].quantity == 7, "Quantity should remain at 7"
    print("✓ Cart quantity unchanged at 7")

    print("\n🎉 Test 2.4 PASSED: Cumulative stock validation works")


# ===========================================================================
# Test 2.5: Update Quantity Fails - Exceeds Stock (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_update_quantity_fails_exceeds_stock(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 2.5: Updating cart item quantity beyond stock fails.

    Setup:
    - Product has stock=10
    - Cart has 5 items
    - Parent tries to update to quantity=12

    Expected Result:
    ❌ HTTPException 400 "Insufficient stock. Requested: 12, Available: 10"
    ✅ Cart quantity remains at 5
    """
    print("\n--- Test 2.5: Update Quantity Fails - Exceeds Stock ---")

    # Step 1: Setup product
    product = await db_session.get(Product, 16)
    product.is_active = True
    product.stock_quantity = 10

    parent_user_id = parent_profile.user_id
    product_name = product.name

    await db_session.commit()
    await db_session.refresh(product)
    print(f"✓ Product setup: '{product_name}' with stock=10")

    # Step 2: Add 5 items to cart
    cart_service = CartService(db_session)
    cart = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=5))

    assert cart.items[0].quantity == 5
    print("✓ Initial cart: quantity=5")

    # Step 3: Attempt to update to 12 (exceeds stock of 10)
    with pytest.raises(HTTPException) as exc_info:
        await cart_service.update_item_quantity(user_id=parent_user_id, product_id=16, new_quantity=12)

    # Step 4: Verify error details
    assert exc_info.value.status_code == 400
    error_msg = exc_info.value.detail.lower()
    assert "insufficient stock" in error_msg
    assert "12" in exc_info.value.detail  # Requested
    assert "10" in exc_info.value.detail  # Available
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 5: Verify quantity unchanged
    cart = await cart_service.get_hydrated_cart(parent_user_id)
    assert cart.items[0].quantity == 5, "Quantity should remain at 5"
    print("✓ Cart quantity unchanged at 5")

    print("\n🎉 Test 2.5 PASSED: Update quantity stock validation works")


# ===========================================================================
# Test 2.6: Add Item at Exact Stock Limit (Edge Case - Should Succeed)
# ===========================================================================


@pytest.mark.asyncio
async def test_add_item_at_exact_stock_limit_succeeds(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 2.6: Adding items exactly equal to stock should succeed.

    Setup:
    - Product has stock=5
    - Parent adds exactly 5 items

    Expected Result:
    ✅ Cart created with 5 items
    ✅ No stock validation error (boundary test)
    """
    print("\n--- Test 2.6: Add Item at Exact Stock Limit ---")

    # Step 1: Setup product
    product = await db_session.get(Product, 16)
    product.is_active = True
    product.stock_quantity = 5

    parent_user_id = parent_profile.user_id

    await db_session.commit()
    await db_session.refresh(product)
    print("✓ Product setup: stock=5")

    # Step 2: Add exactly 5 items (at limit)
    cart_service = CartService(db_session)
    cart = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=5))

    # Step 3: Verify success
    assert len(cart.items) == 1
    assert cart.items[0].quantity == 5
    print("✓ Successfully added 5 items (at stock limit)")

    # Step 4: Verify cannot add more
    with pytest.raises(HTTPException) as exc_info:
        await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=1))  # Even 1 more fails

    assert exc_info.value.status_code == 400
    print("✓ Correctly prevents adding beyond limit")

    print("\n🎉 Test 2.6 PASSED: Exact stock limit boundary test works")


# ===========================================================================
# Test 2.7: Zero Stock Product Cannot Be Added (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_add_item_fails_zero_stock(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 2.7: Product with zero stock cannot be added to cart.

    Setup:
    - Product 16 is active but stock_quantity=0

    Expected Result:
    ❌ HTTPException 400 "Insufficient stock"
    """
    print("\n--- Test 2.7: Cannot Add Product with Zero Stock ---")

    # Step 1: Setup product with zero stock
    product = await db_session.get(Product, 16)
    product.is_active = True
    product.stock_quantity = 0  # Out of stock

    parent_user_id = parent_profile.user_id
    product_name = product.name

    await db_session.commit()
    await db_session.refresh(product)
    print(f"✓ Product setup: '{product_name}' with stock=0")

    # Step 2: Attempt to add 1 item
    cart_service = CartService(db_session)

    with pytest.raises(HTTPException) as exc_info:
        await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=1))

    # Step 3: Verify error
    assert exc_info.value.status_code == 400
    assert "insufficient stock" in exc_info.value.detail.lower()
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    print("\n🎉 Test 2.7 PASSED: Zero stock validation works")


print("\n" + "=" * 70)
print("🎉 ALL STOCK VALIDATION & CONSTRAINT TESTS COMPLETED!")
print("=" * 70)
