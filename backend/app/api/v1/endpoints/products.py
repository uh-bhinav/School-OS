# backend/app/api/v1/endpoints/products.py
"""
Parent-Facing Product API Endpoints.

These endpoints allow parents to browse the school store catalog.
All endpoints return only ACTIVE products.

Security:
- Endpoints are publicly accessible within school context
- Only active products are returned
- school_id must be provided in path (no JWT required for browsing)
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, get_db
from app.schemas.product_schema import ProductOut
from app.services.product_service import ProductService

router = APIRouter(
    prefix="/products",
    tags=["Products - Parent Store"],
)


@router.get(
    "/school/{school_id}",
    response_model=list[ProductOut],
)
async def browse_products(
    school_id: int,
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    db: AsyncSession = Depends(get_db),
    current_profile=Depends(get_current_user_profile),
):
    """
    Browse school store catalog (Parent-facing).

    This endpoint allows parents to browse products for a specific school.
    Only active products are returned.

    Query Parameters:
    - category_id: Optional filter by category

    Returns:
    - List of active products with category information
    """
    if current_profile.school_id != school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to browse products for this school.",
        )
    service = ProductService(db)
    return await service.get_all_products(
        school_id=school_id,
        category_id=category_id,
        include_inactive=False,  # Parents only see active products
    )


@router.get(
    "/{product_id}",
    response_model=ProductOut,
)
async def get_product_details(product_id: int, school_id: int = Query(..., description="School ID for validation"), db: AsyncSession = Depends(get_db), current_profile=Depends(get_current_user_profile)):
    """
    Get detailed product information (Parent-facing).

    Query Parameters:
    - school_id: School ID (required for security validation)

    Returns:
    - Complete product details with category information
    """
    if current_profile.school_id != school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to browse products for this school.",
        )
    service = ProductService(db)
    return await service.get_product_by_id(
        product_id=product_id,
        school_id=school_id,
    )
