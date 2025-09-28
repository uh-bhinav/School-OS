# backend/app/api/v1/endpoints/product_categories.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role

# No longer need 'from typing import List'
from app.db.session import get_db
from app.schemas.product_category_schema import (
    ProductCategoryCreate,
    ProductCategoryOut,
)
from app.services import product_category_service

router = APIRouter()


@router.post(
    "/",
    response_model=ProductCategoryOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_product_category(
    *, db: AsyncSession = Depends(get_db), category_in: ProductCategoryCreate
):
    """
    Create a new product category for a school. Admin only.
    """
    return await product_category_service.create_product_category(
        db=db, category_in=category_in
    )


@router.get(
    "/{school_id}/all",
    response_model=list[ProductCategoryOut],  # Changed from List to list
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_product_categories(
    school_id: int, db: AsyncSession = Depends(get_db)
):
    """
    Get all product categories for a school. Admin only.
    """
    return await product_category_service.get_all_product_categories_for_school(
        db=db, school_id=school_id
    )
