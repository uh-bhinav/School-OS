# backend/app/api/v1/endpoints/admin_products.py
"""
Admin Product API Endpoints.

These endpoints are ADMIN-ONLY and allow school staff to manage
products in their school store catalog.

Security:
- All endpoints require Admin role
- school_id sourced from JWT, never from request body
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user_profile, get_db, require_role
from app.models.profile import Profile
from app.schemas.product_schema import (
    ProductCreate,
    ProductFilterParams,
    ProductOut,
    ProductStockAdjustment,
    ProductUpdate,
)
from app.services.product_service import ProductService

router = APIRouter(
    prefix="/admin/products",
    tags=["Admin - Products"],
)


@router.post(
    "/",
    response_model=ProductOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Create a new product (Admin only).

    Security:
    - school_id auto-populated from JWT
    - Category must belong to same school

    Business Rules:
    - SKU must be unique within school
    - Price must be positive
    """
    return await ProductService.create_product(
        db=db,
        product_in=product_in,
        current_profile=current_profile,
    )


@router.get(
    "/",
    response_model=list[ProductOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_products(
    filters: ProductFilterParams = Depends(),
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get all products for admin's school with optional filters.

    Query Parameters:
    - category_id: Filter by category
    - is_active: Filter by active status
    - min_price: Minimum price filter
    - max_price: Maximum price filter
    - availability: Filter by availability status
    - search: Search in name, description, SKU
    - include_inactive: Show soft-deleted products
    """
    return await ProductService.get_all_products(
        db=db,
        school_id=current_profile.school_id,
        filters=filters,
        include_inactive=include_inactive,
    )


@router.get(
    "/{product_id}",
    response_model=ProductOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Get a single product by ID."""
    return await ProductService.get_product_by_id(
        db=db,
        product_id=product_id,
        school_id=current_profile.school_id,
        include_category=True,
    )


@router.put(
    "/{product_id}",
    response_model=ProductOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Update a product.

    Partial update pattern: Only provided fields are updated.
    """
    # Fetch existing product
    db_product = await ProductService.get_product_by_id(
        db=db,
        product_id=product_id,
        school_id=current_profile.school_id,
    )

    return await ProductService.update_product(
        db=db,
        db_product=db_product,
        product_update=product_update,
    )


@router.delete(
    "/{product_id}",
    response_model=ProductOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Soft-delete a product (sets is_active = False).

    Business Rule: Products are NEVER hard-deleted to preserve order history.
    """
    # Fetch existing product
    db_product = await ProductService.get_product_by_id(
        db=db,
        product_id=product_id,
        school_id=current_profile.school_id,
    )

    return await ProductService.delete_product(
        db=db,
        db_product=db_product,
    )


@router.patch(
    "/{product_id}/stock",
    response_model=ProductOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def adjust_product_stock(
    product_id: int,
    adjustment_data: ProductStockAdjustment,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Adjust product stock (Admin only).

    Use Cases:
    - Increment stock after receiving shipment
    - Decrement stock for damaged/lost items
    - Manual correction of inventory discrepancies

    Request Body:
    - adjustment: Positive to add stock, negative to subtract
    - reason: Mandatory reason for audit trail
    """
    # Fetch existing product
    db_product = await ProductService.get_product_by_id(
        db=db,
        product_id=product_id,
        school_id=current_profile.school_id,
    )

    return await ProductService.adjust_stock(
        db=db,
        db_product=db_product,
        adjustment_data=adjustment_data,
        adjusted_by_user_id=current_profile.user_id,
    )
