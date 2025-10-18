# backend/app/services/cart_service.py
"""
Cart Service Layer for SchoolOS E-commerce Module (ASYNC REFACTORED).

This service manages the shopping cart for authenticated users.
Each user has exactly one cart (1:1 relationship with user_id).

Security Architecture:
- All cart operations are strictly user-scoped (auth.uid() from JWT)
- RLS policies enforce user can only access their own cart
- Stock validation happens at cart addition (immediate feedback)

Performance Optimization:
- get_cart returns hydrated CartOut with single JOIN query (no N+1)
- Cart persists across sessions (not session-based)
"""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.product import Product
from app.schemas.cart_schema import CartItemIn


class CartService:
    """Service class for asynchronous shopping cart operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_cart(self, user_id: UUID) -> Cart:
        """
        Get user's cart or create one if it doesn't exist.

        Business Rule: Each user has exactly ONE cart (enforced by unique constraint on user_id).

        Args:
            user_id: User ID from JWT

        Returns:
            Cart instance (existing or newly created)
        """
        # Try to find existing cart
        stmt = select(Cart).where(Cart.user_id == user_id)
        result = await self.db.execute(stmt)
        cart = result.scalars().first()

        # Create if doesn't exist
        if not cart:
            cart = Cart(user_id=user_id)
            self.db.add(cart)
            await self.db.commit()
            await self.db.refresh(cart)

        return cart

    async def get_hydrated_cart(self, user_id: UUID) -> Cart:
        """
        Get user's cart with full product details (hydrated response).

        Performance Note:
        - Single database query with JOINs across:
          * carts
          * cart_items
          * products
          * product_categories
        - Eliminates N+1 query anti-pattern
        - Optimized for mobile apps with limited bandwidth

        Args:
            user_id: User ID from JWT

        Returns:
            Cart instance with items.product and items.product.category loaded
        """
        stmt = select(Cart).options(selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.category)).where(Cart.user_id == user_id)
        result = await self.db.execute(stmt)
        cart = result.scalars().first()

        # Create cart if doesn't exist
        if not cart:
            cart = Cart(user_id=user_id)
            self.db.add(cart)
            await self.db.commit()
            await self.db.refresh(cart)

        return cart

    async def add_item_to_cart(self, user_id: UUID, item_in: CartItemIn) -> Cart:
        """
        Add a product to cart or update quantity if already exists.

        Business Rules:
        - Product must exist and be active
        - Requested quantity must not exceed available stock
        - If product already in cart, quantities are updated (not duplicated)

        Args:
            user_id: User ID from JWT
            item_in: Product ID and quantity to add

        Returns:
            Updated Cart instance with hydrated items

        Raises:
            HTTPException 404: If product doesn't exist
            HTTPException 400: If product is inactive or insufficient stock
        """
        print("DEBUG: entering add_item_to_cart with", item_in)

        # Get or create cart
        cart = await self.get_or_create_cart(user_id)

        # Validate product exists and is active
        stmt = select(Product).where(Product.product_id == item_in.product_id)
        result = await self.db.execute(stmt)
        product = result.scalars().first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item_in.product_id} not found",
            )

        if not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product.name}' is no longer available",
            )

        # Check if product already in cart
        stmt = select(CartItem).where(
            and_(
                CartItem.cart_id == cart.cart_id,
                CartItem.product_id == item_in.product_id,
            )
        )
        result = await self.db.execute(stmt)
        existing_item = result.scalars().first()

        if existing_item:
            # Update quantity (add to existing)
            new_quantity = existing_item.quantity + item_in.quantity
        else:
            # New item
            new_quantity = item_in.quantity

        # Validate stock availability
        if new_quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. " f"Requested: {new_quantity}, Available: {product.stock_quantity}",
            )

        # Update or create cart item
        if existing_item:
            existing_item.quantity = new_quantity
        else:
            new_item = CartItem(
                cart_id=cart.cart_id,
                product_id=item_in.product_id,
                quantity=item_in.quantity,
            )
            self.db.add(new_item)

        # Update cart timestamp
        cart.updated_at = func.now()

        await self.db.commit()

        # Return hydrated cart
        return await self.get_hydrated_cart(user_id)

    async def update_item_quantity(self, user_id: UUID, product_id: int, new_quantity: int) -> Cart:
        """
        Update the quantity of a specific cart item.

        Business Rules:
        - Item must exist in user's cart
        - New quantity must not exceed available stock
        - Quantity must be between 1-100 (validated in schema)

        Args:
            user_id: User ID from JWT
            product_id: Product ID to update
            new_quantity: New quantity

        Returns:
            Updated Cart instance with hydrated items

        Raises:
            HTTPException 404: If cart item doesn't exist
            HTTPException 400: If insufficient stock
        """
        # Get cart
        cart = await self.get_or_create_cart(user_id)

        # Find cart item
        stmt = select(CartItem).where(
            and_(
                CartItem.cart_id == cart.cart_id,
                CartItem.product_id == product_id,
            )
        )
        result = await self.db.execute(stmt)
        cart_item = result.scalars().first()

        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {product_id} not found in your cart",
            )

        # Validate stock
        stmt = select(Product).where(Product.product_id == product_id)
        result = await self.db.execute(stmt)
        product = result.scalars().first()

        if new_quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. " f"Requested: {new_quantity}, Available: {product.stock_quantity}",
            )

        # Update quantity
        cart_item.quantity = new_quantity

        # Update cart timestamp
        cart.updated_at = func.now()

        await self.db.commit()

        # Return hydrated cart
        return await self.get_hydrated_cart(user_id)

    async def remove_item_from_cart(self, user_id: UUID, product_id: int) -> Cart:
        """
        Remove a product from the cart.

        Args:
            user_id: User ID from JWT
            product_id: Product ID to remove

        Returns:
            Updated Cart instance with hydrated items

        Raises:
            HTTPException 404: If cart item doesn't exist
        """
        # Get cart
        cart = await self.get_or_create_cart(user_id)

        # Find cart item
        stmt = select(CartItem).where(
            and_(
                CartItem.cart_id == cart.cart_id,
                CartItem.product_id == product_id,
            )
        )
        result = await self.db.execute(stmt)
        cart_item = result.scalars().first()

        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {product_id} not found in your cart",
            )

        await self.db.delete(cart_item)

        # Update cart timestamp
        cart.updated_at = func.now()

        await self.db.commit()

        # Return hydrated cart
        return await self.get_hydrated_cart(user_id)

    async def clear_cart(self, user_id: UUID) -> Cart:
        """
        Clear all items from user's cart.

        Use Case: Called after successful checkout.

        Args:
            user_id: User ID from JWT

        Returns:
            Empty Cart instance
        """
        # Get cart
        cart = await self.get_or_create_cart(user_id)

        # Delete all cart items
        stmt = select(CartItem).where(CartItem.cart_id == cart.cart_id)
        result = await self.db.execute(stmt)
        cart_items = result.scalars().all()

        for item in cart_items:
            await self.db.delete(item)

        # Update cart timestamp
        cart.updated_at = func.now()

        await self.db.commit()

        # Return empty cart
        return await self.get_hydrated_cart(user_id)
