# tests/test_product_service2.py - FIXED VERSION
"""
Integration Tests for Product Service - Validation & Constraints (Sad Paths)

Covers:
- Duplicate name/SKU validation
- Category validation (existence, ownership)
- Price and stock validation
- Invalid field formats
- Update conflicts
- Delete restrictions (packages)
- Stock adjustment constraints
- Bulk operation failures

CRITICAL PATTERNS FOLLOWED:
1. Extract IDs BEFORE any commit()
2. Use instance-based service pattern
3. Refresh objects AFTER commit when needed
4. Re-fetch objects after rollback scenarios
5. Never use asyncio.run() inside async tests
6. Let test fixtures handle transaction lifecycle
"""

import uuid
from decimal import Decimal

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.product import Product
from app.models.product_category import ProductCategory
from app.models.product_package import PackageItem, ProductPackage
from app.models.profile import Profile
from app.schemas.product_schema import ProductCreate, ProductStockAdjustment, ProductUpdate
from app.services.product_service import ProductService

# ===========================================================================
# Test 2.1: Create Product Fails - Duplicate Name in School (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_create_product_fails_duplicate_name(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.1: Admin tries to create product with existing name.

    Expected Result:
    ❌ HTTPException 409 "Product 'X' already exists in your school"
    ✅ Only original product exists in database
    """
    print("\n--- Test 2.1: Create Product Fails - Duplicate Name ---")

    # Use a unique name for this test
    unique_product_name = f"Duplicate Name Test Shirt - {uuid.uuid4()}"

    # Step 1: Create first product
    product_data = ProductCreate(
        name=unique_product_name,
        price=Decimal("750.00"),
        stock_quantity=100,
        category_id=1,
        description="Test description",
    )

    product_service = ProductService(db_session)
    first_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    first_product_id = first_product.product_id
    print(f"✓ First product created: '{unique_product_name}', ID={first_product_id}")

    # Step 2: Attempt to create duplicate
    duplicate_data = ProductCreate(
        name=unique_product_name,
        price=Decimal("800.00"),
        stock_quantity=50,
        category_id=1,
        description="Duplicate attempt",
    )

    with pytest.raises(HTTPException) as exc_info:
        await product_service.create_product(product_in=duplicate_data, current_profile=mock_admin_profile)

    # Step 3: Verify error details
    assert exc_info.value.status_code == 409
    assert "already exists" in exc_info.value.detail.lower()
    assert unique_product_name in exc_info.value.detail
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 4: Verify only 1 product exists
    stmt = select(Product).where(
        Product.school_id == mock_admin_profile.school_id,
        func.lower(Product.name) == unique_product_name.lower(),
    )
    result = await db_session.execute(stmt)
    products = result.scalars().all()

    assert len(products) == 1
    assert products[0].product_id == first_product_id
    print("✓ Only original product exists")

    print("\n🎉 Test 2.1 PASSED: Duplicate name validation works")


# ===========================================================================
# Test 2.2: Create Product Fails - Duplicate SKU (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_create_product_fails_duplicate_sku(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.2: Admin tries to create product with globally used SKU.

    Expected Result:
    ❌ HTTPException 409 "SKU 'UNIFORM-001' is already in use"
    ✅ SKU uniqueness enforced globally (not school-scoped)
    """
    print("\n--- Test 2.2: Create Product Fails - Duplicate SKU ---")

    # Step 1: Create first product with SKU
    product_data = ProductCreate(name="First Product with SKU", price=Decimal("500.00"), stock_quantity=50, category_id=1, sku="UNIFORM-001")

    product_service = ProductService(db_session)
    first_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    print(f"✓ First product created with SKU: {first_product.sku}")

    # Step 2: Attempt to create product with same SKU
    duplicate_sku_data = ProductCreate(name="Second Product Different Name", price=Decimal("600.00"), stock_quantity=30, category_id=1, sku="UNIFORM-001")

    with pytest.raises(HTTPException) as exc_info:
        await product_service.create_product(product_in=duplicate_sku_data, current_profile=mock_admin_profile)

    # Step 3: Verify error details
    assert exc_info.value.status_code == 409
    assert "SKU" in exc_info.value.detail
    assert "already in use" in exc_info.value.detail.lower()
    assert "UNIFORM-001" in exc_info.value.detail
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    print("\n🎉 Test 2.2 PASSED: Duplicate SKU validation works")


# ===========================================================================
# Test 2.3: Create Product Fails - Category Not Found (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_create_product_fails_category_not_found(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.3: Admin tries to create product with non-existent category.

    Expected Result:
    ❌ HTTPException 404 "Category with ID 99999 not found in your school"
    """
    print("\n--- Test 2.3: Create Product Fails - Category Not Found ---")

    # Step 1: Attempt to create product with non-existent category
    product_data = ProductCreate(name="Product with Invalid Category", price=Decimal("100.00"), stock_quantity=10, category_id=99999)

    product_service = ProductService(db_session)

    with pytest.raises(HTTPException) as exc_info:
        await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    # Step 2: Verify error details
    assert exc_info.value.status_code == 404
    assert "Category" in exc_info.value.detail
    assert "99999" in exc_info.value.detail
    assert "not found" in exc_info.value.detail.lower()
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    print("\n🎉 Test 2.3 PASSED: Category validation works")


# ===========================================================================
# Test 2.4: Create Product Fails - Category from Different School (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_create_product_fails_category_wrong_school(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.4: Admin tries to use category from another school.

    Expected Result:
    ❌ HTTPException 404 "Category not found in your school"
    ✅ Prevents cross-school data access (IDOR protection)
    """
    print("\n--- Test 2.4: Create Product - Category from Wrong School ---")

    # Step 1: Create category for different school (school_id=2)
    other_school_category = ProductCategory(school_id=2, category_name="Other School Category")
    db_session.add(other_school_category)
    await db_session.commit()
    await db_session.refresh(other_school_category)

    other_category_id = other_school_category.category_id
    print(f"✓ Created category for school_id=2: ID={other_category_id}")

    # Step 2: Admin from school_id=1 tries to use it
    product_data = ProductCreate(name="Cross-School Category Test", price=Decimal("100.00"), stock_quantity=10, category_id=other_category_id)

    product_service = ProductService(db_session)

    with pytest.raises(HTTPException) as exc_info:
        await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    # Step 3: Verify error (should be 404, not revealing existence)
    assert exc_info.value.status_code == 404
    assert "not found in your school" in exc_info.value.detail.lower()
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    print("\n🎉 Test 2.4 PASSED: Cross-school category prevention works")


# ===========================================================================
# Test 2.5: Create Product Fails - Invalid Price (Sad Path)  - FIXED
# ===========================================================================


@pytest.mark.asyncio
async def test_create_product_fails_invalid_price(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.5: Admin tries to create product with price=0 or negative.

    Expected Result:
    ❌ Pydantic ValidationError "Price must be positive"
    """
    print("\n--- Test 2.5: Create Product - Invalid Price ---")

    # Test 1: Price = 0
    print("\nTest: price=0")
    with pytest.raises(ValidationError) as exc_info:
        ProductCreate(name="Zero Price Product", price=Decimal("0.00"), stock_quantity=10, category_id=1)

    error_str = str(exc_info.value)
    assert "price" in error_str.lower()
    print(f"✓ Correctly rejected price=0: {error_str[:100]}...")

    # Test 2: Negative price
    print("\nTest: price=-100")
    with pytest.raises(ValidationError) as exc_info:
        ProductCreate(name="Negative Price Product", price=Decimal("-100.00"), stock_quantity=10, category_id=1)

    error_str = str(exc_info.value)
    assert "price" in error_str.lower()
    print(f"✓ Correctly rejected negative price: {error_str[:100]}...")

    print("\n🎉 Test 2.5 PASSED: Price validation works")


# ===========================================================================
# Test 2.6: Create Product Fails - Negative Stock (Sad Path) - FIXED
# ===========================================================================


@pytest.mark.asyncio
async def test_create_product_fails_negative_stock(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.6: Admin tries to create product with negative stock.

    Expected Result:
    ❌ Pydantic ValidationError "Stock quantity must be non-negative"
    """
    print("\n--- Test 2.6: Create Product - Negative Stock ---")

    with pytest.raises(ValidationError) as exc_info:
        ProductCreate(name="Negative Stock Product", price=Decimal("100.00"), stock_quantity=-10, category_id=1)

    error_str = str(exc_info.value)
    assert "stock" in error_str.lower() or "quantity" in error_str.lower()
    print(f"✓ Correctly rejected: {error_str[:100]}...")

    print("\n🎉 Test 2.6 PASSED: Stock validation works")


# ===========================================================================
# Test 2.7: Create Product Fails - Invalid SKU Format (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_create_product_fails_invalid_sku_format(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.7: Admin provides SKU with invalid special characters.

    Expected Result:
    ❌ Pydantic ValidationError about SKU format
    """
    print("\n--- Test 2.7: Create Product - Invalid SKU Format ---")

    with pytest.raises(ValidationError) as exc_info:
        ProductCreate(name="Invalid SKU Product", price=Decimal("100.00"), stock_quantity=10, category_id=1, sku="UNIFORM@123!")  # Contains @ and !

    error_str = str(exc_info.value)
    assert "sku" in error_str.lower()
    print(f"✓ Correctly rejected: {error_str[:150]}...")

    print("\n🎉 Test 2.7 PASSED: SKU format validation works")


# ===========================================================================
# Test 2.8: Update Product Fails - New Name Conflicts (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_update_product_fails_name_conflict(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.8: Admin updates product name to existing product's name.

    Expected Result:
    ❌ HTTPException 409 "Product 'T-Shirt Blue' already exists"
    ✅ Product name unchanged
    """
    print("\n--- Test 2.8: Update Product - Name Conflict ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create two products
    product_service = ProductService(db_session)

    product_a = await product_service.create_product(product_in=ProductCreate(name="T-Shirt Blue", price=Decimal("750.00"), stock_quantity=50, category_id=1), current_profile=mock_admin_profile)

    product_b = await product_service.create_product(product_in=ProductCreate(name="T-Shirt Red", price=Decimal("750.00"), stock_quantity=50, category_id=1), current_profile=mock_admin_profile)

    product_b_id = product_b.product_id
    print(f"✓ Created Product A: '{product_a.name}'")
    print(f"✓ Created Product B: '{product_b.name}'")

    # Step 2: Fetch Product B for update
    db_product_b = await product_service.get_product_by_id(product_id=product_b_id, school_id=admin_school_id)

    # Step 3: Attempt to rename Product B to Product A's name
    update_data = ProductUpdate(name="T-Shirt Blue")

    with pytest.raises(HTTPException) as exc_info:
        await product_service.update_product(db_product=db_product_b, product_update=update_data)

    # Step 4: Verify error
    assert exc_info.value.status_code == 409
    assert "already exists" in exc_info.value.detail.lower()
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 5: Verify Product B name unchanged
    db_product_b_check = await db_session.get(Product, product_b_id)
    assert db_product_b_check.name == "T-Shirt Red"
    print("✓ Product B name unchanged")

    print("\n🎉 Test 2.8 PASSED: Update name conflict validation works")


# ===========================================================================
# Test 2.9: Update Product Fails - New SKU Conflicts (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_update_product_fails_sku_conflict(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.9: Admin updates SKU to already-used SKU.

    Expected Result:
    ❌ HTTPException 409 "SKU 'ABC-001' is already in use"
    """
    print("\n--- Test 2.9: Update Product - SKU Conflict ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create two products with different SKUs
    product_service = ProductService(db_session)

    product_a = await product_service.create_product(product_in=ProductCreate(name="Product A", price=Decimal("100.00"), stock_quantity=10, category_id=1, sku="ABC-001"), current_profile=mock_admin_profile)

    product_b = await product_service.create_product(product_in=ProductCreate(name="Product B", price=Decimal("100.00"), stock_quantity=10, category_id=1, sku="ABC-002"), current_profile=mock_admin_profile)

    product_b_id = product_b.product_id
    print(f"✓ Product A: SKU={product_a.sku}")
    print(f"✓ Product B: SKU={product_b.sku}")

    # Step 2: Fetch Product B for update
    db_product_b = await product_service.get_product_by_id(product_id=product_b_id, school_id=admin_school_id)

    # Step 3: Attempt to change Product B's SKU to Product A's SKU
    update_data = ProductUpdate(sku="ABC-001")

    with pytest.raises(HTTPException) as exc_info:
        await product_service.update_product(db_product=db_product_b, product_update=update_data)

    # Step 4: Verify error
    assert exc_info.value.status_code == 409
    assert "SKU" in exc_info.value.detail
    assert "already in use" in exc_info.value.detail.lower()
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    print("\n🎉 Test 2.9 PASSED: Update SKU conflict validation works")


# ===========================================================================
# Test 2.10: Update Product Fails - Category from Different School (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_update_product_fails_category_wrong_school(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.10: Admin tries to move product to category from another school.

    Expected Result:
    ❌ HTTPException 404 "Category not found in your school"
    """
    print("\n--- Test 2.10: Update Product - Category Wrong School ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create product
    product_service = ProductService(db_session)

    product = await product_service.create_product(product_in=ProductCreate(name="Test Product", price=Decimal("100.00"), stock_quantity=10, category_id=1), current_profile=mock_admin_profile)

    product_id = product.product_id
    print("✓ Product created in category 1")

    # Step 2: Create category for different school (use school_id=2)
    other_category = ProductCategory(school_id=2, category_name="Other School Category 2")
    db_session.add(other_category)
    await db_session.commit()
    await db_session.refresh(other_category)

    other_category_id = other_category.category_id
    print(f"✓ Created category for school_id=2: ID={other_category_id}")

    # Step 3: Fetch product for update
    db_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    # Step 4: Attempt to move to other school's category
    update_data = ProductUpdate(category_id=other_category_id)

    with pytest.raises(HTTPException) as exc_info:
        await product_service.update_product(db_product=db_product, product_update=update_data)

    # Step 5: Verify error
    assert exc_info.value.status_code == 404
    assert "not found in your school" in exc_info.value.detail.lower()
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    print("\n🎉 Test 2.10 PASSED: Cross-school category update prevented")


# ===========================================================================
# Test 2.11: Delete Product Fails - In Active Package (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_delete_product_fails_in_package(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.11: Admin tries to delete product that's in active package.

    Expected Result:
    ❌ HTTPException 400 "Cannot delete product that is part of X active packages"
    ✅ Product.is_active remains True
    """
    print("\n--- Test 2.11: Delete Product - In Active Package ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create product
    product_service = ProductService(db_session)

    product = await product_service.create_product(product_in=ProductCreate(name="Product In Package", price=Decimal("100.00"), stock_quantity=10, category_id=1), current_profile=mock_admin_profile)

    product_id = product.product_id
    print(f"✓ Product created: ID={product_id}")

    # Step 2: Create package with this product
    package = ProductPackage(school_id=admin_school_id, name="Test Package", price=Decimal("500.00"), is_active=True)
    db_session.add(package)
    await db_session.commit()
    await db_session.refresh(package)

    package_item = PackageItem(package_id=package.id, product_id=product_id, quantity=2)
    db_session.add(package_item)
    await db_session.commit()

    print("✓ Product added to active package")

    # Step 3: Fetch product for deletion
    db_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    # Step 4: Attempt to delete
    with pytest.raises(HTTPException) as exc_info:
        await product_service.delete_product(db_product)

    # Step 5: Verify error
    assert exc_info.value.status_code == 400
    assert "Cannot delete product" in exc_info.value.detail
    assert "package" in exc_info.value.detail.lower()
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 6: Verify product still active
    db_product_check = await db_session.get(Product, product_id)
    assert db_product_check.is_active is True
    print("✓ Product.is_active remains True")

    print("\n🎉 Test 2.11 PASSED: Package dependency check works")


# ===========================================================================
# Test 2.12: Adjust Stock Fails - Negative Result (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_adjust_stock_fails_negative_result(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.12: Admin tries to remove more stock than available.

    Expected Result:
    ❌ HTTPException 400 "Stock adjustment would result in negative stock"
    ✅ Stock remains at 5
    """
    print("\n--- Test 2.12: Adjust Stock - Negative Result ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create product with low stock
    product_service = ProductService(db_session)

    product = await product_service.create_product(product_in=ProductCreate(name="Low Stock Product", price=Decimal("100.00"), stock_quantity=5, category_id=1), current_profile=mock_admin_profile)

    product_id = product.product_id
    print("✓ Product created with stock=5")

    # Step 2: Fetch product for adjustment
    db_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    # Step 3: Attempt to remove 10 units (would result in -5)
    adjustment = ProductStockAdjustment(adjustment=-10, reason="Trying to remove too much")

    with pytest.raises(HTTPException) as exc_info:
        await product_service.adjust_stock(db_product=db_product, adjustment=adjustment)

    # Step 4: Verify error
    assert exc_info.value.status_code == 400
    assert "negative stock" in exc_info.value.detail.lower()
    assert "5" in exc_info.value.detail  # Current stock
    assert "-10" in exc_info.value.detail  # Adjustment
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 5: Verify stock unchanged
    db_product_check = await db_session.get(Product, product_id)
    assert db_product_check.stock_quantity == 5
    print("✓ Stock remains at 5")

    print("\n🎉 Test 2.12 PASSED: Negative stock prevention works")


# ===========================================================================
# Test 2.13: Get Product Fails - Wrong School (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_get_product_fails_wrong_school(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.13: Admin tries to access product from another school.

    Expected Result:
    ❌ HTTPException 404 "Product not found"
    ✅ Product details NOT leaked (multi-tenant security)
    """
    print("\n--- Test 2.13: Get Product - Wrong School ---")

    # Step 1: Create product for different school (use school_id=2)
    other_school_product = Product(school_id=2, category_id=1, name="Other School Product", price=Decimal("100.00"), stock_quantity=10, is_active=True)
    db_session.add(other_school_product)
    await db_session.commit()
    await db_session.refresh(other_school_product)

    other_product_id = other_school_product.product_id
    print(f"✓ Product created for school_id=2: ID={other_product_id}")

    # Step 2: Admin from school_id=1 tries to access it
    product_service = ProductService(db_session)

    with pytest.raises(HTTPException) as exc_info:
        await product_service.get_product_by_id(product_id=other_product_id, school_id=mock_admin_profile.school_id)

    # Step 3: Verify error (should be 404, not revealing details)
    assert exc_info.value.status_code == 404
    assert "not found" in exc_info.value.detail.lower()
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    print("\n🎉 Test 2.13 PASSED: Cross-school access prevented")


# ===========================================================================
# Test 2.14: Bulk Update Category Fails - Category Not Found (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_bulk_update_category_fails_invalid_category(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.14: Admin tries bulk update to non-existent category.

    Expected Result:
    ❌ HTTPException 404 "Category not found"
    ✅ No products updated (atomic transaction rollback)
    """
    print("\n--- Test 2.14: Bulk Update - Invalid Category ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create products
    product_service = ProductService(db_session)
    product_ids = []

    for i in range(2):
        product = await product_service.create_product(product_in=ProductCreate(name=f"Bulk Test {i}", price=Decimal("50.00"), stock_quantity=10, category_id=1), current_profile=mock_admin_profile)
        product_ids.append(product.product_id)

    print("✓ Created 2 products in category 1")

    # Step 2: Attempt bulk update to non-existent category
    with pytest.raises(HTTPException) as exc_info:
        await product_service.bulk_update_category(school_id=admin_school_id, product_ids=product_ids, new_category_id=99999)

    # Step 3: Verify error
    assert exc_info.value.status_code == 404
    assert "not found" in exc_info.value.detail.lower()
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 4: Verify all products still in category 1 (rollback worked)
    for product_id in product_ids:
        db_product = await db_session.get(Product, product_id)
        assert db_product.category_id == 1
    print("✓ All products remain in category 1 (atomic rollback)")

    print("\n🎉 Test 2.14 PASSED: Bulk update validation works")


# ===========================================================================
# Test 2.15: Bulk Update Category Fails - Product Not Found (Sad Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_bulk_update_category_fails_product_not_found(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 2.15: Admin includes non-existent product_id in bulk update.

    Expected Result:
    ❌ HTTPException 404 "Products not found: {99999}"
    ✅ No products updated (all-or-nothing)
    """
    print("\n--- Test 2.15: Bulk Update - Product Not Found ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create valid category 2
    category_2 = await db_session.get(ProductCategory, 2)
    if not category_2:
        category_2 = ProductCategory(school_id=admin_school_id, category_name="Test Category 2")
        db_session.add(category_2)
        await db_session.commit()
        await db_session.refresh(category_2)

    # Step 2: Create one valid product
    product_service = ProductService(db_session)

    product = await product_service.create_product(product_in=ProductCreate(name="Valid Product", price=Decimal("50.00"), stock_quantity=10, category_id=1), current_profile=mock_admin_profile)

    valid_product_id = product.product_id
    print(f"✓ Created valid product: ID={valid_product_id}")

    # Step 3: Attempt bulk update with valid + invalid IDs
    product_ids = [valid_product_id, 99999]

    with pytest.raises(HTTPException) as exc_info:
        await product_service.bulk_update_category(school_id=admin_school_id, product_ids=product_ids, new_category_id=2)

    # Step 4: Verify error mentions missing ID
    assert exc_info.value.status_code == 404
    assert "99999" in exc_info.value.detail
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 5: Verify valid product NOT updated (atomic failure)
    db_product = await db_session.get(Product, valid_product_id)
    assert db_product.category_id == 1  # Still in original category
    print("✓ Valid product not updated (atomic rollback)")

    print("\n🎉 Test 2.15 PASSED: Bulk update partial failure handled")


print("\n" + "=" * 70)
print("🎉 ALL VALIDATION & CONSTRAINT TESTS COMPLETED!")
print("=" * 70)
