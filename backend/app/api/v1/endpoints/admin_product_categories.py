from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, get_db
from app.schemas.product_category_schema import (
    ProductCategoryCreate,
    ProductCategoryOut,  # <-- Pydantic schema for output
    ProductCategoryUpdate,
    ProductCategoryWithCount,
)
from app.services.product_category_service import ProductCategoryService

router = APIRouter(prefix="/admin/product-categories", tags=["Admin - Product Categories"])


# CREATE
@router.post("/", response_model=ProductCategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: ProductCategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_profile=Depends(get_current_user_profile),
):
    return await ProductCategoryService.create_category(db, category_in, current_profile)


# GET SINGLE CATEGORY
@router.get("/{category_id}", response_model=ProductCategoryOut)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile=Depends(get_current_user_profile),
):
    return await ProductCategoryService.get_category_by_id(db, category_id, current_profile.school_id)


# GET ALL CATEGORIES
@router.get("/", response_model=List[ProductCategoryOut])
async def get_all_categories(
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
    current_profile=Depends(get_current_user_profile),
):
    return await ProductCategoryService.get_all_categories(db, current_profile.school_id, include_inactive)


# GET CATEGORIES WITH PRODUCT COUNTS
@router.get("/with-product-counts", response_model=List[ProductCategoryWithCount])
async def get_categories_with_counts(
    db: AsyncSession = Depends(get_db),
    current_profile=Depends(get_current_user_profile),
):
    return await ProductCategoryService.get_categories_with_product_counts(db, current_profile.school_id)


# UPDATE CATEGORY
@router.patch("/{category_id}", response_model=ProductCategoryOut)
async def update_category(
    category_id: int,
    category_update: ProductCategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_profile=Depends(get_current_user_profile),
):
    db_category = await ProductCategoryService.get_category_by_id(db, category_id, current_profile.school_id)
    return await ProductCategoryService.update_category(db, db_category, category_update)


# DELETE CATEGORY
@router.delete("/{category_id}", response_model=ProductCategoryOut)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile=Depends(get_current_user_profile),
):
    db_category = await ProductCategoryService.get_category_by_id(db, category_id, current_profile.school_id)
    return await ProductCategoryService.delete_category(db, db_category)


# BULK REORDER
@router.put("/bulk-reorder", response_model=List[ProductCategoryOut])
async def bulk_reorder(
    category_orders: List[dict],  # {"category_id": int, "display_order": int}
    db: AsyncSession = Depends(get_db),
    current_profile=Depends(get_current_user_profile),
):
    return await ProductCategoryService.bulk_reorder_categories(db, current_profile.school_id, category_orders)


# BULK ACTIVATE/DEACTIVATE
@router.put("/bulk-activate", response_model=List[ProductCategoryOut])
async def bulk_activate(
    category_ids: List[int],
    is_active: bool,
    db: AsyncSession = Depends(get_db),
    current_profile=Depends(get_current_user_profile),
):
    return await ProductCategoryService.bulk_activate_categories(db, current_profile.school_id, category_ids, is_active)
