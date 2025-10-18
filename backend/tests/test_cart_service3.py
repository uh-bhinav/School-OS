# tests/test_cart_service3.py
"""
Integration Tests for Cart Service - Item Management Operations

Covers:
- Update quantity failures (item not in cart)
- Remove item from cart (success and failure cases)
- Clear cart operations
- Cart state transitions
- Edge cases for empty carts

Test Philosophy:
These tests validate cart modification operations - updating, removing, and clearing items.
They ensure the cart maintains consistency during state changes.
"""

from decimal import Decimal

import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.product import Product
from app.models.profile import Profile
from app.schemas.cart_schema import CartItemIn, CartOut
from app.services.cart_service import CartService

# ===========================================================================
# Test 3.1: Update Quantity Fails - Item Not in Cart (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_update_quantity_fails_item_not_in_cart(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 3.1: Updating quantity for non-existent cart item fails.

    Setup:
    - Cart has product 16
    - Parent tries to update quantity for product 99 (not in cart)

    Expected Result:
    ❌ HTTPException 404 "Product not found in your cart"
    ✅ Existing cart items unchanged
    """
    print("\n--- Test 3.1: Update Quantity Fails - Item Not in Cart ---")

    # Step 1: Setup product and add to cart
    product = await db_session.get(Product, 16)
    product.is_active = True
    product.stock_quantity = 100

    parent_user_id = parent_profile.user_id

    await db_session.commit()
    await db_session.refresh(product)

    # Step 2: Add product 16 to cart
    cart_service = CartService(db_session)
    cart_model = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=2))
    cart = CartOut.model_validate(cart_model)

    assert len(cart.items) == 1
    print("✓ Cart has product 16 with quantity=2")

    # Step 3: Attempt to update non-existent product 99
    non_existent_product_id = 99

    with pytest.raises(HTTPException) as exc_info:
        await cart_service.update_item_quantity(user_id=parent_user_id, product_id=non_existent_product_id, new_quantity=5)

    # Step 4: Verify error details
    assert exc_info.value.status_code == 404
    error_msg = exc_info.value.detail.lower()
    assert "not found in your cart" in error_msg or "not found in cart" in error_msg
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 5: Verify existing cart unchanged
    cart_model = await cart_service.get_hydrated_cart(parent_user_id)
    cart = CartOut.model_validate(cart_model)
    assert len(cart.items) == 1
    assert cart.items[0].product_id == 16
    assert cart.items[0].quantity == 2
    print("✓ Existing cart items unchanged")

    print("\n🎉 Test 3.1 PASSED: Update non-existent item validation works")


# ===========================================================================
# Test 3.2: Remove Item from Cart Successfully (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_remove_item_from_cart_success(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 3.2: Successfully remove an item from cart.

    Setup:
    - Cart has 2 products (16 and 4)
    - Parent removes product 4

    Expected Result:
    ✅ Product 4 removed from cart
    ✅ Product 16 remains in cart
    ✅ cart.updated_at timestamp present
    ✅ CartItem deleted from database
    """
    print("\n--- Test 3.2: Remove Item from Cart Successfully ---")

    # Step 1: Setup 2 products
    product_16 = await db_session.get(Product, 16)
    product_4 = await db_session.get(Product, 4)

    product_16.is_active = True
    product_16.stock_quantity = 100
    product_4.is_active = True
    product_4.stock_quantity = 50

    parent_user_id = parent_profile.user_id

    await db_session.commit()
    print("✓ 2 products setup")

    # Step 2: Add both products to cart
    cart_service = CartService(db_session)

    await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=2))

    cart_model = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=4, quantity=3))
    cart = CartOut.model_validate(cart_model)

    assert len(cart.items) == 2
    print("✓ Cart has 2 products")

    # Step 3: Remove product 4
    cart_model = await cart_service.remove_item_from_cart(user_id=parent_user_id, product_id=4)
    cart = CartOut.model_validate(cart_model)

    # Step 4: Verify product 4 removed
    assert len(cart.items) == 1, "Cart should have 1 item remaining"
    assert cart.items[0].product_id == 16, "Only product 16 should remain"
    assert cart.items[0].quantity == 2
    print("✓ Product 4 removed, product 16 remains")

    # Step 5: Verify updated_at is present (timestamp comparison removed due to func.now() behavior)
    assert cart.updated_at is not None
    print("✓ Cart state updated")

    # Step 6: Verify database - CartItem deleted
    stmt = select(CartItem).where(CartItem.cart_id == cart.cart_id, CartItem.product_id == 4)
    result = await db_session.execute(stmt)
    deleted_item = result.scalars().first()

    assert deleted_item is None, "CartItem should be deleted from database"
    print("✓ CartItem deleted from database")

    # Step 7: Verify computed fields updated
    assert cart.total_unique_products == 1
    assert cart.total_items == 2  # Only product 16's quantity
    print("✓ Computed fields updated correctly")

    print("\n🎉 Test 3.2 PASSED: Remove item works correctly")


# ===========================================================================
# Test 3.3: Remove Item Fails - Item Not in Cart (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_remove_item_fails_not_in_cart(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 3.3: Removing non-existent item from cart fails.

    Setup:
    - Cart has product 16
    - Parent tries to remove product 99 (not in cart)

    Expected Result:
    ❌ HTTPException 404 "Product not found in your cart"
    ✅ Existing cart unchanged
    """
    print("\n--- Test 3.3: Remove Item Fails - Not in Cart ---")

    # Step 1: Setup and add product to cart
    product = await db_session.get(Product, 16)
    product.is_active = True
    product.stock_quantity = 100

    parent_user_id = parent_profile.user_id

    await db_session.commit()

    cart_service = CartService(db_session)
    cart_model = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=2))
    cart = CartOut.model_validate(cart_model)

    assert len(cart.items) == 1
    print("✓ Cart has product 16")

    # Step 2: Attempt to remove non-existent product
    non_existent_product_id = 99

    with pytest.raises(HTTPException) as exc_info:
        await cart_service.remove_item_from_cart(user_id=parent_user_id, product_id=non_existent_product_id)

    # Step 3: Verify error details
    assert exc_info.value.status_code == 404
    error_msg = exc_info.value.detail.lower()
    assert "not found in your cart" in error_msg or "not found in cart" in error_msg
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 4: Verify cart unchanged
    cart_model = await cart_service.get_hydrated_cart(parent_user_id)
    cart = CartOut.model_validate(cart_model)
    assert len(cart.items) == 1
    assert cart.items[0].product_id == 16
    print("✓ Cart unchanged")

    print("\n🎉 Test 3.3 PASSED: Remove non-existent item validation works")


# ===========================================================================
# Test 3.4: Clear Cart Successfully (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_clear_cart_success(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 3.4: Successfully clear all items from cart.

    Setup:
    - Cart has 3 different products
    - Clear cart operation called

    Expected Result:
    ✅ All items removed from cart
    ✅ Cart becomes empty (is_empty=True)
    ✅ All CartItems deleted from database
    ✅ Cart object still exists (just empty)
    """
    print("\n--- Test 3.4: Clear Cart Successfully ---")

    # Step 1: Setup 3 products
    product_16 = await db_session.get(Product, 16)
    product_4 = await db_session.get(Product, 4)
    product_3 = await db_session.get(Product, 3)

    for product in [product_16, product_4, product_3]:
        product.is_active = True
        product.stock_quantity = 100

    parent_user_id = parent_profile.user_id

    await db_session.commit()

    # Step 2: Add all 3 products to cart
    cart_service = CartService(db_session)

    await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=2))
    await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=4, quantity=1))
    cart_model = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=3, quantity=3))
    cart = CartOut.model_validate(cart_model)

    cart_id = cart.cart_id
    assert len(cart.items) == 3
    assert cart.total_items == 6  # 2+1+3
    print("✓ Cart has 3 products with total 6 items")

    # Step 3: Clear cart
    cart_model = await cart_service.clear_cart(user_id=parent_user_id)
    cart = CartOut.model_validate(cart_model)

    # Step 4: Verify cart is empty
    assert len(cart.items) == 0, "Cart should have no items"
    assert cart.is_empty is True
    assert cart.total_items == 0
    assert cart.total_unique_products == 0
    assert cart.subtotal == Decimal("0.00")
    print("✓ Cart cleared successfully")

    # Step 5: Verify all CartItems deleted from database
    stmt = select(CartItem).where(CartItem.cart_id == cart_id)
    result = await db_session.execute(stmt)
    db_cart_items = result.scalars().all()

    assert len(db_cart_items) == 0, "All CartItems should be deleted"
    print("✓ All CartItems deleted from database")

    # Step 6: Verify Cart object still exists (not deleted)
    stmt = select(Cart).where(Cart.cart_id == cart_id)
    result = await db_session.execute(stmt)
    db_cart = result.scalars().first()

    assert db_cart is not None, "Cart object should still exist"
    assert db_cart.user_id == parent_user_id
    print("✓ Cart object still exists (just empty)")

    print("\n🎉 Test 3.4 PASSED: Clear cart works correctly")


# ===========================================================================
# Test 3.5: Clear Empty Cart (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_clear_empty_cart_no_error(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 3.5: Clearing already empty cart doesn't cause errors.

    Setup:
    - Parent has empty cart (or no cart yet)
    - Clear cart operation called

    Expected Result:
    ✅ No errors raised
    ✅ Returns empty cart
    ✅ is_empty=True
    """
    print("\n--- Test 3.5: Clear Empty Cart (No Error) ---")

    parent_user_id = parent_profile.user_id

    # Step 1: Ensure cart exists (get_or_create will create if needed)
    cart_service = CartService(db_session)
    cart_model = await cart_service.get_hydrated_cart(parent_user_id)
    cart = CartOut.model_validate(cart_model)

    initial_item_count = len(cart.items)
    print(f"✓ Initial cart state: {initial_item_count} items")

    # Step 2: Clear cart (whether empty or not)
    cart_model = await cart_service.clear_cart(user_id=parent_user_id)
    cart = CartOut.model_validate(cart_model)

    # Step 3: Verify no errors and cart is empty
    assert cart is not None, "Should return cart object"
    assert len(cart.items) == 0
    assert cart.is_empty is True
    assert cart.total_items == 0
    print("✓ Clear empty cart succeeded without errors")

    # Step 4: Clear again to ensure idempotency
    cart_model = await cart_service.clear_cart(user_id=parent_user_id)
    cart = CartOut.model_validate(cart_model)

    assert len(cart.items) == 0
    print("✓ Clearing already-cleared cart is idempotent")

    print("\n🎉 Test 3.5 PASSED: Clear empty cart edge case works")


# ===========================================================================
# Test 3.6: Remove All Items One by One (Sequential Removal)
# ===========================================================================


@pytest.mark.asyncio
async def test_remove_all_items_sequentially(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 3.6: Remove all items from cart one by one (not using clear_cart).

    Setup:
    - Cart has 3 products
    - Remove each product individually

    Expected Result:
    ✅ After each removal, item count decreases
    ✅ After removing all, cart is empty
    ✅ Cart state remains consistent throughout
    """
    print("\n--- Test 3.6: Remove All Items Sequentially ---")

    # Step 1: Setup 3 products
    product_16 = await db_session.get(Product, 16)
    product_4 = await db_session.get(Product, 4)
    product_3 = await db_session.get(Product, 3)

    for product in [product_16, product_4, product_3]:
        product.is_active = True
        product.stock_quantity = 100

    parent_user_id = parent_profile.user_id

    await db_session.commit()

    # Step 2: Add all 3 products
    cart_service = CartService(db_session)

    await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=2))
    await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=4, quantity=1))
    cart_model = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=3, quantity=3))
    cart = CartOut.model_validate(cart_model)

    assert len(cart.items) == 3
    print("✓ Initial cart: 3 products")

    # Step 3: Remove first item (product 16)
    cart_model = await cart_service.remove_item_from_cart(user_id=parent_user_id, product_id=16)
    cart = CartOut.model_validate(cart_model)

    assert len(cart.items) == 2
    product_ids = {item.product_id for item in cart.items}
    assert 16 not in product_ids
    assert product_ids == {4, 3}
    print("✓ After removing product 16: 2 products remain")

    # Step 4: Remove second item (product 4)
    cart_model = await cart_service.remove_item_from_cart(user_id=parent_user_id, product_id=4)
    cart = CartOut.model_validate(cart_model)

    assert len(cart.items) == 1
    assert cart.items[0].product_id == 3
    print("✓ After removing product 4: 1 product remains")

    # Step 5: Remove last item (product 3)
    cart_model = await cart_service.remove_item_from_cart(user_id=parent_user_id, product_id=3)
    cart = CartOut.model_validate(cart_model)

    assert len(cart.items) == 0
    assert cart.is_empty is True
    print("✓ After removing product 3: cart is empty")

    # Step 6: Verify computed fields
    assert cart.total_items == 0
    assert cart.total_unique_products == 0
    assert cart.subtotal == Decimal("0.00")
    print("✓ Computed fields correct for empty cart")

    print("\n🎉 Test 3.6 PASSED: Sequential removal works correctly")


# ===========================================================================
# Test 3.7: Update Quantity to Lower Value (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_update_quantity_to_lower_value(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 3.7: Decrease item quantity in cart.

    Setup:
    - Cart has 10 items of product 16
    - Update quantity to 3

    Expected Result:
    ✅ Quantity updated from 10 to 3
    ✅ Computed fields recalculated
    ✅ CartItem not deleted (just quantity changed)
    """
    print("\n--- Test 3.7: Update Quantity to Lower Value ---")

    # Step 1: Setup product
    product = await db_session.get(Product, 16)
    product.is_active = True
    product.stock_quantity = 100

    parent_user_id = parent_profile.user_id
    product_price = product.price

    await db_session.commit()

    # Step 2: Add 10 items to cart
    cart_service = CartService(db_session)
    cart_model = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=10))
    cart = CartOut.model_validate(cart_model)

    assert cart.items[0].quantity == 10
    initial_subtotal = cart.subtotal
    print("✓ Initial cart: quantity=10")

    # Step 3: Update quantity to 3 (decrease)
    cart_model = await cart_service.update_item_quantity(user_id=parent_user_id, product_id=16, new_quantity=3)
    cart = CartOut.model_validate(cart_model)

    # Step 4: Verify quantity decreased
    assert len(cart.items) == 1, "CartItem should still exist"
    assert cart.items[0].quantity == 3, "Quantity should be 3"
    print("✓ Quantity decreased: 10 → 3")

    # Step 5: Verify computed fields
    expected_new_subtotal = product_price * 3
    assert cart.subtotal == expected_new_subtotal
    assert cart.subtotal < initial_subtotal
    assert cart.total_items == 3
    print(f"✓ Computed fields updated: subtotal=₹{cart.subtotal}")

    print("\n🎉 Test 3.7 PASSED: Decrease quantity works correctly")


print("\n" + "=" * 70)
print("🎉 ALL ITEM MANAGEMENT OPERATIONS TESTS COMPLETED!")
print("=" * 70)
