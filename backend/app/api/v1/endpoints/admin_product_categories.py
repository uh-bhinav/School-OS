# backend/app/api/v1/endpoints/admin_product_categories.py
"""
Admin Product Category API Endpoints.

These endpoints are ADMIN-ONLY and allow school staff to manage
product categories for their school store.

Security:
- All endpoints require Admin role (via require_role dependency)
- school_id sourced from JWT, never from request body
- RLS policies provide defense-in-depth
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user_profile, get_db, require_role
from app.models.profile import Profile
from app.schemas.product_category_schema import (
    ProductCategoryBulkActivate,
    ProductCategoryBulkReorder,
    ProductCategoryCreate,
    ProductCategoryOut,
    ProductCategoryUpdate,
    ProductCategoryWithCount,
)
from app.services.product_category_service import ProductCategoryService

router = APIRouter(
    prefix="/admin/product-categories",
    tags=["Admin - Product Categories"],
)


@router.post(
    "/",
    response_model=ProductCategoryOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_category(
    category_in: ProductCategoryCreate,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Create a new product category (Admin only).

    Security:
    - school_id auto-populated from JWT
    - Prevents IDOR vulnerability

    Business Rules:
    - Category name must be unique within school
    - Name is normalized to title case
    """
    return await ProductCategoryService.create_category(
        db=db,
        category_in=category_in,
        current_profile=current_profile,
    )


@router.get(
    "/",
    response_model=list[ProductCategoryOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_categories(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get all categories for admin's school.

    Query Parameters:
    - include_inactive: Show soft-deleted categories (default: false)
    """
    return await ProductCategoryService.get_all_categories(
        db=db,
        school_id=current_profile.school_id,
        include_inactive=include_inactive,
    )


@router.get(
    "/stats",
    response_model=list[ProductCategoryWithCount],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_categories_with_stats(
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get all categories with product counts (Admin dashboard).

    Returns:
    - product_count: Total products in category
    - active_product_count: Active products only
    """
    return await ProductCategoryService.get_categories_with_product_counts(
        db=db,
        school_id=current_profile.school_id,
    )


@router.get(
    "/{category_id}",
    response_model=ProductCategoryOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Get a single category by ID."""
    return await ProductCategoryService.get_category_by_id(
        db=db,
        category_id=category_id,
        school_id=current_profile.school_id,
    )


@router.put(
    "/{category_id}",
    response_model=ProductCategoryOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_category(
    category_id: int,
    category_update: ProductCategoryUpdate,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Update a category.

    Partial update pattern: Only provided fields are updated.
    """
    # Fetch existing category
    db_category = await ProductCategoryService.get_category_by_id(
        db=db,
        category_id=category_id,
        school_id=current_profile.school_id,
    )

    return await ProductCategoryService.update_category(
        db=db,
        db_category=db_category,
        category_update=category_update,
    )


@router.delete(
    "/{category_id}",
    response_model=ProductCategoryOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Soft-delete a category (sets is_active = False).

    Business Rule: Cannot delete category with active products.
    """
    # Fetch existing category
    db_category = await ProductCategoryService.get_category_by_id(
        db=db,
        category_id=category_id,
        school_id=current_profile.school_id,
    )

    return await ProductCategoryService.delete_category(
        db=db,
        db_category=db_category,
    )


@router.patch(
    "/reorder",
    response_model=list[ProductCategoryOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def bulk_reorder_categories(
    reorder_data: ProductCategoryBulkReorder,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Bulk update display_order for multiple categories.

    Use Case: Admin drags categories to reorder in UI.
    """
    return await ProductCategoryService.bulk_reorder_categories(
        db=db,
        school_id=current_profile.school_id,
        category_orders=reorder_data.category_orders,
    )


@router.patch(
    "/bulk-activate",
    response_model=list[ProductCategoryOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def bulk_activate_categories(
    activate_data: ProductCategoryBulkActivate,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Bulk activate/deactivate categories.

    Use Case: Admin hides seasonal categories temporarily.
    """
    return await ProductCategoryService.bulk_activate_categories(
        db=db,
        school_id=current_profile.school_id,
        category_ids=activate_data.category_ids,
        is_active=activate_data.is_active,
    )
