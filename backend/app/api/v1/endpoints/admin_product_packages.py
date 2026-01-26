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
from sqlalchemy.ext.asyncio import AsyncSession

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


# ============================================================================
# PACKAGE CRUD OPERATIONS
# ============================================================================


@router.post(
    "/",
    response_model=ProductPackageOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_package(
    package_in: ProductPackageCreate,
    db: AsyncSession = Depends(get_db),
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

    Example:
    {
      "name": "Grade 1 Starter Kit",
      "description": "Complete starter kit for Grade 1 students",
      "price": 2500.00,
      "items": [
        {"product_id": 103, "quantity": 2},
        {"product_id": 104, "quantity": 1}
      ]
    }
    """
    service = ProductPackageService(db)
    return await service.create_package(
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
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get all packages for admin's school.

    Query Parameters:
    - include_inactive: Show soft-deleted packages (default: false)

    Returns:
    - List of all product packages with their items
    """
    service = ProductPackageService(db)
    return await service.get_all_packages(
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
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get a single package by ID with all items.

    Returns:
    - Complete package details including all items with product info
    """
    service = ProductPackageService(db)
    return await service.get_package_by_id(
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
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Update package header (metadata only, not items).
    """
    service = ProductPackageService(db)

    return await service.update_package(
        package_id=package_id,
        school_id=current_profile.school_id,
        package_update=package_update,
    )


@router.delete(
    "/{package_id}",
    response_model=ProductPackageOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_package(
    package_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Soft-delete a package (sets is_active = False).
    """
    service = ProductPackageService(db)

    return await service.delete_package(
        package_id=package_id,
        school_id=current_profile.school_id,
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
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Add new items to an existing package.
    """
    service = ProductPackageService(db)

    return await service.add_items_to_package(
        package_id=package_id,
        school_id=current_profile.school_id,
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
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Remove an item from a package.
    """
    service = ProductPackageService(db)

    return await service.remove_item_from_package(
        package_id=package_id,
        school_id=current_profile.school_id,
        product_id=product_id,
    )


@router.patch(
    "/{package_id}/items/{product_id}",
    response_model=ProductPackageOut,
    dependencies=[Depends(require_role("Admin"))],
)
@router.put(
    "/{package_id}/items/{product_id}",
    response_model=ProductPackageOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_item_quantity(
    package_id: int,
    product_id: int,
    quantity_update: ProductPackageUpdateItemQuantity,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Update the quantity of a specific item in a package.
    """
    service = ProductPackageService(db)

    return await service.update_item_quantity(
        package_id=package_id,
        school_id=current_profile.school_id,
        product_id=product_id,
        new_quantity=quantity_update.quantity,
    )
