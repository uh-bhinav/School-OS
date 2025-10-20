# backend/app/api/v1/endpoints/admin_products.py
"""
Admin Product Management API Endpoints.

These endpoints allow school administrators to manage the product catalog.
All operations require Admin role and are school-scoped.

Security:
- All endpoints require Admin role
- school_id is derived from JWT token (current_profile)
- Multi-tenant isolation enforced at service layer
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, get_db, require_role
from app.models.profile import Profile
from app.schemas.product_schema import BulkUpdateCategoryRequest, ProductCreate, ProductOut, ProductStockAdjustment, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter(
    prefix="/admin/products",
    tags=["Admin - Products"],
)


# ============================================================================
# CRUD OPERATIONS
# ============================================================================


@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role("Admin"))])
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Create a new product (Admin only).

    Business Rules:
    - Product name must be unique within school
    - SKU must be globally unique (if provided)
    - Category must exist and belong to same school

    Returns:
    - 201 Created with product details
    """
    service = ProductService(db)  # ✅ INSTANTIATE HERE
    return await service.create_product(product_in, current_profile)  # ✅ CALL INSTANCE METHOD


# ============================================================================
# BULK OPERATIONS (Must come BEFORE /{product_id} routes!)
# ============================================================================


@router.put("/bulk-update-category", response_model=List[ProductOut], dependencies=[Depends(require_role("Admin"))])
async def bulk_update_category(
    request_body: BulkUpdateCategoryRequest,  # ✅ CHANGE THIS
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Bulk update category for multiple products (Admin only).

    Use Case: Admin reorganizes product catalog.

    Request Body:
    {
      "product_ids": [1, 2, 3],
      "new_category_id": 5
    }

    Business Rules:
    - All products must belong to the school
    - New category must exist and belong to the school
    """
    service = ProductService(db)
    return await service.bulk_update_category(
        school_id=current_profile.school_id,
        product_ids=request_body.product_ids,  # ✅ CHANGE THIS
        new_category_id=request_body.new_category_id,  # ✅ CHANGE THIS
    )


@router.get("/{product_id}", response_model=ProductOut, dependencies=[Depends(require_role("Admin"))])
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get a single product by ID (Admin only).

    Returns product with full details including inactive status.
    """
    service = ProductService(db)  # ✅ INSTANTIATE HERE
    return await service.get_product_by_id(product_id, current_profile.school_id)


@router.get("/", response_model=List[ProductOut], dependencies=[Depends(require_role("Admin"))])
async def get_all_products(
    category_id: Optional[int] = Query(None, description="Filter by category"),
    include_inactive: bool = Query(False, description="Include inactive/discontinued products"),
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get all products for the school (Admin only).

    Query Parameters:
    - category_id: Optional filter by category
    - include_inactive: Include soft-deleted products (default: false)

    Returns:
    - List of all products with category information
    """
    service = ProductService(db)  # ✅ INSTANTIATE HERE
    return await service.get_all_products(
        school_id=current_profile.school_id,
        category_id=category_id,
        include_inactive=include_inactive,
    )


@router.patch("/{product_id}", response_model=ProductOut, dependencies=[Depends(require_role("Admin"))])
@router.put("/{product_id}", response_model=ProductOut, dependencies=[Depends(require_role("Admin"))])
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Update an existing product (Admin only).

    Supports both PATCH (partial update) and PUT (full update).
    Only provided fields are updated.

    Business Rules:
    - Cannot change to duplicate name or SKU
    - Category must exist if being changed
    """
    service = ProductService(db)  # ✅ INSTANTIATE HERE
    db_product = await service.get_product_by_id(product_id, current_profile.school_id)
    return await service.update_product(db_product, product_update)


@router.delete("/{product_id}", response_model=ProductOut, dependencies=[Depends(require_role("Admin"))])
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Soft-delete a product (Admin only).

    Sets is_active = False. Product is not physically deleted
    to preserve order history.

    Business Rules:
    - Cannot delete if product is part of active packages
    """
    service = ProductService(db)  # ✅ INSTANTIATE HERE
    db_product = await service.get_product_by_id(product_id, current_profile.school_id)
    return await service.delete_product(db_product)


# ============================================================================
# INVENTORY MANAGEMENT
# ============================================================================


@router.patch("/{product_id}/stock", response_model=ProductOut, dependencies=[Depends(require_role("Admin"))])
@router.put("/{product_id}/stock", response_model=ProductOut, dependencies=[Depends(require_role("Admin"))])
async def adjust_stock(
    product_id: int,
    adjustment: ProductStockAdjustment,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Adjust product stock quantity (Admin only).

    Use Cases:
    - Receiving new inventory shipment (+adjustment)
    - Damaged/lost items (-adjustment)
    - Manual inventory correction

    Request Body:
    {
      "adjustment": 50,
      "reason": "Received shipment from vendor"
    }

    Business Rules:
    - Adjustment cannot result in negative stock
    """
    service = ProductService(db)  # ✅ INSTANTIATE HERE
    db_product = await service.get_product_by_id(product_id, current_profile.school_id)
    return await service.adjust_stock(db_product, adjustment)
