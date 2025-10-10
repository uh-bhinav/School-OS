# backend/app/api/v1/endpoints/products.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db
from app.schemas.product_schema import ProductCreate, ProductOut, ProductUpdate
from app.services import product_service

router = APIRouter()


# --- Admin CRUD ---
@router.post(
    "/",
    response_model=ProductOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
    tags=["E-commerce"],
)
async def create_new_product(product_in: ProductCreate, db: AsyncSession = Depends(get_db)):
    """Create a new product for sale. Admin only."""
    return await product_service.create_product(db=db, obj_in=product_in)


@router.put(
    "/{product_id}",
    response_model=ProductOut,
    dependencies=[Depends(require_role("Admin"))],
    tags=["E-commerce"],
)
async def update_product_by_id(product_id: int, product_in: ProductUpdate, db: AsyncSession = Depends(get_db)):
    """Update product details or stock quantity. Admin only."""
    product = await product_service.get_product(db=db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return await product_service.update_product(db=db, db_obj=product, obj_in=product_in)


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    # Standard status for successful DELETE
    dependencies=[Depends(require_role("Admin"))],
    tags=["E-commerce"],
)
async def delete_product_by_id(product_id: int, db: AsyncSession = Depends(get_db)):
    """Deactivates a product (SOFT DELETE). Admin only."""
    # Attempt to get the product, ignoring the
    # active filter (we need the record to set it inactive)
    product = await db.get(product_service.Product, product_id)

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if not product.is_active:
        # If it's already inactive, consider
        #  the operation successful and return 204
        return None

    # Call the service function to set is_active=False
    await product_service.delete_product(db=db, db_obj=product)
    return None


# --- Public/User Read Access (RLS will filter by school_id) ---
@router.get(
    "/{product_id}",
    response_model=ProductOut,
    dependencies=[Depends(require_role("Parent"))],
    tags=["E-commerce"],
)
async def get_product_by_id(product_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific product (available to Parent/Student via RLS)."""
    product = await product_service.get_product(db=db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.get("/school/{school_id}", response_model=list[ProductOut], tags=["E-commerce"])
async def get_all_active_products(school_id: int, db: AsyncSession = Depends(get_db)):
    """Get all active products for a school (available to all users via RLS)."""
    return await product_service.get_all_products_for_school(db=db, school_id=school_id)
