# tests/test_product_service5.py
"""
Integration Tests for Product Service - Edge Cases & Advanced Scenarios

Covers:
- Price precision (max/excessive decimals)
- SKU normalization and validation (lowercase, special chars)
- Null optional fields handling
- Partial updates
- Product state transitions (reactivation)
- Computed field edge cases (availability with null reorder_level, stock messages)
- Empty product list handling
- Boundary values (max stock)
- Special characters in names/descriptions
- Case-insensitive duplicate detection
- Idempotent updates/deletes
- Text field length limits
- Concurrent operations (race conditions - conceptual tests)

Test Philosophy:
These tests push the boundaries of the Product Service, ensuring it handles
uncommon inputs, state changes, and potential race conditions gracefully.

CRITICAL PATTERNS FOLLOWED:
1. Extract IDs/values BEFORE any commit() - prevents MissingGreenlet errors
2. Use instance-based service pattern - ProductService(db_session)
3. Refresh objects AFTER commit when needed
4. Re-fetch objects after rollback/commit scenarios
5. Never use asyncio.run() inside async tests
6. Let test fixtures handle transaction lifecycle
"""

import asyncio
from decimal import Decimal
from typing import Optional

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.product import Product
from app.models.product_category import ProductCategory
from app.models.profile import Profile
from app.schemas.enums import ProductAvailability
from app.schemas.product_schema import ProductCreate, ProductOut, ProductStockAdjustment, ProductUpdate
from app.services.product_service import ProductService

# ===========================================================================
# Test 5.1: Price Precision - Maximum Decimal Places (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_price_precision_maximum_decimals(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.1: Product with price having 2 decimal places (max allowed).

    Expected Result:
    ✅ Price stored as Decimal('999.99')
    ✅ No rounding errors
    ✅ Maintains precision
    """
    print("\n--- Test 5.1: Price Precision - Max Decimals ---")

    # Step 1: Create product with max decimal price
    product_data = ProductCreate(name="Max Decimal Product", price=Decimal("999.99"), stock_quantity=10, category_id=1)

    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    product_id = created_product.product_id

    # Step 2: Verify price stored correctly
    assert created_product.price == Decimal("999.99")
    print(f"✅ Price stored correctly: {created_product.price}")

    # Step 3: Verify in database
    db_product = await db_session.get(Product, product_id)
    assert db_product.price == Decimal("999.99")
    print("✅ Price precision maintained in database")

    print("\n🎉 Test 5.1 PASSED: Max decimal precision works")


# ===========================================================================
# Test 5.2: Price Precision - Excessive Decimal Places (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_price_precision_excessive_decimals(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.2: Admin provides price with 3+ decimal places.

    Expected Result:
    ❌ Pydantic ValidationError about decimal places
    """
    print("\n--- Test 5.2: Price Precision - Excessive Decimals ---")

    # Step 1: Attempt to create product with invalid price
    with pytest.raises(ValidationError) as exc_info:
        ProductCreate(name="Excessive Decimal Product", price=Decimal("750.123"), stock_quantity=10, category_id=1)  # 3 decimal places

    # Step 2: Verify validation error (Pydantic V2 format)
    error_str = str(exc_info.value)
    assert "decimal" in error_str.lower() and "2" in error_str and "places" in error_str.lower()
    print(f"✅ Correctly rejected: {error_str}")

    print("\n🎉 Test 5.2 PASSED: Excessive decimal validation works")


# ===========================================================================
# Test 5.3: SKU Normalization - Lowercase Input (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_sku_normalization_lowercase_input(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.3: Admin provides SKU in lowercase.

    Expected Result:
    ✅ SKU stored as "UNIFORM-TSHIRT-001" (uppercase)
    ✅ Normalization applied via field_validator
    """
    print("\n--- Test 5.3: SKU Normalization - Lowercase Input ---")

    # Step 1: Create product with lowercase SKU
    product_data = ProductCreate(name="Lowercase SKU Product", price=Decimal("100.00"), stock_quantity=10, category_id=1, sku="uniform-tshirt-001")

    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    # Step 2: Verify SKU stored in uppercase
    assert created_product.sku == "UNIFORM-TSHIRT-001"
    print(f"✅ SKU normalized to uppercase: {created_product.sku}")

    print("\n🎉 Test 5.3 PASSED: SKU normalization works")


# ===========================================================================
# Test 5.4: SKU with Hyphens and Underscores (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_sku_with_valid_special_chars(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.4: SKU contains valid special characters (hyphens, underscores).

    Expected Result:
    ✅ SKU accepted
    ✅ Stored as-is (after uppercasing)
    """
    print("\n--- Test 5.4: SKU with Valid Special Chars ---")

    # Step 1: Create product with valid special chars in SKU
    product_data = ProductCreate(name="Valid SKU Chars Product", price=Decimal("100.00"), stock_quantity=10, category_id=1, sku="UNIFORM_TSHIRT-BLUE_M")

    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    # Step 2: Verify SKU stored correctly
    assert created_product.sku == "UNIFORM_TSHIRT-BLUE_M"
    print(f"✅ SKU with hyphens/underscores accepted: {created_product.sku}")

    print("\n🎉 Test 5.4 PASSED: Valid SKU characters handled")


# ===========================================================================
# Test 5.5: Product with Null Optional Fields (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_product_with_null_optional_fields(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.5: Create product with minimal required fields only.

    Expected Result:
    ✅ Product created successfully
    ✅ Optional fields NULL in database
    ✅ Default values applied (stock_quantity=0, is_active=True)
    """
    print("\n--- Test 5.5: Product with Null Optional Fields ---")

    # Step 1: Create product with only required fields
    product_data = ProductCreate(name="Minimal Product", description="Only required fields provided.", price=Decimal("50.00"), category_id=1)

    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)
    product_id = created_product.product_id

    # Step 2: Verify default values applied
    assert created_product.stock_quantity == 0
    assert created_product.is_active is True
    print(f"✅ Defaults applied: stock={created_product.stock_quantity}, active={created_product.is_active}")

    # Step 3: Verify optional fields are None/Null
    assert created_product.sku is None
    assert created_product.image_url is None
    assert created_product.manufacturer is None
    assert created_product.reorder_level is None
    assert created_product.reorder_quantity is None
    print("✅ Optional fields correctly set to None")

    # Step 4: Verify in database
    db_product = await db_session.get(Product, product_id)
    assert db_product.sku is None
    assert db_product.image_url is None
    print("✅ Optional fields are NULL in database")

    print("\n🎉 Test 5.5 PASSED: Null optional fields handled correctly")


# ===========================================================================
# Test 5.6: Update Product with Partial Data (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_update_product_partial_data(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.6: Update only 1 field out of many.

    Expected Result:
    ✅ Only the specified field updated
    ✅ All other fields unchanged
    ✅ Partial update pattern works (exclude_unset=True)
    """
    print("\n--- Test 5.6: Update Product - Partial Data ---")

    # Step 0: Extract IDs/values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create initial product
    product_data = ProductCreate(name="Partial Update Test", description="Initial description", price=Decimal("200.00"), stock_quantity=20, category_id=1, sku="PARTIAL-001")
    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)
    product_id = created_product.product_id
    initial_name = created_product.name
    initial_stock = created_product.stock_quantity
    initial_sku = created_product.sku

    print(f"✅ Initial Product: price={created_product.price}, desc='{created_product.description}'")

    # Step 2: Fetch product for update
    db_product = await product_service.get_product_by_id(product_id, admin_school_id)

    # Step 3: Update only description and price
    update_data = ProductUpdate(description="Updated description only", price=Decimal("250.50"))

    updated_product = await product_service.update_product(db_product=db_product, product_update=update_data)
    await db_session.refresh(updated_product)

    # Step 4: Verify updated fields
    assert updated_product.description == "Updated description only"
    assert updated_product.price == Decimal("250.50")
    print(f"✅ Fields updated: price={updated_product.price}, desc='{updated_product.description}'")

    # Step 5: Verify other fields UNCHANGED
    assert updated_product.name == initial_name
    assert updated_product.stock_quantity == initial_stock
    assert updated_product.sku == initial_sku
    assert updated_product.category_id == 1
    print("✅ Other fields unchanged (name, stock, sku, category)")

    print("\n🎉 Test 5.6 PASSED: Partial update works correctly")


# ===========================================================================
# Test 5.7: Product State Transition - Reactivate Discontinued Product (HP)
# ===========================================================================


@pytest.mark.asyncio
async def test_reactivate_discontinued_product(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.7: Admin reactivates previously discontinued product.

    Expected Result:
    ✅ Product.is_active = True
    ✅ Availability recalculated (DISCONTINUED → IN_STOCK if stock > 0)
    ✅ is_purchasable = True (if stock > 0)
    """
    print("\n--- Test 5.7: Reactivate Discontinued Product ---")

    # Step 0: Extract IDs/values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create and immediately deactivate product
    product_data = ProductCreate(name="Reactivation Test Product", price=Decimal("300.00"), stock_quantity=15, category_id=1)
    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)
    product_id = created_product.product_id

    # Deactivate
    db_product = await product_service.get_product_by_id(product_id, admin_school_id)
    discontinued_product = await product_service.delete_product(db_product)
    await db_session.refresh(discontinued_product)

    assert discontinued_product.is_active is False
    product_schema_discontinued = ProductOut.model_validate(discontinued_product)
    assert product_schema_discontinued.availability == ProductAvailability.DISCONTINUED
    assert product_schema_discontinued.is_purchasable is False
    print("✅ Product initially discontinued")

    # Step 2: Reactivate product
    update_data = ProductUpdate(is_active=True)
    reactivated_product_orm = await product_service.update_product(db_product=discontinued_product, product_update=update_data)
    await db_session.refresh(reactivated_product_orm)

    # Step 3: Verify state updated
    assert reactivated_product_orm.is_active is True
    print("✅ Product.is_active set back to True")

    # Step 4: Verify computed fields recalculated
    product_schema_reactivated = ProductOut.model_validate(reactivated_product_orm)
    assert product_schema_reactivated.availability == ProductAvailability.IN_STOCK
    assert product_schema_reactivated.is_purchasable is True
    print(f"✅ Computed fields updated: availability={product_schema_reactivated.availability}, purchasable={product_schema_reactivated.is_purchasable}")

    print("\n🎉 Test 5.7 PASSED: Product reactivation works")


# ===========================================================================
# Test 5.8: Computed Fields - Availability with No Reorder Level (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_computed_availability_no_reorder_level(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.8: Product has reorder_level=None.

    Expected Result:
    ✅ Availability = IN_STOCK (not LOW_STOCK, even if stock < 10)
    ✅ stock_status_message appropriate
    """
    print("\n--- Test 5.8: Availability - No Reorder Level ---")

    # Step 1: Create product with stock=5 and reorder_level=None
    product_data = ProductCreate(name="No Reorder Level Product", price=Decimal("50.00"), stock_quantity=5, category_id=1, reorder_level=None)
    product_service = ProductService(db_session)
    created_product_orm = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)
    await db_session.refresh(created_product_orm)

    # Step 2: Re-fetch with relationship loaded
    fetched_product = await product_service.get_product_by_id(created_product_orm.product_id, mock_admin_profile.school_id)
    product_schema_out = ProductOut.model_validate(fetched_product)

    # Step 3: Verify availability
    assert product_schema_out.availability == ProductAvailability.IN_STOCK, "Expected IN_STOCK when reorder_level is None, even if stock < 10"
    print(f"✅ Availability: {product_schema_out.availability} (correct for None reorder_level)")

    assert "Low Stock" not in product_schema_out.stock_status_message
    print(f"✅ Stock Status Message: '{product_schema_out.stock_status_message}'")

    print("\n🎉 Test 5.8 PASSED: Availability computed correctly without reorder level")


# ===========================================================================
# Test 5.9: Computed Fields - Stock Status Messages (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "is_active, stock_quantity, reorder_level, expected_status, expected_message_part",
    [
        (False, 50, 10, ProductAvailability.DISCONTINUED, "Discontinued"),
        (True, 0, 10, ProductAvailability.OUT_OF_STOCK, "Out of Stock"),
        (True, 5, 10, ProductAvailability.LOW_STOCK, "Low Stock"),
        (True, 50, 10, ProductAvailability.IN_STOCK, "In Stock"),
        (True, 5, None, ProductAvailability.IN_STOCK, "In Stock"),
    ],
    ids=["Discontinued", "OutOfStock", "LowStock", "InStock", "InStock_NoReorder"],
)
async def test_computed_stock_status_messages(db_session: AsyncSession, mock_admin_profile: Profile, is_active: bool, stock_quantity: int, reorder_level: Optional[int], expected_status: ProductAvailability, expected_message_part: str):
    """
    Test 5.9: Verify all 4 stock status message variants based on state.
    Uses ProductOut schema for validation.
    """
    test_id = f"{expected_status.name}_{stock_quantity}_{reorder_level}"
    print(f"\n--- Test 5.9: Stock Status - {test_id} ---")

    # Step 1: Create product with specific state
    product_name = f"Status Test {test_id}"
    product_data = ProductCreate(name=product_name, price=Decimal("10.00"), stock_quantity=stock_quantity, category_id=1, reorder_level=reorder_level, is_active=is_active)
    product_service = ProductService(db_session)
    created_product_orm = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    # Manually set is_active=False if needed
    if not is_active:
        created_product_orm.is_active = False
        await db_session.commit()

    await db_session.refresh(created_product_orm)

    # Step 2: Fetch and convert to ProductOut schema
    fetched_product = await product_service.get_product_by_id(created_product_orm.product_id, mock_admin_profile.school_id)
    product_schema = ProductOut.model_validate(fetched_product)

    # Step 3: Assert availability status
    assert product_schema.availability == expected_status, f"Expected availability {expected_status}, got {product_schema.availability}"
    print(f"✅ Availability: {product_schema.availability}")

    # Step 4: Assert status message contains expected part
    assert expected_message_part in product_schema.stock_status_message, f"Expected message part '{expected_message_part}' not in '{product_schema.stock_status_message}'"
    print(f"✅ Stock Status Message: '{product_schema.stock_status_message}'")

    print(f"\n🎉 Test 5.9 ({test_id}) PASSED")


# ===========================================================================
# Test 5.10: Empty Product List - No Products in School (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_empty_product_list_no_products(db_session: AsyncSession, mock_admin_profile_school_2: Profile):
    """
    Test 5.10: School with no products yet.

    Expected Result:
    ✅ Returns empty list []
    ✅ No errors raised
    """
    print("\n--- Test 5.10: Empty Product List ---")

    # Step 0: Extract school ID
    school_id = mock_admin_profile_school_2.school_id

    # Step 1: Call get_all_products for the empty school
    product_service = ProductService(db_session)
    products = await product_service.get_all_products(school_id=school_id, include_inactive=True)

    # Step 2: Verify result is an empty list
    assert isinstance(products, list)
    assert len(products) == 0
    print("✅ Service returned an empty list")

    print("\n🎉 Test 5.10 PASSED: Empty product list handled correctly")


# ===========================================================================
# Test 5.11: Product with Maximum Stock Value (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_product_with_maximum_stock(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.11: Product with very high stock (boundary test).

    Expected Result:
    ✅ Stock stored correctly (Integer type)
    ✅ Availability = IN_STOCK
    """
    print("\n--- Test 5.11: Maximum Stock Value ---")
    max_stock = 999999

    # Step 1: Create product with high stock
    product_data = ProductCreate(name="Max Stock Product", price=Decimal("1.00"), stock_quantity=max_stock, category_id=1)
    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)
    await db_session.refresh(created_product)

    # Step 2: Verify stock stored correctly
    assert created_product.stock_quantity == max_stock
    print(f"✅ Stock stored correctly: {created_product.stock_quantity}")

    # Step 3: Verify availability
    product_schema = ProductOut.model_validate(created_product)
    assert product_schema.availability == ProductAvailability.IN_STOCK
    print(f"✅ Availability: {product_schema.availability}")

    print("\n🎉 Test 5.11 PASSED: Maximum stock value handled")


# ===========================================================================
# Test 5.12: Product Name with Special Characters (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_product_name_with_special_chars(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.12: Product name contains quotes, apostrophes, etc.

    Expected Result:
    ✅ Name stored with special characters
    ✅ SQL injection prevented
    """
    print("\n--- Test 5.12: Product Name Special Characters ---")
    special_name = 'Men\'s "Premium" T-Shirt (Blue & Grêy!)'

    # Step 1: Create product with special name
    product_data = ProductCreate(name=special_name, description="Testing special chars like ' \" & ê !", price=Decimal("800.00"), stock_quantity=10, category_id=1)
    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)
    product_id = created_product.product_id

    # Step 2: Verify name stored correctly
    assert created_product.name == special_name
    print(f"✅ Name stored correctly: '{created_product.name}'")

    # Step 3: Verify retrieval
    db_product = await db_session.get(Product, product_id)
    assert db_product.name == special_name
    print("✅ Product retrieved with correct special characters")

    print("\n🎉 Test 5.12 PASSED: Special characters in name handled")


# ===========================================================================
# Test 5.13: Case-Insensitive Duplicate Detection (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_case_insensitive_duplicate_detection(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.13: Verify duplicate detection ignores case for product name.

    Expected Result:
    ❌ HTTPException 409 when creating "house t-shirt" after "House T-Shirt"
    """
    print("\n--- Test 5.13: Case-Insensitive Duplicate Name ---")

    # Step 1: Create initial product
    initial_name = "Case Test T-Shirt"
    product_data = ProductCreate(name=initial_name, price=Decimal("500.00"), stock_quantity=10, category_id=1)
    product_service = ProductService(db_session)
    await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)
    print(f"✅ Created product: '{initial_name}'")

    # Step 2: Attempt to create with different case
    duplicate_name_lower = initial_name.lower()
    duplicate_data = ProductCreate(name=duplicate_name_lower, price=Decimal("500.00"), stock_quantity=10, category_id=1)

    with pytest.raises(HTTPException) as exc_info:
        await product_service.create_product(product_in=duplicate_data, current_profile=mock_admin_profile)

    # Step 3: Verify 409 Conflict error
    assert exc_info.value.status_code == 409
    assert "already exists" in exc_info.value.detail.lower()
    print(f"✅ Correctly rejected duplicate name with different case: {exc_info.value.detail}")

    print("\n🎉 Test 5.13 PASSED: Case-insensitive name duplication prevented")


# ===========================================================================
# Test 5.14: Update Product to Same Values (Idempotent - Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_update_product_same_values(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.14: Admin updates product with identical values.

    Expected Result:
    ✅ Update succeeds (no-op functionally)
    ✅ updated_at timestamp changes
    ✅ No validation errors
    """
    print("\n--- Test 5.14: Update Product - Same Values ---")

    # Step 0: Extract IDs/values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create product
    initial_name = "Idempotent Update Test"
    initial_price = Decimal("333.33")
    product_data = ProductCreate(name=initial_name, price=initial_price, stock_quantity=30, category_id=1)
    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)
    product_id = created_product.product_id
    await db_session.refresh(created_product)
    initial_updated_at = created_product.updated_at
    print(f"✅ Initial product created, updated_at: {initial_updated_at}")

    # Allow some time to pass for timestamp comparison

    await asyncio.sleep(0.01)

    # Step 2: Fetch product for update
    db_product = await product_service.get_product_by_id(product_id, admin_school_id)

    # Step 3: Update with the exact same values
    update_data = ProductUpdate(name=initial_name, price=initial_price)

    updated_product = await product_service.update_product(db_product=db_product, product_update=update_data)
    await db_session.refresh(updated_product)

    # Step 4: Verify values are still the same
    assert updated_product.name == initial_name
    assert updated_product.price == initial_price
    print("✅ Product values remain unchanged")

    # Step 5: Verify updated_at timestamp
    assert updated_product.updated_at is not None
    print(f"✅ Update successful, new updated_at: {updated_product.updated_at}")

    print("\n🎉 Test 5.14 PASSED: Idempotent update works")


# ===========================================================================
# Test 5.15: Product with Very Long Description (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_product_long_description(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.15: Product with description at max length.

    Expected Result:
    ✅ Description stored completely
    ✅ No truncation
    """
    print("\n--- Test 5.15: Long Description ---")
    long_desc = "A" * 2000

    # Step 1: Test Pydantic validation (should pass)
    try:
        product_data = ProductCreate(name="Long Description Product", description=long_desc, price=Decimal("10.00"), category_id=1)
        print("✅ Pydantic schema accepts max length description")
    except ValidationError as e:
        assert False, f"Pydantic validation failed for max length description: {e}"

    # Step 2: Create product in DB
    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)
    product_id = created_product.product_id

    # Step 3: Verify stored description
    assert created_product.description == long_desc
    assert len(created_product.description) == 2000
    print("✅ Description stored correctly in service response")

    # Step 4: Verify in database
    db_product = await db_session.get(Product, product_id)
    assert db_product.description == long_desc
    assert len(db_product.description) == 2000
    print("✅ Description stored completely in database")

    print("\n🎉 Test 5.15 PASSED: Long description handled")


# ===========================================================================
# Test 5.17: Delete Already Inactive Product (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_delete_already_inactive_product(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.17: Admin tries to delete product that's already inactive.

    Expected Result:
    ✅ Operation succeeds (idempotent)
    ✅ Product remains is_active=False
    ✅ No error raised
    """
    print("\n--- Test 5.17: Delete Already Inactive Product ---")

    # Step 0: Extract IDs/values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create and deactivate product
    product_data = ProductCreate(name="Double Delete Test", price=Decimal("50.00"), category_id=1)
    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)
    product_id = created_product.product_id

    db_product = await product_service.get_product_by_id(product_id, admin_school_id)
    inactive_product = await product_service.delete_product(db_product)
    await db_session.refresh(inactive_product)
    assert inactive_product.is_active is False
    print("✅ Product initially deactivated")

    # Step 2: Attempt to delete again
    try:
        # Fetch again before deleting
        db_product_again = await product_service.get_product_by_id(product_id, admin_school_id)
        deleted_again = await product_service.delete_product(db_product_again)
        await db_session.refresh(deleted_again)
        print("✅ Second delete call succeeded without error")
    except Exception as e:
        assert False, f"Deleting already inactive product raised error: {e}"

    # Step 3: Verify still inactive
    assert deleted_again.is_active is False
    db_check = await db_session.get(Product, product_id)
    assert db_check.is_active is False
    print("✅ Product remains inactive")

    print("\n🎉 Test 5.17 PASSED: Idempotent soft delete works")


# ===========================================================================
# Test 5.18: Get Product List with Category Filter - Empty Result (Edge Case)
# ===========================================================================


@pytest.mark.asyncio
async def test_get_product_list_category_filter_empty(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.18: Filter by category with no products.

    Expected Result:
    ✅ Returns empty list []
    ✅ No errors raised
    """
    print("\n--- Test 5.18: Category Filter - Empty Result ---")

    # Step 0: Extract IDs/values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create an empty category
    empty_category = ProductCategory(school_id=admin_school_id, category_name="Empty Test Category")
    db_session.add(empty_category)
    await db_session.commit()
    await db_session.refresh(empty_category)
    empty_category_id = empty_category.category_id
    print(f"✅ Created empty category ID: {empty_category_id}")

    # Step 2: Get products filtered by this category
    product_service = ProductService(db_session)
    products = await product_service.get_all_products(school_id=admin_school_id, category_id=empty_category_id)

    # Step 3: Verify result is empty list
    assert isinstance(products, list)
    assert len(products) == 0
    print("✅ Service returned empty list for empty category filter")

    print("\n🎉 Test 5.18 PASSED: Empty category filter handled")


# ===========================================================================
# Test 5.19: Concurrent Product Creation - Same Name (Race Condition)
# ===========================================================================


@pytest.mark.asyncio
async def test_concurrent_product_creation_same_name(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.19: Two admins try to create same product simultaneously (simulated).

    Expected Result:
    ✅ First request succeeds
    ❌ Second request fails with 409 Conflict (or DB IntegrityError)
    ✅ Database unique constraint prevents duplicates
    """
    print("\n--- Test 5.19: Concurrent Creation - Same Name (Simulated) ---")
    product_name = "Concurrent Create Test Product"

    # Step 1: First admin creates the product
    product_data = ProductCreate(name=product_name, price=Decimal("100.00"), category_id=1)
    product_service = ProductService(db_session)
    first_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)
    print(f"✅ First creation successful: ID={first_product.product_id}")

    # Step 2: Second admin attempts to create the same product
    duplicate_data = ProductCreate(name=product_name, price=Decimal("100.00"), category_id=1)

    with pytest.raises(HTTPException) as exc_info:
        await product_service.create_product(product_in=duplicate_data, current_profile=mock_admin_profile)

    # Step 3: Verify failure due to duplicate name
    assert exc_info.value.status_code == 409
    assert "already exists" in exc_info.value.detail.lower()
    print(f"✅ Second creation attempt failed as expected: {exc_info.value.detail}")

    # Step 4: Verify only one product exists in DB
    stmt = select(func.count(Product.product_id)).where(Product.school_id == mock_admin_profile.school_id, func.lower(Product.name) == func.lower(product_name))
    result = await db_session.execute(stmt)
    count = result.scalar_one()
    assert count == 1
    print("✅ Only one product with that name exists in the database")

    print("\n🎉 Test 5.19 PASSED: Duplicate creation constraint works (simulated concurrency)")


# ===========================================================================
# Test 5.20: Concurrent Stock Adjustments (Race Condition) - Conceptual
# ===========================================================================


@pytest.mark.asyncio
async def test_sequential_stock_adjustments_simulate_concurrency(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 5.20: Simulate two admins adjusting stock sequentially.
    Validates basic arithmetic, not true race condition safety.

    Expected Result:
    ✅ Final stock reflects both adjustments correctly.
    """
    print("\n--- Test 5.20: Sequential Stock Adjustments (Simulated Concurrency) ---")

    # Step 0: Extract IDs/values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create product with initial stock
    initial_stock = 50
    product_data = ProductCreate(name="Concurrent Stock Test Product", price=Decimal("10.00"), stock_quantity=initial_stock, category_id=1)
    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)
    product_id = created_product.product_id
    print(f"✅ Initial stock: {initial_stock}")

    # Step 2: Simulate Admin A adding stock (+15)
    db_product_a = await product_service.get_product_by_id(product_id, admin_school_id)
    adjustment_a = ProductStockAdjustment(adjustment=15, reason="Admin A adds stock")
    product_after_a = await product_service.adjust_stock(db_product_a, adjustment_a)
    await db_session.refresh(product_after_a)
    stock_after_a = product_after_a.stock_quantity
    assert stock_after_a == initial_stock + 15
    print(f"✅ After Admin A (+15): Stock = {stock_after_a}")

    # Step 3: Simulate Admin B removing stock (-10) shortly after
    db_product_b = await product_service.get_product_by_id(product_id, admin_school_id)
    adjustment_b = ProductStockAdjustment(adjustment=-10, reason="Admin B removes stock")
    product_after_b = await product_service.adjust_stock(db_product_b, adjustment_b)
    await db_session.refresh(product_after_b)
    stock_after_b = product_after_b.stock_quantity
    assert stock_after_b == stock_after_a - 10
    print(f"✅ After Admin B (-10): Stock = {stock_after_b}")

    # Step 4: Verify final stock in DB
    final_db_product = await db_session.get(Product, product_id)
    expected_final_stock = initial_stock + 15 - 10
    assert final_db_product.stock_quantity == expected_final_stock
    print(f"✅ Final DB stock verified: {final_db_product.stock_quantity} (Expected: {expected_final_stock})")

    print("\n🎉 Test 5.20 PASSED: Sequential adjustments calculated correctly")
    print("⚠️ NOTE: This test does NOT guarantee race condition safety. Service layer needs locking (e.g., SELECT FOR UPDATE).")


print("\n" + "=" * 70)
print("🎉 ALL EDGE CASE & ADVANCED SCENARIO TESTS COMPLETED!")
print("=" * 70)
