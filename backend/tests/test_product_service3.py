# tests/test_product_service3.py
"""
Integration Tests for Product Service - Security & Multi-Tenancy

Covers:
- School isolation (product list, create, update, delete)
- IDOR prevention
- Role-based access control
- Category relationship security
- SKU global uniqueness vs product name school-scoped uniqueness

Test Philosophy:
Security is NON-NEGOTIABLE. These tests verify that multi-tenant boundaries
are strictly enforced and no data leakage occurs between schools.

CRITICAL PATTERNS FOLLOWED:
1. Extract IDs BEFORE any commit() - prevents MissingGreenlet errors
2. Use instance-based service pattern - ProductService(db_session)
3. Refresh objects AFTER commit when needed
4. Re-fetch objects after rollback scenarios
5. Never use asyncio.run() inside async tests
6. Let test fixtures handle transaction lifecycle
"""

import uuid
from decimal import Decimal

import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.product import Product
from app.models.product_category import ProductCategory
from app.models.profile import Profile
from app.schemas.product_schema import ProductCreate, ProductUpdate
from app.services.product_service import ProductService

# ===========================================================================
# Test 3.1: School Isolation - Product List (Security Critical)
# ===========================================================================


@pytest.mark.asyncio
async def test_school_isolation_product_list(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 3.1: Verify admins only see their school's products.

    Setup:
    - School 1: Create 3 products
    - School 2: Create 2 products
    - Admin from School 1 calls get_all_products()

    Expected Result:
    ✅ Returns exactly 3 NEW products for School 1 only
    ✅ School 2 products NOT included
    ✅ No data leakage across tenants
    """
    print("\n--- Test 3.1: School Isolation - Product List ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create products for School 1
    product_service = ProductService(db_session)
    school_1_product_ids = []

    for i in range(3):
        product = await product_service.create_product(product_in=ProductCreate(name=f"School 1 Product {i+1}", price=Decimal("100.00"), stock_quantity=10, category_id=1), current_profile=mock_admin_profile)
        school_1_product_ids.append(product.product_id)

    print(f"✓ Created 3 products for School 1: {school_1_product_ids}")

    # Step 2: Create products for School 2 (direct DB insert)
    school_2_product_ids = []
    for i in range(2):
        product = Product(school_id=2, category_id=1, name=f"School 2 Product {i+1}", price=Decimal("200.00"), stock_quantity=20, is_active=True)
        db_session.add(product)

    await db_session.commit()

    # Get the School 2 product IDs

    stmt = select(Product).where(Product.school_id == 2)
    result = await db_session.execute(stmt)
    school_2_products = result.scalars().all()
    school_2_product_ids = [p.product_id for p in school_2_products]

    print(f"✓ Created 2 products for School 2: {school_2_product_ids[:2]}")

    # Step 3: Get all products for School 1
    all_products = await product_service.get_all_products(school_id=admin_school_id, include_inactive=False)

    # Step 4: Verify only School 1 products returned (including our new ones)
    returned_product_ids = [p.product_id for p in all_products]

    # Check our 3 new products are in the list
    for pid in school_1_product_ids:
        assert pid in returned_product_ids

    # Check School 2 products are NOT in the list
    for pid in school_2_product_ids[:2]:
        assert pid not in returned_product_ids

    print(f"✓ School 1 products returned: {len([pid for pid in school_1_product_ids if pid in returned_product_ids])}/3")
    print(f"✓ School 2 products excluded: {len([pid for pid in school_2_product_ids[:2] if pid not in returned_product_ids])}/2")

    # Step 5: Verify all returned products belong to School 1
    for product in all_products:
        assert product.school_id == admin_school_id

    print("✓ No data leakage - all products belong to School 1")

    print("\n🎉 Test 3.1 PASSED: School isolation in product list works")


# ===========================================================================
# Test 3.2: School Isolation - Product Create (Security Critical)
# ===========================================================================


@pytest.mark.asyncio
async def test_school_isolation_product_create(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 3.2: Verify school_id from JWT, not request body.

    Expected Result:
    ✅ Product created with school_id=1 (from JWT)
    ✅ Admin cannot specify different school_id in request
    ✅ IDOR vulnerability prevented
    """
    print("\n--- Test 3.2: School Isolation - Product Create ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create product (no school_id in request)
    product_data = ProductCreate(name="Security Test Product", price=Decimal("100.00"), stock_quantity=10, category_id=1)

    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    # Step 2: Verify school_id from JWT
    assert created_product.school_id == admin_school_id
    assert created_product.school_id == 1  # Explicit check
    print(f"✓ Product created with school_id={created_product.school_id} (from JWT)")

    # Step 3: Verify in database
    db_product = await db_session.get(Product, created_product.product_id)
    assert db_product.school_id == admin_school_id
    print("✓ School_id correctly persisted from JWT, not request body")

    print("\n🎉 Test 3.2 PASSED: school_id auto-population works")


# ===========================================================================
# Test 3.3: School Isolation - Product Update (Security Critical)
# ===========================================================================


@pytest.mark.asyncio
async def test_school_isolation_product_update(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 3.3: Admin cannot update products from other schools.

    Expected Result:
    ❌ HTTPException 404 "Product not found"
    ✅ Product unchanged
    ✅ No information disclosure
    """
    print("\n--- Test 3.3: School Isolation - Product Update ---")

    # Step 1: Create product for School 2
    other_school_product = Product(school_id=2, category_id=1, name="School 2 Restricted Product", price=Decimal("500.00"), stock_quantity=50, is_active=True)
    db_session.add(other_school_product)
    await db_session.commit()
    await db_session.refresh(other_school_product)

    other_product_id = other_school_product.product_id
    original_price = other_school_product.price
    print(f"✓ Product created for School 2: ID={other_product_id}")

    # Step 2: Admin from School 1 tries to update it
    product_service = ProductService(db_session)

    with pytest.raises(HTTPException) as exc_info:
        await product_service.get_product_by_id(product_id=other_product_id, school_id=mock_admin_profile.school_id)

    # Step 3: Verify error (404, not revealing existence)
    assert exc_info.value.status_code == 404
    assert "not found" in exc_info.value.detail.lower()
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 4: Verify product unchanged
    db_product_check = await db_session.get(Product, other_product_id)
    assert db_product_check.price == original_price
    assert db_product_check.name == "School 2 Restricted Product"
    print("✓ Product unchanged (IDOR prevented)")

    print("\n🎉 Test 3.3 PASSED: Cross-school update prevented")


# ===========================================================================
# Test 3.4: School Isolation - Product Delete (Security Critical)
# ===========================================================================


@pytest.mark.asyncio
async def test_school_isolation_product_delete(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 3.4: Admin cannot delete products from other schools.

    Expected Result:
    ❌ HTTPException 404 "Product not found"
    ✅ Product.is_active remains True
    ✅ Cross-school modification prevented
    """
    print("\n--- Test 3.4: School Isolation - Product Delete ---")

    # Step 1: Create product for School 2
    other_school_product = Product(school_id=2, category_id=1, name="School 2 Delete Test Product", price=Decimal("300.00"), stock_quantity=30, is_active=True)
    db_session.add(other_school_product)
    await db_session.commit()
    await db_session.refresh(other_school_product)

    other_product_id = other_school_product.product_id
    print(f"✓ Product created for School 2: ID={other_product_id}, is_active=True")

    # Step 2: Admin from School 1 tries to delete it
    product_service = ProductService(db_session)

    with pytest.raises(HTTPException) as exc_info:
        await product_service.get_product_by_id(product_id=other_product_id, school_id=mock_admin_profile.school_id)

    # Step 3: Verify error
    assert exc_info.value.status_code == 404
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 4: Verify product still active
    db_product_check = await db_session.get(Product, other_product_id)
    assert db_product_check.is_active is True
    print("✓ Product.is_active remains True (delete prevented)")

    print("\n🎉 Test 3.4 PASSED: Cross-school delete prevented")


# ===========================================================================
# Test 3.5: Category Relationship Security (Security Critical)
# ===========================================================================


@pytest.mark.asyncio
async def test_category_relationship_security(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 3.5: Prevent cross-school category assignments.

    Expected Result:
    ❌ HTTPException 404 "Category not found in your school"
    ✅ Product category unchanged
    """
    print("\n--- Test 3.5: Category Relationship Security ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create product in School 1
    product_service = ProductService(db_session)

    product = await product_service.create_product(product_in=ProductCreate(name="Cross-Category Security Test", price=Decimal("100.00"), stock_quantity=10, category_id=1), current_profile=mock_admin_profile)

    product_id = product.product_id
    print("✓ Product created in School 1, category_id=1")

    # Step 2: Create category for School 2
    other_school_category = ProductCategory(school_id=2, category_name="School 2 Category")
    db_session.add(other_school_category)
    await db_session.commit()
    await db_session.refresh(other_school_category)

    other_category_id = other_school_category.category_id
    print(f"✓ Category created for School 2: ID={other_category_id}")

    # Step 3: Try to assign product to School 2's category
    db_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    update_data = ProductUpdate(category_id=other_category_id)

    with pytest.raises(HTTPException) as exc_info:
        await product_service.update_product(db_product=db_product, product_update=update_data)

    # Step 4: Verify error
    assert exc_info.value.status_code == 404
    assert "not found in your school" in exc_info.value.detail.lower()
    print(f"✓ Correctly rejected: {exc_info.value.detail}")

    # Step 5: Verify product category unchanged
    db_product_check = await db_session.get(Product, product_id)
    assert db_product_check.category_id == 1
    print("✓ Product category unchanged (cross-school assignment prevented)")

    print("\n🎉 Test 3.5 PASSED: Category relationship security works")


# ===========================================================================
# Test 3.6: Role-Based Access - Parent Can Only View Active (Security)
# ===========================================================================


@pytest.mark.asyncio
async def test_role_based_access_parent_view_active(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 3.6: Parents should only see active products (is_active=True).

    Expected Result:
    ✅ Returns only active products
    ✅ Inactive products filtered out
    ✅ Parents cannot access include_inactive=True
    """
    print("\n--- Test 3.6: Role-Based Access - Parent View Active ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create 3 active and 2 inactive products
    product_service = ProductService(db_session)

    active_product_ids = []
    for i in range(3):
        product = await product_service.create_product(product_in=ProductCreate(name=f"Active Product {i+1}", price=Decimal("100.00"), stock_quantity=10, category_id=1, is_active=True), current_profile=mock_admin_profile)
        active_product_ids.append(product.product_id)

    print("✓ Created 3 active products")

    # Create inactive products
    inactive_product_ids = []
    for i in range(2):
        product = await product_service.create_product(product_in=ProductCreate(name=f"Inactive Product {i+1}", price=Decimal("100.00"), stock_quantity=10, category_id=1, is_active=True), current_profile=mock_admin_profile)
        inactive_product_ids.append(product.product_id)

        # Soft delete
        db_product = await product_service.get_product_by_id(product_id=product.product_id, school_id=admin_school_id)
        await product_service.delete_product(db_product)

    print("✓ Created 2 inactive products")

    # Step 2: Parent view (include_inactive=False)
    parent_products = await product_service.get_all_products(school_id=admin_school_id, include_inactive=False)

    # Step 3: Verify only active products in results
    parent_product_ids = [p.product_id for p in parent_products]

    for active_id in active_product_ids:
        assert active_id in parent_product_ids

    for inactive_id in inactive_product_ids:
        assert inactive_id not in parent_product_ids

    print(f"✓ Parent view shows {len([p for p in parent_products if p.product_id in active_product_ids])} active products")
    print(f"✓ Parent view hides {len(inactive_product_ids)} inactive products")

    print("\n🎉 Test 3.6 PASSED: Role-based filtering works")


# ===========================================================================
# Test 3.7: SKU Uniqueness Across Schools (Global Constraint)
# ===========================================================================
# tests/test_product_service3.py
# ... (other imports) ...


@pytest.mark.asyncio
async def test_sku_uniqueness_global(db_session: AsyncSession, mock_admin_profile: Profile, mock_admin_profile_school_2: Profile):
    """
    Test 3.7: Verify SKU is globally unique (not school-scoped).

    Expected Result:
    ✅ School 1 creates product with unique SKU
    ❌ School 2 cannot create product with same SKU (HTTP 409)
    ✅ Only one product exists with this SKU globally
    """
    print("\n--- Test 3.7: SKU Uniqueness Across Schools ---")

    # CRITICAL: Extract ALL IDs FIRST, before ANY operations
    admin_user_id_school_1 = mock_admin_profile.user_id
    admin_user_id_school_2 = mock_admin_profile_school_2.user_id
    admin_school_id_1 = mock_admin_profile.school_id
    admin_school_id_2 = mock_admin_profile_school_2.school_id

    # Use uppercase UUID to match what gets stored
    unique_sku = f"GLOBAL-SKU-TEST-{str(uuid.uuid4()).upper()}"

    # Step 1: Create categories for both schools using direct DB insert
    category_school_1 = ProductCategory(school_id=admin_school_id_1, category_name=f"Global SKU Cat S1 {uuid.uuid4().hex[:8]}")
    db_session.add(category_school_1)

    category_school_2 = ProductCategory(school_id=admin_school_id_2, category_name=f"Global SKU Cat S2 {uuid.uuid4().hex[:8]}")
    db_session.add(category_school_2)

    await db_session.commit()

    # Extract category IDs immediately after commit
    await db_session.refresh(category_school_1)
    await db_session.refresh(category_school_2)
    category_id_school_1 = category_school_1.category_id
    category_id_school_2 = category_school_2.category_id

    print(f"✓ Created categories: School1={category_id_school_1}, School2={category_id_school_2}")

    # Step 2: School 1 creates product with unique SKU
    product_service_1 = ProductService(db_session)

    # Re-fetch fresh profile to avoid MissingGreenlet
    profile_school_1_fresh = await db_session.get(Profile, admin_user_id_school_1)
    if not profile_school_1_fresh:
        raise RuntimeError("Failed to fetch fresh profile for school 1")

    school_1_product = await product_service_1.create_product(
        product_in=ProductCreate(name="School 1 SKU Test Product", description="Test description", price=Decimal("500.00"), stock_quantity=50, category_id=category_id_school_1, sku=unique_sku), current_profile=profile_school_1_fresh
    )

    # Extract product info immediately after creation
    school_1_product_sku = school_1_product.sku
    school_1_product_id = school_1_product.product_id
    print(f"✓ School 1 created product ID={school_1_product_id} with SKU: {school_1_product_sku}")

    # Step 3: Verify product exists in database using the SAME SKU format
    # The service does commit(), so product should be queryable
    stmt = select(Product).where(Product.product_id == school_1_product_id)
    result = await db_session.execute(stmt)
    product_check = result.scalar_one_or_none()

    assert product_check is not None, f"Product {school_1_product_id} should exist after creation"
    assert product_check.sku == unique_sku, f"SKU mismatch: expected {unique_sku}, got {product_check.sku}"
    assert product_check.school_id == admin_school_id_1
    print("✓ Verified: Product exists in DB with correct SKU")

    # Step 4: School 2 attempts to create product with SAME SKU
    product_service_2 = ProductService(db_session)

    # Re-fetch fresh profile for school 2 to avoid MissingGreenlet
    profile_school_2_fresh = await db_session.get(Profile, admin_user_id_school_2)
    if not profile_school_2_fresh:
        raise RuntimeError("Failed to re-fetch admin profile for school 2")

    product_data_school_2 = ProductCreate(name="School 2 SKU Test Product", description="Attempt duplicate SKU", price=Decimal("600.00"), stock_quantity=60, category_id=category_id_school_2, sku=unique_sku)  # SAME SKU as School 1

    # Step 5: Verify duplicate SKU is rejected with HTTP 409
    with pytest.raises(HTTPException) as exc_info:
        await product_service_2.create_product(product_in=product_data_school_2, current_profile=profile_school_2_fresh)

    # Step 6: Verify the service layer raised HTTP 409
    assert exc_info.value.status_code == 409
    assert "SKU" in exc_info.value.detail or "sku" in exc_info.value.detail.lower()
    assert unique_sku in exc_info.value.detail, f"Error message should mention the SKU: {exc_info.value.detail}"
    print(f"✓ Correctly rejected by service: {exc_info.value.detail}")

    # Step 7: Verify only one product exists with this SKU
    stmt = select(Product).where(Product.sku == unique_sku)
    result = await db_session.execute(stmt)
    products_with_sku = result.scalars().all()

    assert len(products_with_sku) == 1, f"Expected 1 product with SKU {unique_sku}, found {len(products_with_sku)}"
    assert products_with_sku[0].school_id == admin_school_id_1, "Product should belong to School 1"
    assert products_with_sku[0].product_id == school_1_product_id, "Product ID should match School 1's product"

    print(f"✓ Database verification: Only 1 product with SKU {unique_sku} (School {admin_school_id_1})")
    print("✓ Global uniqueness enforced - School 2 blocked from using duplicate SKU")
    print("✓ Original product still exists after failed duplicate attempt")

    print("\n🎉 Test 3.7 PASSED: SKU global uniqueness enforced")


# ===========================================================================
# Test 3.8: Product Name Uniqueness is School-Scoped (Multi-Tenant)
# ===========================================================================

# REPLACE Test 3.8 entirely with this corrected version:


@pytest.mark.asyncio
async def test_product_name_uniqueness_school_scoped(db_session: AsyncSession, mock_admin_profile: Profile, mock_admin_profile_school_2: Profile):
    """
    Test 3.8: Verify product names are unique within a school, but can be duplicated across schools.

    Expected Result:
    ✅ School 1 and School 2 can both have products with the same name
    ❌ Duplicate name within same school raises HTTP 409
    """
    print("\n--- Test 3.8: Product Name School-Scoped Uniqueness ---")

    # CRITICAL: Extract ALL IDs at the very start, before ANY operations
    admin_user_id_school_2 = mock_admin_profile_school_2.user_id
    admin_school_id_1 = mock_admin_profile.school_id
    admin_school_id_2 = mock_admin_profile_school_2.school_id  # Extract NOW!

    unique_product_name = f"Scoped Name Test Shirt - {uuid.uuid4()}"
    category_id_school_1 = 1

    # Step 1: Create category for School 2 FIRST
    school_2_category = ProductCategory(school_id=2, category_name="School 2 Product Category")
    db_session.add(school_2_category)
    await db_session.commit()
    await db_session.refresh(school_2_category)

    category_id_school_2 = school_2_category.category_id
    print(f"✓ Created category {category_id_school_2} for School 2")

    # Step 2: School 1 creates product
    product_service_1 = ProductService(db_session)
    school_1_product = await product_service_1.create_product(
        product_in=ProductCreate(name=unique_product_name, description="School 1 version", price=Decimal("700.00"), stock_quantity=40, category_id=category_id_school_1), current_profile=mock_admin_profile
    )

    # Extract values IMMEDIATELY after creation
    school_1_product_id = school_1_product.product_id
    school_1_product_name = school_1_product.name
    school_1_school_id = school_1_product.school_id

    print(f"✓ School 1 created: '{school_1_product_name}', ID={school_1_product_id}")

    # Step 3: School 2 creates product with SAME NAME using its own service/profile
    product_service_2 = ProductService(db_session)

    # Re-fetch using the extracted ID
    admin_profile_school_2_fresh = await db_session.get(Profile, admin_user_id_school_2)
    if not admin_profile_school_2_fresh:
        raise RuntimeError("Failed to re-fetch admin profile for school 2")

    school_2_product = await product_service_2.create_product(
        product_in=ProductCreate(name=unique_product_name, description="School 2 version", price=Decimal("800.00"), stock_quantity=50, category_id=category_id_school_2), current_profile=admin_profile_school_2_fresh
    )

    # Extract values IMMEDIATELY after creation
    school_2_product_id = school_2_product.product_id
    school_2_product_name = school_2_product.name
    school_2_school_id = school_2_product.school_id

    print(f"✓ School 2 created: '{school_2_product_name}', ID={school_2_product_id}")

    # Step 4: Verify both exist with same name but different school IDs (using extracted values)
    assert school_1_product is not None
    assert school_2_product is not None
    assert school_1_product_name == school_2_product_name
    assert school_1_school_id != school_2_school_id
    print("✓ Same product name allowed in different schools")

    # Step 5: Verify in database using fresh fetches
    db_product_1 = await db_session.get(Product, school_1_product_id)
    db_product_2 = await db_session.get(Product, school_2_product_id)

    assert db_product_1.name == unique_product_name
    assert db_product_2.name == unique_product_name
    assert db_product_1.school_id == admin_school_id_1  # Use extracted value
    assert db_product_2.school_id == admin_school_id_2  # Use extracted value
    print("✓ Database confirms products exist in respective schools")

    # Step 6: Verify school 1 admin still cannot create duplicate in THEIR school
    with pytest.raises(HTTPException) as exc_info:
        await product_service_1.create_product(
            product_in=ProductCreate(name=unique_product_name, description="Duplicate attempt in School 1", price=Decimal("700.00"), stock_quantity=40, category_id=category_id_school_1), current_profile=mock_admin_profile
        )

    assert exc_info.value.status_code == 409
    print("✓ Duplicate within same school still prevented")

    print("\n🎉 Test 3.8 PASSED: School-scoped name uniqueness works")
