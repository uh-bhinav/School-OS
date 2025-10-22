# # backend/app/services/cart_service.py
# from typing import Optional
# from uuid import UUID

# from fastapi import HTTPException, status
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select

# from app.models.cart import Cart
# from app.models.cart_item import CartItem
# from app.schemas.cart_schema import CartItemIn, CartOut


# async def get_or_create_cart(db: AsyncSession, user_id: UUID) -> Cart:
#     """Retrieves the user's cart or creates a new one if it doesn't exist."""
#     stmt = select(Cart).where(Cart.user_id == user_id)
#     result = await db.execute(stmt)
#     cart = result.scalars().first()

#     if not cart:
#         db_cart = Cart(user_id=user_id)
#         db.add(db_cart)
#         await db.commit()
#         await db.refresh(db_cart)
#         return db_cart
#     return cart


# async def add_or_update_item(
#     db: AsyncSession, user_id: UUID, item_in: CartItemIn
# ) -> Cart:
#     """Adds a new item or updates the quantity of an existing item."""
#     cart = await get_or_create_cart(db, user_id)

#     # Check if item already exists in cart
#     stmt = select(CartItem).where(
#         CartItem.cart_id == cart.cart_id, CartItem.product_id == item_in.product_id
#     )
#     result = await db.execute(stmt)
#     cart_item = result.scalars().first()

#     if cart_item:
#         # Update quantity
#         cart_item.quantity = item_in.quantity
#     else:
#         # Add new item
#         cart_item = CartItem(
#             cart_id=cart.cart_id,
#             product_id=item_in.product_id,
#             quantity=item_in.quantity,
#         )
#         db.add(cart_item)

#     await db.commit()
#     return await get_cart(db, user_id)  # Return the full, updated cart


# async def remove_item(db: AsyncSession, user_id: UUID, product_id: int) -> Cart:
#     """Removes an item completely from the cart."""
#     cart = await get_or_create_cart(db, user_id)

#     stmt = select(CartItem).where(
#         CartItem.cart_id == cart.cart_id, CartItem.product_id == product_id
#     )
#     result = await db.execute(stmt)
#     cart_item = result.scalars().first()

#     if cart_item:
#         await db.delete(cart_item)
#         await db.commit()
#         return await get_cart(db, user_id)

#     raise HTTPException(
#         status_code=status.HTTP_404_NOT_FOUND, detail="Item not found in cart."
#     )


# async def clear_cart(db: AsyncSession, user_id: UUID) -> None:
#     """Deletes all items from the user's cart (used after successful checkout)."""
#     cart = await get_or_create_cart(db, user_id)

#     await db.execute(select(CartItem)
#     .where(CartItem.cart_id == cart.cart_id).delete())
#     await db.commit()


# async def get_cart(db: AsyncSession, user_id: UUID) -> Optional[CartOut]:
#     """Retrieves the full cart details for a user."""
#     stmt = select(Cart).where(Cart.user_id == user_id)
#     result = await db.execute(stmt)
#     cart = result.scalars().first()

#     if cart:
#         # Simple placeholder logic to load items;
#         #  requires selectinload in a proper setup
#         # For simplicity, we return the model which should
#         #  auto-populate relationships if loaded synchronously.
#         return cart
#     return None
