# backend/app/api/v1/endpoints/admin_product_packages.py
"""
Admin Product Package API Endpoints.

These endpoints are ADMIN-ONLY and allow school staff to manage
product packages (bundles/kits) for their school store.

Security:
- All endpoints require Admin role
- school_id sourced from JWT, never from request body
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user_profile, get_db, require_role
from app.models.profile import Profile
from app.schemas.product_package_schema import (
    ProductPackageAddItems,
    ProductPackageCreate,
    ProductPackageOut,
    ProductPackageUpdate,
    ProductPackageUpdateItemQuantity,
)
from app.services.product_package_service import ProductPackageService

router = APIRouter(
    prefix="/admin/product-packages",
    tags=["Admin - Product Packages"],
)


@router.post(
    "/",
    response_model=ProductPackageOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_package(
    package_in: ProductPackageCreate,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Create a new product package with items (Admin only).

    Security:
    - school_id auto-populated from JWT
    - All products must belong to same school

    Business Rules:
    - Package must contain at least 1 item
    - No duplicate products in same package
    - All products must be active

    Request Body:
    - name: Package name
    - description: Package description
    - price: Package price (null = auto-calculate from items)
    - items: List of {product_id, quantity}
    """
    return await ProductPackageService.create_package(
        db=db,
        package_in=package_in,
        current_profile=current_profile,
    )


@router.get(
    "/",
    response_model=list[ProductPackageOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_packages(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get all packages for admin's school.

    Query Parameters:
    - include_inactive: Show soft-deleted packages (default: false)
    """
    return await ProductPackageService.get_all_packages(
        db=db,
        school_id=current_profile.school_id,
        include_inactive=include_inactive,
    )


@router.get(
    "/{package_id}",
    response_model=ProductPackageOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_package(
    package_id: int,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Get a single package by ID with items."""
    return await ProductPackageService.get_package_by_id(
        db=db,
        package_id=package_id,
        school_id=current_profile.school_id,
    )


@router.put(
    "/{package_id}",
    response_model=ProductPackageOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_package(
    package_id: int,
    package_update: ProductPackageUpdate,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Update package header (metadata only, not items).

    To modify package items, use:
    - POST /{package_id}/items (add items)
    - DELETE /{package_id}/items/{product_id} (remove item)
    - PATCH /{package_id}/items/{product_id} (update quantity)

    Partial update pattern: Only provided fields are updated.
    """
    # Fetch existing package
    db_package = await ProductPackageService.get_package_by_id(
        db=db,
        package_id=package_id,
        school_id=current_profile.school_id,
    )

    return await ProductPackageService.update_package(
        db=db,
        db_package=db_package,
        package_update=package_update,
    )


@router.delete(
    "/{package_id}",
    response_model=ProductPackageOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_package(
    package_id: int,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Soft-delete a package (sets is_active = False).

    Business Rule: Packages are soft-deleted to preserve order history.
    """
    # Fetch existing package
    db_package = await ProductPackageService.get_package_by_id(
        db=db,
        package_id=package_id,
        school_id=current_profile.school_id,
    )

    return await ProductPackageService.delete_package(
        db=db,
        db_package=db_package,
    )


# ============================================================================
# PACKAGE ITEM MANAGEMENT
# ============================================================================


@router.post(
    "/{package_id}/items",
    response_model=ProductPackageOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def add_items_to_package(
    package_id: int,
    items_in: ProductPackageAddItems,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Add new items to an existing package.

    Business Rules:
    - Cannot add products already in package
    - All products must belong to same school
    - Products must be active

    Request Body:
    - items: List of {product_id, quantity}
    """
    # Fetch existing package
    db_package = await ProductPackageService.get_package_by_id(
        db=db,
        package_id=package_id,
        school_id=current_profile.school_id,
    )

    return await ProductPackageService.add_items_to_package(
        db=db,
        db_package=db_package,
        items_in=items_in,
    )


@router.delete(
    "/{package_id}/items/{product_id}",
    response_model=ProductPackageOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def remove_item_from_package(
    package_id: int,
    product_id: int,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Remove an item from a package.

    Business Rules:
    - Cannot remove last item (package must have at least 1 item)
    """
    # Fetch existing package
    db_package = await ProductPackageService.get_package_by_id(
        db=db,
        package_id=package_id,
        school_id=current_profile.school_id,
    )

    return await ProductPackageService.remove_item_from_package(
        db=db,
        db_package=db_package,
        product_id=product_id,
    )


@router.patch(
    "/{package_id}/items/{product_id}",
    response_model=ProductPackageOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_item_quantity(
    package_id: int,
    product_id: int,
    quantity_update: ProductPackageUpdateItemQuantity,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Update the quantity of a specific item in a package.

    Request Body:
    - quantity: New quantity (1-100)
    """
    # Fetch existing package
    db_package = await ProductPackageService.get_package_by_id(
        db=db,
        package_id=package_id,
        school_id=current_profile.school_id,
    )

    return await ProductPackageService.update_item_quantity(
        db=db,
        db_package=db_package,
        product_id=product_id,
        new_quantity=quantity_update.quantity,
    )
