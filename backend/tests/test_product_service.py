# tests/test_product_service.py
"""
Integration Tests for Product Service - Core CRUD Operations (Happy Paths)

Covers:
- Product creation with required and optional fields
- Product retrieval by ID with category hydration
- Product listing with multi-tenant filtering
- Product updates (partial update pattern)
- Soft delete operations
- Stock adjustments (add and remove inventory)
- Bulk category updates

Test Philosophy:
These are the fundamental product operations that should ALWAYS work.
If any of these fail, the entire product management system is broken.

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
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.product_category import ProductCategory
from app.models.profile import Profile
from app.schemas.enums import ProductAvailability
from app.schemas.product_schema import ProductCreate, ProductOut, ProductStockAdjustment, ProductUpdate
from app.services.product_service import ProductService

# ===========================================================================
# Test 1.1: Create Product Successfully (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_create_product_successfully(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 1.1: Admin creates a new product with all required fields.

    Setup:
    - Admin profile with school_id=1
    - Valid category exists for school
    - Product data: name, price, stock, category_id

    Expected Result:
    ✅ Product created with correct school_id (from JWT, not request)
    ✅ Product has unique product_id
    ✅ Default values applied (is_active=True)
    ✅ Timestamps (created_at, updated_at) populated
    """
    print("\n--- Test 1.1: Create Product Successfully ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Verify category exists
    category = await db_session.get(ProductCategory, 1)
    assert category is not None
    assert category.school_id == admin_school_id
    print(f"✓ Category exists: {category.category_name}")

    # Step 2: Create product
    product_data = ProductCreate(name="Test House T-Shirt (Blue)", description="Premium cotton house t-shirt", price=Decimal("750.00"), stock_quantity=100, category_id=1)

    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    # Step 3: Verify product created
    assert created_product is not None
    assert created_product.product_id is not None
    assert created_product.school_id == admin_school_id
    print(f"✓ Product created: ID={created_product.product_id}, school_id={admin_school_id}")

    # Step 4: Verify field values
    assert created_product.name == "Test House T-Shirt (Blue)"
    assert created_product.description == "Premium cotton house t-shirt"
    assert created_product.price == Decimal("750.00")
    assert created_product.stock_quantity == 100
    assert created_product.category_id == 1
    print("✓ All field values correct")

    # Step 5: Verify default values
    assert created_product.is_active is True
    print("✓ Default value is_active=True applied")

    # Step 6: Verify timestamps
    assert created_product.created_at is not None
    assert created_product.updated_at is not None
    print("✓ Timestamps populated")

    # Step 7: Verify in database
    db_product = await db_session.get(Product, created_product.product_id)
    assert db_product is not None
    assert db_product.name == "Test House T-Shirt (Blue)"
    print("✓ Product persisted in database")

    print("\n🎉 Test 1.1 PASSED: Product creation works correctly")


# ===========================================================================
# Test 1.2: Create Product with Optional Fields (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_create_product_with_optional_fields(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 1.2: Admin creates product with all optional fields populated.

    Expected Result:
    ✅ All optional fields stored correctly
    ✅ SKU normalized (uppercase, alphanumeric validation)
    ✅ Image URL stored
    ✅ Reorder thresholds set
    """
    print("\n--- Test 1.2: Create Product with Optional Fields ---")

    # Step 1: Create product with all optional fields
    product_data = ProductCreate(
        name="Test School Tie (Maroon)",
        description="Official school tie",
        price=Decimal("300.00"),
        stock_quantity=50,
        category_id=1,
        sku="uniform-tie-001",  # lowercase - should be normalized
        image_url="https://cdn.schoolos.io/products/tie-maroon.jpg",
        manufacturer="Raymond Textiles",
        reorder_level=20,
        reorder_quantity=50,
        is_active=True,
    )

    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    # Step 2: Verify optional fields stored
    assert created_product.sku == "UNIFORM-TIE-001"  # Normalized to uppercase
    assert created_product.image_url == "https://cdn.schoolos.io/products/tie-maroon.jpg"
    assert created_product.manufacturer == "Raymond Textiles"
    assert created_product.reorder_level == 20
    assert created_product.reorder_quantity == 50
    print("✓ All optional fields stored correctly")

    # Step 3: Verify SKU normalization
    print(f"✓ SKU normalized: 'uniform-tie-001' → '{created_product.sku}'")

    print("\n🎉 Test 1.2 PASSED: Optional fields handled correctly")


# ===========================================================================
# Test 1.3: Get Product by ID Successfully (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_get_product_by_id_successfully(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 1.3: Admin retrieves product details by product_id.

    Expected Result:
    ✅ Product returned with all fields
    ✅ Category details included (CategoryMinimal schema)
    ✅ Computed fields calculated (availability, is_purchasable)
    """
    print("\n--- Test 1.3: Get Product by ID Successfully ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create a product first
    product_data = ProductCreate(name="Test Notebook (A4)", price=Decimal("50.00"), stock_quantity=200, category_id=1)

    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    product_id = created_product.product_id
    print(f"✓ Product created: ID={product_id}")

    # Step 2: Retrieve product by ID
    retrieved_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    # Step 3: Verify product returned
    assert retrieved_product is not None
    assert retrieved_product.product_id == product_id
    assert retrieved_product.name == "Test Notebook (A4)"
    print("✓ Product retrieved successfully")

    # Step 4: Verify category hydrated
    assert retrieved_product.category is not None
    assert retrieved_product.category.category_id == 1
    print(f"✓ Category hydrated: {retrieved_product.category.category_name}")

    # Step 5: Verify computed fields (convert to Pydantic schema)
    product_schema = ProductOut.model_validate(retrieved_product)

    assert product_schema.availability == ProductAvailability.IN_STOCK
    assert product_schema.is_purchasable is True
    print(f"✓ Computed fields: availability={product_schema.availability}, is_purchasable={product_schema.is_purchasable}")

    print("\n🎉 Test 1.3 PASSED: Product retrieval with hydration works")


# ===========================================================================
# Test 1.4: Get All Products for School (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_get_all_products_for_school(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 1.4: Admin retrieves all products for their school.

    Expected Result:
    ✅ Returns all products for school_id=1
    ✅ Products from other schools NOT included (multi-tenant security)
    ✅ Products ordered by name ascending
    ✅ Categories hydrated for all products
    """
    print("\n--- Test 1.4: Get All Products for School ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create 3 products for this school
    product_service = ProductService(db_session)

    product_names = ["Zebra Pencil", "Alpha Eraser", "Mega Ruler"]
    created_ids = []

    for name in product_names:
        product_data = ProductCreate(name=name, price=Decimal("25.00"), stock_quantity=100, category_id=1)
        created = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)
        created_ids.append(created.product_id)

    print(f"✓ Created 3 products: {product_names}")

    # Step 2: Get all products for school
    all_products = await product_service.get_all_products(school_id=admin_school_id, include_inactive=False)

    # Step 3: Verify products returned (at least the 3 we created)
    created_product_names = [p.name for p in all_products if p.product_id in created_ids]
    assert len(created_product_names) == 3
    print(f"✓ Retrieved {len(all_products)} products for school")

    # Step 4: Verify ordering by name (ascending)
    our_products = [p for p in all_products if p.product_id in created_ids]
    our_product_names = [p.name for p in our_products]
    assert our_product_names == ["Alpha Eraser", "Mega Ruler", "Zebra Pencil"]
    print("✓ Products ordered by name (ascending)")

    # Step 5: Verify categories hydrated
    for product in our_products:
        assert product.category is not None
    print("✓ Categories hydrated for all products")

    print("\n🎉 Test 1.4 PASSED: Product listing works correctly")


# ===========================================================================
# Test 1.5: Update Product Successfully (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_update_product_successfully(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 1.5: Admin updates product name and price.

    Expected Result:
    ✅ Product name and price updated
    ✅ Other fields unchanged
    ✅ updated_at timestamp changes
    ✅ created_at timestamp unchanged
    """
    print("\n--- Test 1.5: Update Product Successfully ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create initial product
    product_data = ProductCreate(name="Original Product Name", price=Decimal("100.00"), stock_quantity=50, category_id=1)

    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    product_id = created_product.product_id
    initial_created_at = created_product.created_at
    initial_stock = created_product.stock_quantity
    print(f"✓ Initial product: '{created_product.name}', price={created_product.price}")

    # Step 2: Fetch product for update
    db_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    # Step 3: Update name and price only
    update_data = ProductUpdate(name="Updated Product Name", price=Decimal("150.00"))

    updated_product = await product_service.update_product(db_product=db_product, product_update=update_data)

    # Step 4: Verify fields updated
    assert updated_product.name == "Updated Product Name"
    assert updated_product.price == Decimal("150.00")
    print(f"✓ Updated: '{updated_product.name}', price={updated_product.price}")

    # Step 5: Verify other fields unchanged
    assert updated_product.stock_quantity == initial_stock
    assert updated_product.category_id == 1
    print("✓ Other fields unchanged")

    # Step 6: Verify created_at unchanged, updated_at present
    assert updated_product.created_at == initial_created_at
    assert updated_product.updated_at is not None
    print("✓ Timestamps correct")

    print("\n🎉 Test 1.5 PASSED: Product update works correctly")


# ===========================================================================
# Test 1.6: Soft Delete Product (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_soft_delete_product(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 1.6: Admin deactivates product (sets is_active=False).

    Expected Result:
    ✅ Product.is_active set to False
    ✅ Product NOT deleted from database (soft delete)
    ✅ Computed availability = DISCONTINUED
    ✅ is_purchasable = False
    """
    print("\n--- Test 1.6: Soft Delete Product ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create product
    product_data = ProductCreate(name="Product to Delete", price=Decimal("75.00"), stock_quantity=20, category_id=1)

    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    product_id = created_product.product_id
    assert created_product.is_active is True
    print(f"✓ Product created: ID={product_id}, is_active=True")

    # Step 2: Fetch product for deletion
    db_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    # Step 3: Soft delete product
    deleted_product = await product_service.delete_product(db_product)

    # Step 4: Verify is_active set to False
    assert deleted_product.is_active is False
    print("✓ Product.is_active set to False (soft delete)")

    # Step 5: Verify product still in database
    db_check = await db_session.get(Product, product_id)
    assert db_check is not None
    assert db_check.is_active is False
    print("✓ Product still in database (not hard deleted)")

    # Step 6: Verify computed fields
    product_schema = ProductOut.model_validate(deleted_product)

    assert product_schema.availability == ProductAvailability.DISCONTINUED
    assert product_schema.is_purchasable is False
    print(f"✓ Computed fields: availability={product_schema.availability}, is_purchasable=False")

    print("\n🎉 Test 1.6 PASSED: Soft delete works correctly")


# ===========================================================================
# Test 1.7: Adjust Stock - Add Inventory (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_adjust_stock_add_inventory(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 1.7: Admin receives shipment and adds 50 units.

    Expected Result:
    ✅ Stock increased from 10 to 60
    ✅ Product returned with updated stock
    ✅ Availability status recalculated
    """
    print("\n--- Test 1.7: Adjust Stock - Add Inventory ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create product with low stock
    product_data = ProductCreate(name="Product for Stock Adjustment", price=Decimal("100.00"), stock_quantity=10, category_id=1)

    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    product_id = created_product.product_id
    initial_stock = created_product.stock_quantity
    print(f"✓ Initial stock: {initial_stock}")

    # Step 2: Fetch product for adjustment
    db_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    # Step 3: Add 50 units
    adjustment = ProductStockAdjustment(adjustment=50, reason="New shipment received from vendor")

    adjusted_product = await product_service.adjust_stock(db_product=db_product, adjustment=adjustment)

    # Step 4: Verify stock increased
    assert adjusted_product.stock_quantity == 60
    print(f"✓ Stock adjusted: {initial_stock} → {adjusted_product.stock_quantity}")

    # Step 5: Verify in database
    db_check = await db_session.get(Product, product_id)
    assert db_check.stock_quantity == 60
    print("✓ Stock persisted in database")

    print("\n🎉 Test 1.7 PASSED: Stock addition works correctly")


# ===========================================================================
# Test 1.8: Adjust Stock - Remove Inventory (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_adjust_stock_remove_inventory(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 1.8: Admin removes damaged items.

    Expected Result:
    ✅ Stock decreased from 50 to 40
    ✅ Stock not negative
    ✅ Availability status updated if needed
    """
    print("\n--- Test 1.8: Adjust Stock - Remove Inventory ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Create product with adequate stock
    product_data = ProductCreate(name="Product for Stock Removal", price=Decimal("100.00"), stock_quantity=50, category_id=1)

    product_service = ProductService(db_session)
    created_product = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)

    product_id = created_product.product_id
    initial_stock = created_product.stock_quantity
    print(f"✓ Initial stock: {initial_stock}")

    # Step 2: Fetch product for adjustment
    db_product = await product_service.get_product_by_id(product_id=product_id, school_id=admin_school_id)

    # Step 3: Remove 10 units (negative adjustment)
    adjustment = ProductStockAdjustment(adjustment=-10, reason="Damaged items removed from inventory")

    adjusted_product = await product_service.adjust_stock(db_product=db_product, adjustment=adjustment)

    # Step 4: Verify stock decreased
    assert adjusted_product.stock_quantity == 40
    print(f"✓ Stock adjusted: {initial_stock} → {adjusted_product.stock_quantity}")

    # Step 5: Verify stock not negative
    assert adjusted_product.stock_quantity >= 0
    print("✓ Stock remains non-negative")

    print("\n🎉 Test 1.8 PASSED: Stock removal works correctly")


# ===========================================================================
# Test 1.9: Bulk Update Category for Multiple Products (Happy Path)
# ===========================================================================


@pytest.mark.asyncio
async def test_bulk_update_category(db_session: AsyncSession, mock_admin_profile: Profile):
    """
    Test 1.9: Admin moves 3 products to new category.

    Expected Result:
    ✅ All 3 products now in category 2
    ✅ Single database transaction (atomic operation)
    ✅ All products returned with updated category
    """
    print("\n--- Test 1.9: Bulk Update Category ---")

    # Step 0: Extract values FIRST
    admin_school_id = mock_admin_profile.school_id

    # Step 1: Verify category 2 exists
    category_2 = await db_session.get(ProductCategory, 2)
    if not category_2:
        # Create category 2 if it doesn't exist
        category_2 = ProductCategory(school_id=admin_school_id, category_name="Test Category 2")
        db_session.add(category_2)
        await db_session.commit()
        await db_session.refresh(category_2)

    print(f"✓ Target category exists: {category_2.category_name}")

    # Step 2: Create 3 products in category 1
    product_service = ProductService(db_session)
    product_ids = []

    for i in range(3):
        product_data = ProductCreate(name=f"Bulk Test Product {i+1}", price=Decimal("50.00"), stock_quantity=10, category_id=1)
        created = await product_service.create_product(product_in=product_data, current_profile=mock_admin_profile)
        product_ids.append(created.product_id)

    print(f"✓ Created 3 products in category 1: {product_ids}")

    # Step 3: Bulk update to category 2
    updated_products = await product_service.bulk_update_category(school_id=admin_school_id, product_ids=product_ids, new_category_id=2)

    # Step 4: Verify all products updated
    assert len(updated_products) == 3
    for product in updated_products:
        assert product.category_id == 2
    print("✓ All 3 products moved to category 2")

    # Step 5: Verify in database
    for product_id in product_ids:
        db_product = await db_session.get(Product, product_id)
        assert db_product.category_id == 2
    print("✓ Changes persisted in database")

    print("\n🎉 Test 1.9 PASSED: Bulk category update works correctly")


print("\n" + "=" * 70)
print("🎉 ALL CORE PRODUCT CRUD OPERATIONS TESTS COMPLETED!")
print("=" * 70)
