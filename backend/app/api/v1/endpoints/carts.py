# backend/app/api/v1/endpoints/carts.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.cart_schema import CartItemIn, CartOut
from app.services import cart_service

router = APIRouter()


@router.get("/me", response_model=CartOut, tags=["E-commerce: Cart"])
async def get_user_cart(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user_profile),
):
    """Retrieves the current user's shopping cart."""
    cart = await cart_service.get_cart(db=db, user_id=current_user.user_id)
    if not cart:
        # Create an empty cart if one doesn't exist yet
        cart = await cart_service.get_or_create_cart(db, current_user.user_id)

    # Note: Conversion to CartOut might need explicit item mapping due to async ORM
    return cart


@router.post("/me/items", response_model=CartOut, tags=["E-commerce: Cart"])
async def add_or_update_cart_item(
    item_in: CartItemIn,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user_profile),
):
    """Adds an item to the cart or updates the quantity if it exists."""
    return await cart_service.add_or_update_item(
        db=db, user_id=current_user.user_id, item_in=item_in
    )


@router.delete(
    "/me/items/{product_id}", response_model=CartOut, tags=["E-commerce: Cart"]
)
async def remove_cart_item(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user_profile),
):
    """Removes a specific item from the cart."""
    return await cart_service.remove_item(
        db=db, user_id=current_user.user_id, product_id=product_id
    )


@router.post(
    "/me/clear", status_code=status.HTTP_204_NO_CONTENT, tags=["E-commerce: Cart"]
)
async def clear_shopping_cart(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user_profile),
):
    """Clears all items in the cart (e.g., after successful order placement)."""
    await cart_service.clear_cart(db=db, user_id=current_user.user_id)
    return None
