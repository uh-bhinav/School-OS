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
