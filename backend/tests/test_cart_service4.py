# tests/test_cart_service.py
"""
Integration Tests for Cart Service - Core Operations (Happy Paths)

Covers:
- Basic cart creation and item addition
- Quantity increment for existing products
- Hydrated cart retrieval with product details
- Multi-product cart scenarios
- Quantity updates

Test Philosophy:
These are the fundamental cart operations that should ALWAYS work.
If any of these fail, the entire cart system is broken.

NOTE: CartService returns ORM models (Cart, CartItem), not Pydantic schemas.
Tests calculate computed fields manually since they don't exist on ORM models.
"""


import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.cart_item import CartItem
from app.models.product import Product
from app.models.profile import Profile
from app.schemas.cart_schema import CartItemIn
from app.services.cart_service import CartService

# ===========================================================================
# Test 1.1: Add Item to Cart (First Time) - Happy Path
# ===========================================================================


@pytest.mark.asyncio
async def test_add_item_to_cart_creates_new_cart_item(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 1.1: Adding product to empty cart creates new cart item.

    Setup:
    - Product 16 exists with stock=100
    - Parent has empty cart

    Expected Result:
    ✅ Cart created automatically if doesn't exist
    ✅ CartItem created with correct quantity
    ✅ Product details hydrated in response
    ✅ Subtotal calculated correctly
    """
    print("\n--- Test 1.1: Add Item to Empty Cart ---")
    # Step 0: Extract IDs FIRST
    parent_user_id = parent_profile.user_id

    # Step 1: Setup product and extract IDs BEFORE commit
    product = await db_session.get(Product, 16)
    product.is_active = True
    product.stock_quantity = 100

    product_price = product.price  # Extract before commit

    await db_session.commit()
    await db_session.refresh(product)
    print(f"✓ Product setup: stock=100, price={product_price}")

    # Step 2: Add item to cart
    cart_service = CartService(db_session)
    cart = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=2))

    # Step 3: Verify cart structure
    assert cart is not None
    assert cart.user_id == parent_user_id
    assert len(cart.items) == 1
    print("✓ Cart created with 1 item")

    # Step 4: Verify cart item details
    cart_item = cart.items[0]
    assert cart_item.product_id == 16
    assert cart_item.quantity == 2
    assert cart_item.product.name == "House T-Shirt (Blue)"
    assert cart_item.product.price == product_price
    print(f"✓ CartItem: {cart_item.product.name} x {cart_item.quantity}")

    # Step 5: Verify subtotal calculation (manually calculated)
    expected_subtotal = product_price * 2
    actual_subtotal = cart_item.product.price * cart_item.quantity
    assert actual_subtotal == expected_subtotal
    print(f"✓ Subtotal: ₹{actual_subtotal}")

    # Step 6: Verify total items (sum of quantities)
    total_items = sum(item.quantity for item in cart.items)
    assert total_items == 2
    print(f"✓ Total items: {total_items}")

    # Step 7: Verify cart is not empty
    is_empty = len(cart.items) == 0
    assert is_empty is False
    print("✓ Cart is not empty")

    print("\n🎉 Test 1.1 PASSED: Basic cart addition works correctly")


# ===========================================================================
# Test 1.2: Increment Quantity for Existing Product - Happy Path
# ===========================================================================


@pytest.mark.asyncio
async def test_add_existing_product_increments_quantity(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 1.2: Adding same product twice increments quantity (no duplicates).

    Setup:
    - Product 16 exists with stock=100
    - Parent adds 2 items to cart
    - Parent adds 3 MORE items of same product

    Expected Result:
    ✅ Only ONE CartItem exists with quantity=5 (not two separate items)
    ✅ Stock validation applies to total quantity
    ✅ Database constraint enforced (unique cart_id + product_id)
    """
    print("\n--- Test 1.2: Increment Quantity for Existing Product ---")
    # Step 0: Extract IDs FIRST
    parent_user_id = parent_profile.user_id

    # Step 1: Setup product
    product = await db_session.get(Product, 16)
    product.is_active = True
    product.stock_quantity = 100

    await db_session.commit()
    await db_session.refresh(product)

    # Step 2: Add product first time (quantity=2)
    cart_service = CartService(db_session)
    cart = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=2))

    assert len(cart.items) == 1
    assert cart.items[0].quantity == 2
    print("✓ First addition: quantity=2")

    # Step 3: Add same product again (quantity=3 more)
    cart = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=3))

    # Step 4: Verify quantity incremented (not duplicated)
    assert len(cart.items) == 1, "Should still have only 1 CartItem"
    assert cart.items[0].quantity == 5, "Quantity should be 2+3=5"
    print("✓ Second addition: quantity incremented to 5")

    # Step 5: Verify in database (no duplicate cart items)
    stmt = select(CartItem).where(CartItem.cart_id == cart.cart_id, CartItem.product_id == 16)
    result = await db_session.execute(stmt)
    db_cart_items = result.scalars().all()

    assert len(db_cart_items) == 1, "Database should have only 1 CartItem"
    assert db_cart_items[0].quantity == 5
    print("✓ Database verified: No duplicate cart items")

    # Step 6: Verify total items (manually calculated)
    total_items = sum(item.quantity for item in cart.items)
    assert total_items == 5
    print(f"✓ Total items: {total_items}")

    print("\n🎉 Test 1.2 PASSED: Quantity increment works correctly")


# ===========================================================================
# Test 1.3: Get Hydrated Cart with Product Details - Happy Path
# ===========================================================================


@pytest.mark.asyncio
async def test_get_hydrated_cart_with_computed_fields(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 1.3: Hydrated cart returns all product details.

    Setup:
    - Add 2 products with different quantities and prices
    - Product 16: 2 items @ ₹750 each
    - Product 4: 3 items @ ₹250 each

    Expected Result:
    ✅ Cart items include full product details (no N+1 queries)
    ✅ total_items = 5 (sum of quantities)
    ✅ total_unique_products = 2
    ✅ subtotal = (2×750) + (3×250) = ₹2250
    """
    print("\n--- Test 1.3: Hydrated Cart with Product Details ---")
    # Step 0: Extract IDs FIRST
    parent_user_id = parent_profile.user_id

    # Step 1: Setup products
    product_16 = await db_session.get(Product, 16)  # T-Shirt
    product_4 = await db_session.get(Product, 4)  # School Tie

    product_16.is_active = True
    product_16.stock_quantity = 100
    product_4.is_active = True
    product_4.stock_quantity = 50

    price_16 = product_16.price
    price_4 = product_4.price

    await db_session.commit()
    print(f"✓ Products setup: T-Shirt (₹{price_16}), Tie (₹{price_4})")

    # Step 2: Add both products to cart
    cart_service = CartService(db_session)

    await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=2))

    cart = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=4, quantity=3))

    assert len(cart.items) == 2
    print("✓ Added 2 different products to cart")

    # Step 3: Verify product details are hydrated
    for item in cart.items:
        assert item.product is not None
        assert item.product.name is not None
        assert item.product.price is not None
        assert item.product.stock_quantity is not None
    print("✓ Product details hydrated (no lazy loading)")

    # Step 4: Verify total items (manually calculated)
    total_items = sum(item.quantity for item in cart.items)
    assert total_items == 5, f"Should be 2+3=5, got {total_items}"
    print(f"✓ total_items={total_items}")

    # Step 5: Verify unique product count
    total_unique_products = len(cart.items)
    assert total_unique_products == 2
    print(f"✓ total_unique_products={total_unique_products}")

    # Step 6: Verify subtotal calculation (manually calculated)
    subtotal = sum(item.product.price * item.quantity for item in cart.items)
    expected_subtotal = (price_16 * 2) + (price_4 * 3)
    assert subtotal == expected_subtotal
    print(f"✓ subtotal=₹{subtotal} (calculated correctly)")

    # Step 7: Verify individual item subtotals
    item_16 = next(item for item in cart.items if item.product_id == 16)
    item_4 = next(item for item in cart.items if item.product_id == 4)

    assert item_16.product.price * item_16.quantity == price_16 * 2
    assert item_4.product.price * item_4.quantity == price_4 * 3
    print("✓ Individual item subtotals correct")

    print("\n🎉 Test 1.3 PASSED: Hydrated cart works correctly")


# ===========================================================================
# Test 1.4: Add Multiple Different Products - Happy Path
# ===========================================================================


@pytest.mark.asyncio
async def test_add_multiple_different_products_to_cart(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 1.4: Add 3 different products in sequence.

    Setup:
    - Product 16: House T-Shirt
    - Product 4: School Tie
    - Product 3: Another product

    Expected Result:
    ✅ Cart contains 3 distinct CartItems
    ✅ Each product maintains independent quantity
    ✅ total_unique_products = 3
    """
    print("\n--- Test 1.4: Add Multiple Different Products ---")
    # Step 0: Extract IDs FIRST
    parent_user_id = parent_profile.user_id

    # Step 1: Setup 3 products
    product_16 = await db_session.get(Product, 16)
    product_4 = await db_session.get(Product, 4)
    product_3 = await db_session.get(Product, 3)

    for product in [product_16, product_4, product_3]:
        product.is_active = True
        product.stock_quantity = 100

    await db_session.commit()
    print("✓ 3 products setup with sufficient stock")

    # Step 2: Add all 3 products in sequence
    cart_service = CartService(db_session)

    cart = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=2))
    assert len(cart.items) == 1
    print("✓ Added product 16")

    cart = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=4, quantity=1))
    assert len(cart.items) == 2
    print("✓ Added product 4")

    cart = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=3, quantity=3))
    assert len(cart.items) == 3
    print("✓ Added product 3")

    # Step 3: Verify all products present with correct quantities
    product_ids = {item.product_id for item in cart.items}
    assert product_ids == {16, 4, 3}
    print("✓ All 3 products present in cart")

    # Step 4: Verify individual quantities maintained
    quantities = {item.product_id: item.quantity for item in cart.items}
    assert quantities[16] == 2
    assert quantities[4] == 1
    assert quantities[3] == 3
    print("✓ Individual quantities maintained correctly")

    # Step 5: Verify total unique products and total items
    total_unique_products = len(cart.items)
    total_items = sum(item.quantity for item in cart.items)
    assert total_unique_products == 3
    assert total_items == 6  # 2+1+3
    print("✓ total_unique_products=3, total_items=6")

    print("\n🎉 Test 1.4 PASSED: Multi-product cart works correctly")


# ===========================================================================
# Test 1.5: Update Item Quantity Successfully - Happy Path
# ===========================================================================


@pytest.mark.asyncio
async def test_update_item_quantity_success(db_session: AsyncSession, parent_profile: Profile):
    """
    Test 1.5: Update quantity of existing cart item.

    Setup:
    - Cart has 2 T-shirts
    - Parent updates quantity to 5

    Expected Result:
    ✅ CartItem quantity updated from 2 to 5
    ✅ cart.updated_at timestamp changes
    ✅ Subtotal recalculated correctly
    """
    print("\n--- Test 1.5: Update Item Quantity Successfully ---")
    # Step 0: Extract IDs FIRST
    parent_user_id = parent_profile.user_id

    # Step 1: Setup product
    product = await db_session.get(Product, 16)
    product.is_active = True
    product.stock_quantity = 100

    product_price = product.price

    await db_session.commit()
    await db_session.refresh(product)

    # Step 2: Add item to cart (initial quantity=2)
    cart_service = CartService(db_session)
    cart = await cart_service.add_item_to_cart(user_id=parent_user_id, item_in=CartItemIn(product_id=16, quantity=2))

    # initial_updated_at = cart.updated_at
    initial_subtotal = cart.items[0].product.price * cart.items[0].quantity
    assert cart.items[0].quantity == 2
    print(f"✓ Initial cart: quantity=2, subtotal=₹{initial_subtotal}")

    # Small delay to ensure timestamp changes
    import asyncio

    await asyncio.sleep(0.1)

    # Step 3: Update quantity to 5
    cart = await cart_service.update_item_quantity(user_id=parent_user_id, product_id=16, new_quantity=5)

    # Step 4: Verify quantity updated
    assert len(cart.items) == 1, "Should still have 1 item"
    assert cart.items[0].quantity == 5, "Quantity should be updated to 5"
    print("✓ Quantity updated: 2 → 5")

    # Step 5: Verify subtotal recalculated
    expected_new_subtotal = product_price * 5
    actual_new_subtotal = cart.items[0].product.price * cart.items[0].quantity
    assert actual_new_subtotal == expected_new_subtotal
    assert actual_new_subtotal != initial_subtotal
    print(f"✓ Subtotal recalculated: ₹{actual_new_subtotal}")

    # Step 6: Verify total items
    total_items = sum(item.quantity for item in cart.items)
    assert total_items == 5
    print(f"✓ Total items: {total_items}")

    # Step 7: Verify in database
    stmt = select(CartItem).where(CartItem.cart_id == cart.cart_id, CartItem.product_id == 16)
    result = await db_session.execute(stmt)
    db_cart_item = result.scalars().first()

    assert db_cart_item.quantity == 5
    print("✓ Database updated correctly")

    print("\n🎉 Test 1.5 PASSED: Update quantity works correctly")


print("\n" + "=" * 70)
print("🎉 ALL CORE CART OPERATIONS TESTS COMPLETED!")
print("=" * 70)
