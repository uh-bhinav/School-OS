# # backend/app/api/v1/endpoints/products.py

# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.ext.asyncio import AsyncSession

# from app.core.security import require_role
# from app.db.session import get_db
# from app.schemas.product_schema import ProductCreate, ProductOut, ProductUpdate
# from app.services import product_service

# router = APIRouter()


# # --- Admin CRUD ---
# @router.post(
#     "/",
#     response_model=ProductOut,
#     status_code=status.HTTP_201_CREATED,
#     dependencies=[Depends(require_role("Admin"))],
#     tags=["E-commerce"],
# )
# async def create_new_product(product_in: ProductCreate, db: AsyncSession = Depends(get_db)):
#     """Create a new product for sale. Admin only."""
#     return await product_service.create_product(db=db, obj_in=product_in)


# @router.put(
#     "/{product_id}",
#     response_model=ProductOut,
#     dependencies=[Depends(require_role("Admin"))],
#     tags=["E-commerce"],
# )
# async def update_product_by_id(product_id: int, product_in: ProductUpdate, db: AsyncSession = Depends(get_db)):
#     """Update product details or stock quantity. Admin only."""
#     product = await product_service.get_product(db=db, product_id=product_id)
#     if not product:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
#     return await product_service.update_product(db=db, db_obj=product, obj_in=product_in)


# @router.delete(
#     "/{product_id}",
#     status_code=status.HTTP_204_NO_CONTENT,
#     # Standard status for successful DELETE
#     dependencies=[Depends(require_role("Admin"))],
#     tags=["E-commerce"],
# )
# async def delete_product_by_id(product_id: int, db: AsyncSession = Depends(get_db)):
#     """Deactivates a product (SOFT DELETE). Admin only."""
#     # Attempt to get the product, ignoring the
#     # active filter (we need the record to set it inactive)
#     product = await db.get(product_service.Product, product_id)

#     if not product:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

#     if not product.is_active:
#         # If it's already inactive, consider
#         #  the operation successful and return 204
#         return None

#     # Call the service function to set is_active=False
#     await product_service.delete_product(db=db, db_obj=product)
#     return None


# # --- Public/User Read Access (RLS will filter by school_id) ---
# @router.get(
#     "/{product_id}",
#     response_model=ProductOut,
#     dependencies=[Depends(require_role("Parent"))],
#     tags=["E-commerce"],
# )
# async def get_product_by_id(product_id: int, db: AsyncSession = Depends(get_db)):
#     """Get a specific product (available to Parent/Student via RLS)."""
#     product = await product_service.get_product(db=db, product_id=product_id)
#     if not product:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
#     return product


# @router.get("/school/{school_id}", response_model=list[ProductOut], tags=["E-commerce"])
# async def get_all_active_products(school_id: int, db: AsyncSession = Depends(get_db)):
#     """Get all active products for a school (available to all users via RLS)."""
#     return await product_service.get_all_products_for_school(db=db, school_id=school_id)
from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user_roles import User
from app.schemas.product_schema import Product, ProductCreate
from app.services.media_service import media_service
from app.services.product_service import product_service

router = APIRouter()


@router.get("/", response_model=list[Product])
def read_products(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve products for the user's school.
    """
    products = product_service.get_products_by_school(db, school_id=current_user.school_id, skip=skip, limit=limit)
    return products


@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(
    *,
    db: Session = Depends(deps.get_db),
    product_in: ProductCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new product. Restricted to School Admins.
    """
    if not deps.is_school_admin(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    product = product_service.create_product(db=db, product=product_in, school_id=current_user.school_id)
    return product


@router.get("/{product_id}", response_model=Product)
def read_product(
    product_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get a specific product by ID.
    """
    product = product_service.get_product(db, product_id=product_id)
    if not product or product.school_id != current_user.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


# --- NEW ENDPOINTS FROM ROADMAP ---


@router.post("/{product_id}/images", response_model=Product)
async def upload_product_image(
    *,
    product_id: int,
    db: Session = Depends(deps.get_db),
    album_id: int = Form(...),
    is_primary: bool = Form(False),
    display_order: int = Form(0),
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload an image for a product and link it.
    The image is added to a specified 'ecommerce' album.
    Restricted to School Admins.
    """
    if not deps.is_school_admin(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to upload product images")

    # First, upload the media item to get its storage path
    media_item = await media_service.upload_media_item(db=db, album_id=album_id, file=file, uploaded_by_id=current_user.user_id)

    # Second, link the uploaded media's path to the product
    product_service.link_product_to_album(db=db, product_id=product_id, album_id=album_id, storage_path=media_item.storage_path, is_primary=is_primary, display_order=display_order)

    # Return the product with the updated image relationships
    return product_service.get_product(db, product_id=product_id)


@router.get("/{product_id}/images", response_model=list[dict])
def get_product_images_with_urls(
    product_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all accessible images for a product, with signed URLs.
    """
    user_context = deps.get_user_context_from_user(db, user=current_user)
    images = product_service.get_product_images(db=db, product_id=product_id, user_context=user_context)
    return images
