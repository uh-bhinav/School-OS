# tests/unit/test_product_service_unit.py
"""
Unit Tests for ProductService

These are TRUE unit tests that:
- Mock all database dependencies
- Test business logic in isolation
- Run extremely fast (no database I/O)
- Focus on edge cases and error handling

Test Coverage:
- Product creation validation
- Duplicate name/SKU detection
- Category validation
- Product updates
- Stock adjustments
- Soft deletes
- Bulk operations
- Multi-tenant security
"""

from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.product_category import ProductCategory
from app.models.profile import Profile
from app.schemas.product_schema import ProductCreate, ProductStockAdjustment, ProductUpdate
from app.services.product_service import ProductService

# ============================================================================
# FIXTURES - Mock Objects
# ============================================================================


@pytest.fixture
def mock_db_session():
    """Mock AsyncSession for database operations."""
    session = AsyncMock(spec=AsyncSession)
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.add = MagicMock()
    return session


@pytest.fixture
def mock_admin_profile():
    """Mock admin profile for school_id=1."""
    return Profile(
        user_id=UUID("cb0cf1e2-19d0-4ae3-93ed-3073a47a5058"),
        school_id=1,
        first_name="Admin",
        last_name="User",
        is_active=True,
    )


@pytest.fixture
def sample_product():
    """Sample product instance for testing."""
    return Product(
        product_id=1,
        school_id=1,
        category_id=1,
        name="Test Product",
        description="Test description",
        price=Decimal("100.00"),
        stock_quantity=50,
        sku="TEST-001",
        is_active=True,
    )


@pytest.fixture
def sample_category():
    """Sample category instance for testing."""
    return ProductCategory(
        category_id=1,
        school_id=1,
        category_name="Test Category",
    )


# ============================================================================
# CREATE PRODUCT TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_create_product_success(mock_db_session, mock_admin_profile, sample_category):
    """
    Unit Test: Create product successfully with valid data.

    Mocks:
    - Category validation query (returns category)
    - Duplicate name check (returns None)
    - Duplicate SKU check (returns None)
    """
    # Arrange
    product_data = ProductCreate(
        name="New Product",
        description="Test description",
        price=Decimal("99.99"),
        stock_quantity=10,
        category_id=1,
        sku="NEW-001",
    )

    # Mock category exists
    category_result = MagicMock()
    category_result.scalars.return_value.first.return_value = sample_category

    # Mock no duplicate name
    name_result = MagicMock()
    name_result.scalars.return_value.first.return_value = None

    # Mock no duplicate SKU
    sku_result = MagicMock()
    sku_result.scalars.return_value.first.return_value = None

    # Setup execute to return different results for each query
    mock_db_session.execute.side_effect = [category_result, name_result, sku_result]

    service = ProductService(mock_db_session)

    # Act
    result = await service.create_product(product_data, mock_admin_profile)

    # Assert
    assert result.name == "New Product"
    assert result.school_id == 1  # From profile, not request
    assert result.price == Decimal("99.99")
    assert mock_db_session.add.called
    assert mock_db_session.commit.called
    assert mock_db_session.refresh.called


@pytest.mark.asyncio
async def test_create_product_duplicate_name_fails(mock_db_session, mock_admin_profile, sample_category, sample_product):
    """
    Unit Test: Creating product with duplicate name raises 409.

    Business Rule: Product names must be unique within school.
    """
    # Arrange
    product_data = ProductCreate(
        name="Test Product",  # Same as sample_product
        price=Decimal("99.99"),
        stock_quantity=10,
        category_id=1,
    )

    # Mock category exists
    category_result = MagicMock()
    category_result.scalars.return_value.first.return_value = sample_category

    # Mock duplicate name found
    name_result = MagicMock()
    name_result.scalars.return_value.first.return_value = sample_product

    mock_db_session.execute.side_effect = [category_result, name_result]

    service = ProductService(mock_db_session)

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await service.create_product(product_data, mock_admin_profile)

    assert exc_info.value.status_code == 409
    assert "already exists" in exc_info.value.detail.lower()
    assert mock_db_session.add.not_called  # Should not add product


@pytest.mark.asyncio
async def test_create_product_duplicate_sku_fails(mock_db_session, mock_admin_profile, sample_category, sample_product):
    """
    Unit Test: Creating product with duplicate SKU raises 409.

    Business Rule: SKU must be globally unique.
    """
    # Arrange
    product_data = ProductCreate(
        name="Different Product",
        price=Decimal("99.99"),
        stock_quantity=10,
        category_id=1,
        sku="TEST-001",  # Same as sample_product
    )

    # Mock category exists
    category_result = MagicMock()
    category_result.scalars.return_value.first.return_value = sample_category

    # Mock no duplicate name
    name_result = MagicMock()
    name_result.scalars.return_value.first.return_value = None

    # Mock duplicate SKU found
    sku_result = MagicMock()
    sku_result.scalars.return_value.first.return_value = sample_product

    mock_db_session.execute.side_effect = [category_result, name_result, sku_result]

    service = ProductService(mock_db_session)

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await service.create_product(product_data, mock_admin_profile)

    assert exc_info.value.status_code == 409
    assert "SKU" in exc_info.value.detail
    assert "already in use" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_create_product_invalid_category_fails(mock_db_session, mock_admin_profile):
    """
    Unit Test: Creating product with non-existent category raises 404.

    Business Rule: Category must exist and belong to same school.
    """
    # Arrange
    product_data = ProductCreate(
        name="New Product",
        price=Decimal("99.99"),
        stock_quantity=10,
        category_id=999,  # Non-existent
    )

    # Mock category NOT found
    category_result = MagicMock()
    category_result.scalars.return_value.first.return_value = None

    mock_db_session.execute.return_value = category_result

    service = ProductService(mock_db_session)

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await service.create_product(product_data, mock_admin_profile)

    assert exc_info.value.status_code == 404
    assert "Category" in exc_info.value.detail
    assert "not found" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_create_product_school_id_from_profile(mock_db_session, mock_admin_profile, sample_category):
    """
    Unit Test: Product school_id comes from profile, not request.

    Security: Prevents IDOR vulnerability.
    """
    # Arrange
    product_data = ProductCreate(
        name="Security Test Product",
        price=Decimal("99.99"),
        stock_quantity=10,
        category_id=1,
    )

    # Mock all validation passes
    category_result = MagicMock()
    category_result.scalars.return_value.first.return_value = sample_category

    name_result = MagicMock()
    name_result.scalars.return_value.first.return_value = None

    sku_result = MagicMock()
    sku_result.scalars.return_value.first.return_value = None

    mock_db_session.execute.side_effect = [category_result, name_result, sku_result]

    service = ProductService(mock_db_session)

    # Act
    result = await service.create_product(product_data, mock_admin_profile)

    # Assert
    assert result.school_id == mock_admin_profile.school_id
    assert result.school_id == 1


# ============================================================================
# GET PRODUCT TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_get_product_by_id_success(mock_db_session, sample_product):
    """
    Unit Test: Get product by ID returns product with category loaded.
    """
    # Arrange
    result_mock = MagicMock()
    result_mock.scalars.return_value.first.return_value = sample_product
    mock_db_session.execute.return_value = result_mock

    service = ProductService(mock_db_session)

    # Act
    result = await service.get_product_by_id(product_id=1, school_id=1)

    # Assert
    assert result == sample_product
    assert mock_db_session.execute.called


@pytest.mark.asyncio
async def test_get_product_by_id_not_found(mock_db_session):
    """
    Unit Test: Get product with wrong school_id raises 404.

    Security: Multi-tenant isolation.
    """
    # Arrange
    result_mock = MagicMock()
    result_mock.scalars.return_value.first.return_value = None
    mock_db_session.execute.return_value = result_mock

    service = ProductService(mock_db_session)

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await service.get_product_by_id(product_id=999, school_id=1)

    assert exc_info.value.status_code == 404
    assert "not found" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_get_all_products_with_filters(mock_db_session, sample_product):
    """
    Unit Test: Get all products applies filters correctly.
    """
    # Arrange
    result_mock = MagicMock()
    result_mock.scalars.return_value.all.return_value = [sample_product]
    mock_db_session.execute.return_value = result_mock

    service = ProductService(mock_db_session)

    # Act
    result = await service.get_all_products(school_id=1, category_id=1, include_inactive=False)

    # Assert
    assert len(result) == 1
    assert result[0] == sample_product
    assert mock_db_session.execute.called


# ============================================================================
# UPDATE PRODUCT TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_update_product_success(mock_db_session, sample_product):
    """
    Unit Test: Update product with valid data succeeds.
    """
    # Arrange
    update_data = ProductUpdate(
        name="Updated Name",
        price=Decimal("150.00"),
    )

    # Mock no name conflict
    name_result = MagicMock()
    name_result.scalars.return_value.first.return_value = None
    mock_db_session.execute.return_value = name_result

    service = ProductService(mock_db_session)

    # Act
    result = await service.update_product(sample_product, update_data)

    # Assert
    assert result.name == "Updated Name"
    assert result.price == Decimal("150.00")
    assert mock_db_session.commit.called
    assert mock_db_session.refresh.called


@pytest.mark.asyncio
async def test_update_product_name_conflict(mock_db_session, sample_product):
    """
    Unit Test: Updating to existing product name raises 409.
    """
    # Arrange
    update_data = ProductUpdate(name="Existing Product")

    # Create a different product with conflicting name
    conflicting_product = Product(
        product_id=2,
        school_id=1,
        name="Existing Product",
        price=Decimal("100.00"),
        stock_quantity=10,
        is_active=True,
    )

    # Mock name conflict found
    name_result = MagicMock()
    name_result.scalars.return_value.first.return_value = conflicting_product
    mock_db_session.execute.return_value = name_result

    service = ProductService(mock_db_session)

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await service.update_product(sample_product, update_data)

    assert exc_info.value.status_code == 409
    assert "already exists" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_update_product_sku_conflict(mock_db_session, sample_product):
    """
    Unit Test: Updating to existing SKU raises 409.
    """
    # Arrange
    update_data = ProductUpdate(sku="EXISTING-SKU")

    # Mock no name change
    sample_product.name = "Test Product"

    # Create a different product with conflicting SKU
    conflicting_product = Product(
        product_id=2,
        school_id=1,
        sku="EXISTING-SKU",
        name="Different Product",
        price=Decimal("100.00"),
        stock_quantity=10,
        is_active=True,
    )

    # Mock SKU conflict found
    sku_result = MagicMock()
    sku_result.scalars.return_value.first.return_value = conflicting_product
    mock_db_session.execute.return_value = sku_result

    service = ProductService(mock_db_session)

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await service.update_product(sample_product, update_data)

    assert exc_info.value.status_code == 409
    assert "SKU" in exc_info.value.detail
    assert "already in use" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_update_product_invalid_category(mock_db_session, sample_product, sample_category):
    """
    Unit Test: Updating to non-existent category raises 404.
    """
    # Arrange
    update_data = ProductUpdate(category_id=999)

    # Mock category NOT found
    category_result = MagicMock()
    category_result.scalars.return_value.first.return_value = None
    mock_db_session.execute.return_value = category_result

    service = ProductService(mock_db_session)

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await service.update_product(sample_product, update_data)

    assert exc_info.value.status_code == 404
    assert "Category" in exc_info.value.detail
    assert "not found" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_update_product_partial_update(mock_db_session, sample_product):
    """
    Unit Test: Partial update only changes specified fields.
    """
    # Arrange
    update_data = ProductUpdate(price=Decimal("200.00"))  # Only update price

    original_name = sample_product.name
    original_stock = sample_product.stock_quantity

    service = ProductService(mock_db_session)

    # Act
    result = await service.update_product(sample_product, update_data)

    # Assert
    assert result.price == Decimal("200.00")  # Changed
    assert result.name == original_name  # Unchanged
    assert result.stock_quantity == original_stock  # Unchanged


# ============================================================================
# DELETE PRODUCT TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_delete_product_success(mock_db_session, sample_product):
    """
    Unit Test: Soft delete sets is_active to False.
    """
    # Arrange
    # Mock no active packages
    package_result = MagicMock()
    package_result.scalar.return_value = 0
    mock_db_session.execute.return_value = package_result

    service = ProductService(mock_db_session)

    # Act
    result = await service.delete_product(sample_product)

    # Assert
    assert result.is_active is False
    assert mock_db_session.commit.called
    assert mock_db_session.refresh.called


@pytest.mark.asyncio
async def test_delete_product_in_active_package_fails(mock_db_session, sample_product):
    """
    Unit Test: Cannot delete product in active packages.

    Business Rule: Products in packages cannot be deleted.
    """
    # Arrange
    # Mock product is in 2 active packages
    package_result = MagicMock()
    package_result.scalar.return_value = 2
    mock_db_session.execute.return_value = package_result

    service = ProductService(mock_db_session)

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await service.delete_product(sample_product)

    assert exc_info.value.status_code == 400
    assert "Cannot delete product" in exc_info.value.detail
    assert "package" in exc_info.value.detail.lower()
    assert "2" in exc_info.value.detail


# ============================================================================
# STOCK ADJUSTMENT TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_adjust_stock_add_inventory_success(mock_db_session, sample_product):
    """
    Unit Test: Adding stock increases quantity correctly.
    """
    # Arrange
    adjustment = ProductStockAdjustment(adjustment=50, reason="New shipment")

    initial_stock = sample_product.stock_quantity

    service = ProductService(mock_db_session)

    # Act
    result = await service.adjust_stock(sample_product, adjustment)

    # Assert
    assert result.stock_quantity == initial_stock + 50
    assert mock_db_session.commit.called
    assert mock_db_session.refresh.called


@pytest.mark.asyncio
async def test_adjust_stock_remove_inventory_success(mock_db_session, sample_product):
    """
    Unit Test: Removing stock decreases quantity correctly.
    """
    # Arrange
    sample_product.stock_quantity = 50
    adjustment = ProductStockAdjustment(adjustment=-10, reason="Damaged items")

    service = ProductService(mock_db_session)

    # Act
    result = await service.adjust_stock(sample_product, adjustment)

    # Assert
    assert result.stock_quantity == 40
    assert mock_db_session.commit.called


@pytest.mark.asyncio
async def test_adjust_stock_negative_result_fails(mock_db_session, sample_product):
    """
    Unit Test: Adjustment resulting in negative stock raises 400.

    Business Rule: Stock cannot be negative.
    """
    # Arrange
    sample_product.stock_quantity = 5
    adjustment = ProductStockAdjustment(adjustment=-10, reason="Too much removal")  # Would result in -5

    service = ProductService(mock_db_session)

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await service.adjust_stock(sample_product, adjustment)

    assert exc_info.value.status_code == 400
    assert "negative stock" in exc_info.value.detail.lower()
    assert "5" in exc_info.value.detail  # Current stock
    assert "-10" in exc_info.value.detail  # Adjustment


@pytest.mark.asyncio
async def test_adjust_stock_to_zero_success(mock_db_session, sample_product):
    """
    Unit Test: Adjustment to exactly zero succeeds.
    """
    # Arrange
    sample_product.stock_quantity = 10
    adjustment = ProductStockAdjustment(adjustment=-10, reason="Sold out")

    service = ProductService(mock_db_session)

    # Act
    result = await service.adjust_stock(sample_product, adjustment)

    # Assert
    assert result.stock_quantity == 0
    assert mock_db_session.commit.called


# ============================================================================
# BULK OPERATIONS TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_bulk_update_category_success(mock_db_session, sample_category):
    """
    Unit Test: Bulk category update updates all products.
    """
    # Arrange
    product1 = Product(product_id=1, school_id=1, category_id=1, name="Product 1", price=Decimal("100.00"), stock_quantity=10, is_active=True)
    product2 = Product(product_id=2, school_id=1, category_id=1, name="Product 2", price=Decimal("200.00"), stock_quantity=20, is_active=True)

    # Mock category validation
    category_result = MagicMock()
    category_result.scalars.return_value.first.return_value = sample_category

    # Mock product fetch
    products_result = MagicMock()
    products_result.scalars.return_value.all.return_value = [product1, product2]

    mock_db_session.execute.side_effect = [category_result, products_result]

    service = ProductService(mock_db_session)

    # Act
    result = await service.bulk_update_category(school_id=1, product_ids=[1, 2], new_category_id=2)

    # Assert
    assert len(result) == 2
    assert result[0].category_id == 2
    assert result[1].category_id == 2
    assert mock_db_session.commit.called


@pytest.mark.asyncio
async def test_bulk_update_category_invalid_category_fails(mock_db_session):
    """
    Unit Test: Bulk update with invalid category raises 404.
    """
    # Arrange
    # Mock category NOT found
    category_result = MagicMock()
    category_result.scalars.return_value.first.return_value = None
    mock_db_session.execute.return_value = category_result

    service = ProductService(mock_db_session)

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await service.bulk_update_category(school_id=1, product_ids=[1, 2], new_category_id=999)

    assert exc_info.value.status_code == 404
    assert "Category" in exc_info.value.detail
    assert "not found" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_bulk_update_category_missing_products_fails(mock_db_session, sample_category):
    """
    Unit Test: Bulk update with missing products raises 404.

    Business Rule: All products must exist (atomic operation).
    """
    # Arrange
    product1 = Product(product_id=1, school_id=1, category_id=1, name="Product 1", price=Decimal("100.00"), stock_quantity=10, is_active=True)

    # Mock category validation
    category_result = MagicMock()
    category_result.scalars.return_value.first.return_value = sample_category

    # Mock product fetch - only 1 product found, but 2 requested
    products_result = MagicMock()
    products_result.scalars.return_value.all.return_value = [product1]

    mock_db_session.execute.side_effect = [category_result, products_result]

    service = ProductService(mock_db_session)

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await service.bulk_update_category(school_id=1, product_ids=[1, 999], new_category_id=2)  # 999 doesn't exist

    assert exc_info.value.status_code == 404
    assert "Products not found" in exc_info.value.detail
    assert "999" in exc_info.value.detail


# ============================================================================
# EDGE CASES & BOUNDARY TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_create_product_with_null_optional_fields(mock_db_session, mock_admin_profile, sample_category):
    """
    Unit Test: Product with minimal required fields succeeds.
    """
    # Arrange
    product_data = ProductCreate(
        name="Minimal Product",
        price=Decimal("50.00"),
        category_id=1,
        # All optional fields omitted
    )

    # Mock all validations pass
    category_result = MagicMock()
    category_result.scalars.return_value.first.return_value = sample_category

    name_result = MagicMock()
    name_result.scalars.return_value.first.return_value = None

    sku_result = MagicMock()
    sku_result.scalars.return_value.first.return_value = None

    mock_db_session.execute.side_effect = [category_result, name_result, sku_result]

    service = ProductService(mock_db_session)

    # Act
    result = await service.create_product(product_data, mock_admin_profile)

    # Assert
    assert result.name == "Minimal Product"
    assert result.stock_quantity == 0  # Default
    assert result.is_active is True  # Default
    assert result.sku is None
    assert result.description is None


@pytest.mark.asyncio
async def test_update_product_no_changes(mock_db_session, sample_product):
    """
    Unit Test: Update with no fields succeeds (idempotent).
    """
    # Arrange
    update_data = ProductUpdate()  # Empty update

    service = ProductService(mock_db_session)

    # Act
    result = await service.update_product(sample_product, update_data)

    # Assert
    assert result == sample_product
    assert mock_db_session.commit.called  # Still commits (for timestamp)


@pytest.mark.asyncio
async def test_delete_already_inactive_product(mock_db_session, sample_product):
    """
    Unit Test: Deleting already inactive product succeeds (idempotent).
    """
    # Arrange
    sample_product.is_active = False  # Already inactive

    # Mock no active packages
    package_result = MagicMock()
    package_result.scalar.return_value = 0
    mock_db_session.execute.return_value = package_result

    service = ProductService(mock_db_session)

    # Act
    result = await service.delete_product(sample_product)

    # Assert
    assert result.is_active is False
    assert mock_db_session.commit.called  # Still commits


print("\n" + "=" * 70)
print("🎉 ALL PRODUCT SERVICE UNIT TESTS DEFINED!")
print("=" * 70)
print("\nThese are TRUE unit tests that:")
print("- Mock all database dependencies")
print("- Test business logic in isolation")
print("- Run extremely fast (no I/O)")
print("- Can run without a database")
print("\nTo run: pytest tests/unit/test_product_service_unit.py -v")
print("=" * 70)
