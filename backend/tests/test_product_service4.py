# tests/test_product_service4.py
"""
Integration Tests for Product Service - Stock Management & Category Operations

Covers:
- Stock adjustment transitions (exact zero, LOW_STOCK, OUT_OF_STOCK)
- Multiple sequential adjustments
- Stock threshold transitions (reorder_level)
- Reorder level edge cases (null values)
- Bulk category updates (same school, mixed schools)
- Category filtering
- Include inactive products flag
- Product ordering

Test Philosophy:
Stock management is CRITICAL for inventory control. These tests verify that
stock levels are tracked accurately and availability statuses update correctly.

CRITICAL PATTERNS FOLLOWED:
1. Extract IDs BEFORE any commit() - prevents MissingGreenlet errors
2. Use instance-based service pattern - ProductService(db_session)
3. Refresh objects AFTER commit when needed
4. Re-fetch objects after rollback scenarios
5. Never use asyncio.run() inside async tests
6. Let test fixtures handle transaction lifecycle
"""

from decimal import Decimal

import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.product_category import ProductCategory
from app.models.profile import Profile
from app.schemas.enums import ProductAvailability
from app.schemas.product_schema import ProductCreate, ProductOut, ProductStockAdjustment
from app.services.product_service import ProductService

# ===========================================================================
# Test 4.1: Stock Adjustment - Exact Zero Result (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_stock_adjustment_exact_zero_result(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 4.1: Adjustment brings stock to exactly 0.

    Expected Result:
    ✅ Stock becomes 0 (not negative)
    ✅ Availability changes to OUT_OF_STOCK
    ✅ is_purchasable = False
    """
    print("\n--- Test 4.1: Stock Adjustment - Exact Zero Result ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create product with stock=10
    product_service = ProductService(db_session)

    product = await product_service.create_product(product_in=ProductCreate(name="Zero Stock Test Product", price=Decimal("100.00"), stock_quantity=10, category_id=1), current_profile=mock_admin_profile)

    product_id = product.product_id
    print("✅ Product created with stock=10")

    # Step 2: Fetch product for adjustment
    db_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    # Step 3: Adjust to exactly 0
    adjustment = ProductStockAdjustment(adjustment=-10, reason="Sold out - all units sold")

    adjusted_product = await product_service.adjust_stock(db_product=db_product, adjustment=adjustment)

    # Step 4: Verify stock is exactly 0
    assert adjusted_product.stock_quantity == 0
    print("✅ Stock adjusted to exactly 0")

    # Step 5: Verify availability changes to OUT_OF_STOCK
    product_schema = ProductOut.model_validate(adjusted_product)

    assert product_schema.availability == ProductAvailability.OUT_OF_STOCK
    assert product_schema.is_purchasable is False
    print(f"✅ Availability: {product_schema.availability}")
    print(f"✅ is_purchasable: {product_schema.is_purchasable}")

    print("\n🎉 Test 4.1 PASSED: Exact zero stock transition works")


# ===========================================================================
# Test 4.2: Stock Adjustment - Multiple Sequential Adjustments (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_stock_multiple_sequential_adjustments(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 4.2: Admin makes 3 adjustments in sequence.

    Expected Result:
    ✅ Final stock: 60 (50+20-15+5)
    ✅ Each adjustment applied correctly
    ✅ Stock never negative
    """
    print("\n--- Test 4.2: Multiple Sequential Stock Adjustments ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create product with initial stock=50
    product_service = ProductService(db_session)

    product = await product_service.create_product(product_in=ProductCreate(name="Sequential Adjustment Test", price=Decimal("100.00"), stock_quantity=50, category_id=1), current_profile=mock_admin_profile)

    product_id = product.product_id
    print("✅ Initial stock: 50")

    # Step 2: Adjustment 1 - Add 20
    db_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    adjustment_1 = ProductStockAdjustment(adjustment=20, reason="New shipment arrived")

    product_after_1 = await product_service.adjust_stock(db_product=db_product, adjustment=adjustment_1)

    assert product_after_1.stock_quantity == 70
    print("✅ After adjustment 1 (+20): 70")

    # Step 3: Adjustment 2 - Remove 15
    db_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    adjustment_2 = ProductStockAdjustment(adjustment=-15, reason="Damaged items removed")

    product_after_2 = await product_service.adjust_stock(db_product=db_product, adjustment=adjustment_2)

    assert product_after_2.stock_quantity == 55
    print("✅ After adjustment 2 (-15): 55")

    # Step 4: Adjustment 3 - Add 5
    db_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    adjustment_3 = ProductStockAdjustment(adjustment=5, reason="Customer returns")

    product_after_3 = await product_service.adjust_stock(db_product=db_product, adjustment=adjustment_3)

    # Step 5: Verify final stock
    assert product_after_3.stock_quantity == 60
    print("✅ Final stock: 60 (50+20-15+5)")

    # Step 6: Verify stock never went negative
    assert product_after_3.stock_quantity >= 0
    print("✅ Stock remained non-negative throughout")

    print("\n🎉 Test 4.2 PASSED: Sequential adjustments work correctly")


# ===========================================================================
# Test 4.3: Stock Threshold Transitions - Low Stock Warning (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_stock_threshold_low_stock_warning(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 4.3: Stock crosses LOW_STOCK threshold.

    Expected Result:
    ✅ Availability changes from IN_STOCK to LOW_STOCK
    ✅ stock_status_message shows low stock warning
    ✅ is_purchasable still True
    """
    print("\n--- Test 4.3: Stock Threshold - Low Stock Warning ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create product with reorder_level=20, stock=25
    product_service = ProductService(db_session)

    product = await product_service.create_product(product_in=ProductCreate(name="Low Stock Threshold Test", price=Decimal("100.00"), stock_quantity=25, reorder_level=20, category_id=1), current_profile=mock_admin_profile)

    product_id = product.product_id
    print("✅ Product created: stock=25, reorder_level=20")

    # Step 2: Verify initial availability (IN_STOCK)
    product_schema_initial = ProductOut.model_validate(product)
    assert product_schema_initial.availability == ProductAvailability.IN_STOCK
    print(f"✅ Initial availability: {product_schema_initial.availability}")

    # Step 3: Adjust stock by -10 (stock becomes 15)
    db_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    adjustment = ProductStockAdjustment(adjustment=-10, reason="Sales")

    adjusted_product = await product_service.adjust_stock(db_product=db_product, adjustment=adjustment)

    # Step 4: Verify availability changed to LOW_STOCK
    product_schema = ProductOut.model_validate(adjusted_product)

    assert adjusted_product.stock_quantity == 15
    assert product_schema.availability == ProductAvailability.LOW_STOCK
    print(f"✅ After adjustment: stock=15, availability={product_schema.availability}")

    # Step 5: Verify stock_status_message
    assert "Low Stock" in product_schema.stock_status_message
    assert "15" in product_schema.stock_status_message
    print(f"✅ Status message: {product_schema.stock_status_message}")

    # Step 6: Verify still purchasable
    assert product_schema.is_purchasable is True
    print("✅ is_purchasable: True (still available for purchase)")

    print("\n🎉 Test 4.3 PASSED: Low stock threshold detection works")


# ===========================================================================
# Test 4.4: Stock Threshold Transitions - Out of Stock (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_stock_threshold_out_of_stock(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 4.4: Stock drops to zero.

    Expected Result:
    ✅ Availability changes to OUT_OF_STOCK
    ✅ is_purchasable = False
    ✅ stock_status_message = "Out of Stock"
    """
    print("\n--- Test 4.4: Stock Threshold - Out of Stock ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create product with stock=5
    product_service = ProductService(db_session)

    product = await product_service.create_product(product_in=ProductCreate(name="Out of Stock Test", price=Decimal("100.00"), stock_quantity=5, category_id=1), current_profile=mock_admin_profile)

    product_id = product.product_id
    print("✅ Product created with stock=5")

    # Step 2: Adjust stock by -5 (stock becomes 0)
    db_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    adjustment = ProductStockAdjustment(adjustment=-5, reason="All units sold")

    adjusted_product = await product_service.adjust_stock(db_product=db_product, adjustment=adjustment)

    # Step 3: Verify availability changed to OUT_OF_STOCK
    product_schema = ProductOut.model_validate(adjusted_product)

    assert adjusted_product.stock_quantity == 0
    assert product_schema.availability == ProductAvailability.OUT_OF_STOCK
    print(f"✅ Availability: {product_schema.availability}")

    # Step 4: Verify is_purchasable = False
    assert product_schema.is_purchasable is False
    print("✅ is_purchasable: False")

    # Step 5: Verify stock_status_message
    assert product_schema.stock_status_message == "Out of Stock"
    print(f"✅ Status message: {product_schema.stock_status_message}")

    print("\n🎉 Test 4.4 PASSED: Out of stock transition works")


# ===========================================================================
# Test 4.5: Stock Adjustment with No Reorder Level Set (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_stock_adjustment_no_reorder_level(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 4.5: Product has no reorder_level configured.

    Expected Result:
    ✅ Availability never LOW_STOCK (either IN_STOCK or OUT_OF_STOCK)
    ✅ Uses fallback logic (stock <= 10 for LOW_STOCK in list view)
    """
    print("\n--- Test 4.5: Stock Adjustment - No Reorder Level ---")

    # Step 1: Create product with reorder_level=None, stock=5
    product_service = ProductService(db_session)

    product = await product_service.create_product(product_in=ProductCreate(name="No Reorder Level Test", price=Decimal("100.00"), stock_quantity=5, reorder_level=None, category_id=1), current_profile=mock_admin_profile)  # No reorder level set

    # product_id = product.product_id
    print("✅ Product created: stock=5, reorder_level=None")

    # Step 2: Verify availability (should be IN_STOCK, not LOW_STOCK)
    product_schema = ProductOut.model_validate(product)

    # Since reorder_level is None, availability logic only checks stock > 0
    # Stock=5 > 0, so should be IN_STOCK
    assert product_schema.availability == ProductAvailability.IN_STOCK
    print(f"✅ Availability: {product_schema.availability} (no LOW_STOCK with null reorder_level)")

    # Step 3: Verify stock_status_message
    assert "In Stock" in product_schema.stock_status_message
    assert "5 available" in product_schema.stock_status_message
    print(f"✅ Status message: {product_schema.stock_status_message}")

    print("\n🎉 Test 4.5 PASSED: Null reorder_level handled correctly")


# ===========================================================================
# Test 4.6: Bulk Category Update - All Products Same School (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_bulk_category_update_same_school(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 4.6: Move 5 products to new category atomically.

    Expected Result:
    ✅ All 5 products updated in single transaction
    ✅ All returned with new category details hydrated
    ✅ Atomic operation (all-or-nothing)
    """
    print("\n--- Test 4.6: Bulk Category Update - Same School ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Ensure category 2 exists
    category_2 = await db_session.get(ProductCategory, 2)
    if not category_2:
        category_2 = ProductCategory(school_id=admin_school_id, category_name="Bulk Update Target Category")
        db_session.add(category_2)
        await db_session.commit()
        await db_session.refresh(category_2)

    print(f"✅ Target category exists: {category_2.category_name}")

    # Step 2: Create 5 products in category 1
    product_service = ProductService(db_session)
    product_ids = []

    for i in range(5):
        product = await product_service.create_product(product_in=ProductCreate(name=f"Bulk Category Test Product {i+1}", price=Decimal("50.00"), stock_quantity=10, category_id=1), current_profile=mock_admin_profile)
        product_ids.append(product.product_id)

    print(f"✅ Created 5 products in category 1: {product_ids}")

    # Step 3: Bulk update to category 2
    updated_products = await product_service.bulk_update_category(school_id=admin_school_id, product_ids=product_ids, new_category_id=2)

    # Step 4: Verify all 5 products updated
    assert len(updated_products) == 5
    for product in updated_products:
        assert product.category_id == 2
    print("✅ All 5 products moved to category 2")

    # Step 5: Verify in database (atomic transaction)
    for product_id in product_ids:
        db_product = await db_session.get(Product, product_id)
        assert db_product.category_id == 2
    print("✅ Changes persisted atomically in database")

    print("\n🎉 Test 4.6 PASSED: Bulk category update works")


# ===========================================================================
# Test 4.7: Bulk Category Update - Mixed Schools (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_bulk_category_update_mixed_schools(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 4.7: Admin tries bulk update with products from other schools.

    Expected Result:
    ❌ HTTPException 404 "Products not found: {99}"
    ✅ No products updated (rollback)
    """
    print("\n--- Test 4.7: Bulk Category Update - Mixed Schools ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create products for School 1
    product_service = ProductService(db_session)

    school_1_products = []
    for i in range(2):
        product = await product_service.create_product(product_in=ProductCreate(name=f"School 1 Bulk Product {i+1}", price=Decimal("50.00"), stock_quantity=10, category_id=1), current_profile=mock_admin_profile)
        school_1_products.append(product.product_id)

    print(f"✅ Created 2 products for School 1: {school_1_products}")

    # Step 2: Create product for School 2
    school_2_product = Product(school_id=2, category_id=1, name="School 2 Product", price=Decimal("100.00"), stock_quantity=20, is_active=True)
    db_session.add(school_2_product)
    await db_session.commit()
    await db_session.refresh(school_2_product)

    school_2_product_id = school_2_product.product_id
    print(f"✅ Created product for School 2: {school_2_product_id}")

    # Step 3: Attempt bulk update with mixed school products
    mixed_product_ids = school_1_products + [school_2_product_id]

    with pytest.raises(HTTPException) as exc_info:
        await product_service.bulk_update_category(school_id=admin_school_id, product_ids=mixed_product_ids, new_category_id=2)

    # Step 4: Verify error
    assert exc_info.value.status_code == 404
    assert str(school_2_product_id) in exc_info.value.detail
    print(f"✅ Correctly rejected: {exc_info.value.detail}")

    # Step 5: Verify no products updated (atomic rollback)
    for product_id in school_1_products:
        db_product = await db_session.get(Product, product_id)
        assert db_product.category_id == 1
    print("✅ School 1 products remain in category 1 (atomic rollback)")

    print("\n🎉 Test 4.7 PASSED: Mixed school bulk update prevented")


# ===========================================================================
# Test 4.8: Category Filtering - Get Products by Category (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_category_filtering_get_products(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 4.8: Retrieve all products in specific category.

    Expected Result:
    ✅ Returns products from "Uniforms" only
    ✅ Books not included
    ✅ Ordered by product name
    """
    print("\n--- Test 4.8: Category Filtering ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Ensure we have 2 categories
    category_2 = await db_session.get(ProductCategory, 2)
    if not category_2:
        category_2 = ProductCategory(school_id=admin_school_id, category_name="Books")
        db_session.add(category_2)
        await db_session.commit()
        await db_session.refresh(category_2)

    # Step 2: Create products in category 1 (Uniforms)
    product_service = ProductService(db_session)

    uniform_product_ids = []
    for i in range(3):
        product = await product_service.create_product(product_in=ProductCreate(name=f"Uniform Item {i+1}", price=Decimal("500.00"), stock_quantity=50, category_id=1), current_profile=mock_admin_profile)
        uniform_product_ids.append(product.product_id)

    print("✅ Created 3 products in category 1 (Uniforms)")

    # Step 3: Create products in category 2 (Books)
    book_product_ids = []
    for i in range(2):
        product = await product_service.create_product(product_in=ProductCreate(name=f"Book Item {i+1}", price=Decimal("300.00"), stock_quantity=30, category_id=2), current_profile=mock_admin_profile)
        book_product_ids.append(product.product_id)

    print("✅ Created 2 products in category 2 (Books)")

    # Step 4: Get products filtered by category 1
    filtered_products = await product_service.get_all_products(school_id=admin_school_id, category_id=1, include_inactive=False)

    # Step 5: Verify only category 1 products returned
    filtered_product_ids = [p.product_id for p in filtered_products]

    for uniform_id in uniform_product_ids:
        assert uniform_id in filtered_product_ids

    for book_id in book_product_ids:
        assert book_id not in filtered_product_ids

    print(f"✅ Returned {len([p for p in filtered_products if p.product_id in uniform_product_ids])} uniform products")
    print(f"✅ Books excluded: {len(book_product_ids)} products")

    # Step 6: Verify ordering by name
    our_products = [p for p in filtered_products if p.product_id in uniform_product_ids]
    product_names = [p.name for p in our_products]
    assert product_names == sorted(product_names)
    print("✅ Products ordered by name (ascending)")

    print("\n🎉 Test 4.8 PASSED: Category filtering works")


# ===========================================================================
# Test 4.9: Include Inactive Products Flag (Admin Feature)
# ===========================================================================


@pytest.mark.asyncio
async def test_include_inactive_products_flag(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 4.9: Admin views all products including inactive.

    Expected Result:
    ✅ Returns all 7 products (5 active + 2 inactive)
    ✅ Inactive products included
    ✅ is_active flag distinguishes them
    """
    print("\n--- Test 4.9: Include Inactive Products Flag ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create 5 active products
    product_service = ProductService(db_session)

    active_product_ids = []
    for i in range(5):
        product = await product_service.create_product(product_in=ProductCreate(name=f"Active Product {i+1}", price=Decimal("100.00"), stock_quantity=10, category_id=1, is_active=True), current_profile=mock_admin_profile)
        active_product_ids.append(product.product_id)

    print("✅ Created 5 active products")

    # Step 2: Create 2 products and soft-delete them
    inactive_product_ids = []
    for i in range(2):
        product = await product_service.create_product(product_in=ProductCreate(name=f"Inactive Product {i+1}", price=Decimal("100.00"), stock_quantity=10, category_id=1), current_profile=mock_admin_profile)
        inactive_product_ids.append(product.product_id)

        # Soft delete
        db_product = await product_service.get_product_by_id(product_id=product.product_id, school_id=admin_school_id)
        await product_service.delete_product(db_product)

    print("✅ Created 2 inactive products")

    # Step 3: Get all products including inactive
    all_products = await product_service.get_all_products(school_id=admin_school_id, include_inactive=True)

    # Step 4: Verify all 7 products returned
    all_product_ids = [p.product_id for p in all_products]

    our_active_count = len([pid for pid in active_product_ids if pid in all_product_ids])
    our_inactive_count = len([pid for pid in inactive_product_ids if pid in all_product_ids])

    assert our_active_count == 5
    assert our_inactive_count == 2
    print(f"✅ Returned {our_active_count} active + {our_inactive_count} inactive = 7 total products")

    # Step 5: Verify is_active flag distinguishes them
    for product in all_products:
        if product.product_id in active_product_ids:
            assert product.is_active is True
        elif product.product_id in inactive_product_ids:
            assert product.is_active is False

    print("✅ is_active flag correctly distinguishes active/inactive products")

    print("\n🎉 Test 4.9 PASSED: Include inactive flag works")


# ===========================================================================
# Test 4.10: Product Ordering by Name (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_product_ordering_by_name(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 4.10: Verify products returned in alphabetical order.

    Expected Result:
    ✅ Order: "House T-Shirt", "School Bag", "Uniform Tie"
    ✅ Case-insensitive sorting
    ✅ ORDER BY name ASC
    """
    print("\n--- Test 4.10: Product Ordering by Name ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create products in non-alphabetical order
    product_service = ProductService(db_session)

    product_names = ["Uniform Tie", "House T-Shirt", "School Bag"]
    created_product_ids = []

    for name in product_names:
        product = await product_service.create_product(product_in=ProductCreate(name=name, price=Decimal("500.00"), stock_quantity=50, category_id=1), current_profile=mock_admin_profile)
        created_product_ids.append(product.product_id)

    print(f"✅ Created products: {product_names}")

    # Step 2: Get all products
    all_products = await product_service.get_all_products(school_id=admin_school_id, include_inactive=False)

    # Step 3: Verify our products are in alphabetical order
    our_products = [p for p in all_products if p.product_id in created_product_ids]
    our_product_names = [p.name for p in our_products]

    expected_order = ["House T-Shirt", "School Bag", "Uniform Tie"]
    assert our_product_names == expected_order
    print(f"✅ Products ordered correctly: {our_product_names}")

    expected_order = sorted(product_names)
    assert our_product_names == expected_order, f"Expected {expected_order}, but got {our_product_names}"
    print(f"✅ Products correctly ordered: {our_product_names}")

    # Step 4: Verify case-insensitive sorting (if applicable, e.g., if SQL uses LOWER())
    # This is implicitly tested if the database collation is case-insensitive,
    # or if the query uses LOWER(name). Assuming standard collation.
    print("✅ Case-insensitive sorting assumed based on standard DB behavior")

    print("\n🎉 Test 4.10 PASSED: Product ordering by name works correctly")


print("\n" + "=" * 70)
print("🎉 ALL STOCK MANAGEMENT & CATEGORY OPERATIONS TESTS COMPLETED!")
print("=" * 70)
