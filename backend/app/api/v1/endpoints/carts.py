# backend/app/api/v1/endpoints/carts.py
"""
Shopping Cart API Endpoints.

These endpoints allow authenticated parents to manage their shopping cart.

Security:
- All endpoints require authentication
- User can only access their own cart (enforced by JWT user_id)
- RLS policies provide defense-in-depth
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user_profile, get_db
from app.models.profile import Profile
from app.schemas.cart_schema import CartItemIn, CartItemUpdateQuantity, CartOut
from app.services.cart_service import CartService

router = APIRouter(
    prefix="/carts",
    tags=["Shopping Cart"],
)


@router.get(
    "/me",
    response_model=CartOut,
)
async def get_my_cart(
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get current user's shopping cart with all items.

    Returns:
    - Hydrated cart with full product details
    - Computed totals and availability flags
    - Empty cart if no items
    """
    return await CartService.get_hydrated_cart(
        db=db,
        user_id=current_profile.user_id,
    )


@router.post(
    "/me/items",
    response_model=CartOut,
    status_code=status.HTTP_201_CREATED,
)
async def add_item_to_cart(
    item_in: CartItemIn,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Add a product to cart or update quantity if already exists.

    Business Rules:
    - Product must exist and be active
    - Requested quantity must not exceed available stock
    - If product already in cart, quantities are added together

    Request Body:
    - product_id: ID of product to add
    - quantity: Quantity to add (1-100)

    Returns:
    - Updated cart with all items

    Raises:
    - 404: If product doesn't exist
    - 400: If product is inactive or insufficient stock
    """
    return await CartService.add_item_to_cart(
        db=db,
        user_id=current_profile.user_id,
        item_in=item_in,
    )


@router.patch(
    "/me/items/{product_id}",
    response_model=CartOut,
)
async def update_cart_item_quantity(
    product_id: int,
    quantity_update: CartItemUpdateQuantity,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Update the quantity of a specific cart item.

    Request Body:
    - quantity: New quantity (1-100)

    Returns:
    - Updated cart

    Raises:
    - 404: If product not in cart
    - 400: If insufficient stock
    """
    return await CartService.update_item_quantity(
        db=db,
        user_id=current_profile.user_id,
        product_id=product_id,
        new_quantity=quantity_update.quantity,
    )


@router.delete(
    "/me/items/{product_id}",
    response_model=CartOut,
)
async def remove_item_from_cart(
    product_id: int,
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Remove a specific item from cart.

    Returns:
    - Updated cart without the removed item

    Raises:
    - 404: If product not in cart
    """
    return await CartService.remove_item_from_cart(
        db=db,
        user_id=current_profile.user_id,
        product_id=product_id,
    )


@router.post(
    "/me/clear",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def clear_cart(
    db: Session = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Clear all items from cart.

    Use Case:
    - User wants to start over
    - Called automatically after successful checkout

    Returns:
    - 204 No Content
    """
    await CartService.clear_cart(
        db=db,
        user_id=current_profile.user_id,
    )
    return None
