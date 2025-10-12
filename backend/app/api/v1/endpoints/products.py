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

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_db
from app.schemas.product_schema import ProductFilterParams, ProductListOut, ProductOut
from app.services.product_service import ProductService

router = APIRouter(
    prefix="/products",
    tags=["Products - Parent Store"],
)


@router.get(
    "/school/{school_id}",
    response_model=list[ProductListOut],
)
async def browse_products(
    school_id: int,
    filters: ProductFilterParams = Depends(),
    db: Session = Depends(get_db),
):
    """
    Browse school store catalog (Parent-facing).

    This endpoint allows parents to browse products for a specific school.
    Only active products are returned.

    Query Parameters:
    - category_id: Filter by category
    - min_price: Minimum price filter
    - max_price: Maximum price filter
    - availability: Filter by availability (in_stock, low_stock)
    - search: Search in product name and description

    Returns:
    - Lightweight product list optimized for catalog browsing
    """
    return await ProductService.get_all_products(
        db=db,
        school_id=school_id,
        filters=filters,
        include_inactive=False,  # Parents only see active products
    )


@router.get(
    "/{product_id}",
    response_model=ProductOut,
)
async def get_product_details(
    product_id: int,
    school_id: int,
    db: Session = Depends(get_db),
):
    """
    Get detailed product information (Parent-facing).

    Query Parameters:
    - school_id: School ID (required for security validation)

    Returns:
    - Complete product details with category information
    """
    return await ProductService.get_product_by_id(
        db=db,
        product_id=product_id,
        school_id=school_id,
        include_category=True,
    )
