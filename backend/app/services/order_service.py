# backend/app/services/order_service.py
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product  # Needed for price lookup and stock check
from app.schemas.order_schema import OrderCreate, OrderUpdate


async def create_order(db: AsyncSession, *, obj_in: OrderCreate, parent_user_id: UUID, order_number: str) -> Order:
    """Creates a new order, calculates total, checks stock,
    creates order items, and updates product stock."""
    total_amount = Decimal(0)
    items_to_insert = []

    # 1. Validate items, calculate total, and check stock within a transaction
    for item_in in obj_in.items:
        product = await db.get(Product, item_in.product_id)
        if not product or not product.is_active or product.stock_quantity < item_in.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product ID {item_in.product_id} is out of stock or inactive.",
            )

        item_price = product.price * item_in.quantity
        total_amount += item_price

        # Prepare data for OrderItem table
        items_to_insert.append(
            {
                "product_id": item_in.product_id,
                "quantity": item_in.quantity,
                "price_at_time_of_order": product.price,
            }
        )
    # 2. Create the main Order object
    order_data = obj_in.model_dump(exclude={"items"})
    db_order = Order(
        **order_data,
        parent_user_id=parent_user_id,
        order_number=order_number,
        total_amount=total_amount,
        status="Pending",
    )
    db.add(db_order)
    await db.flush()  # Flush to get the order_id before committing

    # 3. Create OrderItem entries and update stock
    for item_detail in items_to_insert:
        db_order_item = OrderItem(order_id=db_order.order_id, **item_detail)
        db.add(db_order_item)

        # Update stock (assuming Product model has
        #  been retrieved and is tracked by the session)
        product_to_update = await db.get(Product, item_detail["product_id"])
        if product_to_update:
            product_to_update.stock_quantity -= item_detail["quantity"]

    await db.commit()
    await db.refresh(db_order)
    return db_order


async def get_order(db: AsyncSession, order_id: int) -> Optional[Order]:
    """Retrieves a single order with its items."""
    # Note: In production, you would add selectinload
    # (Order.items) to load items efficiently.
    stmt = select(Order).where(Order.order_id == order_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_orders_for_parent(db: AsyncSession, parent_user_id: UUID) -> list[Order]:
    """Retrieves all orders placed by a specific parent."""
    stmt = select(Order).where(Order.parent_user_id == parent_user_id).order_by(Order.order_id.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_order(db: AsyncSession, *, db_obj: Order, obj_in: OrderUpdate) -> Order:
    """Updates order status (e.g., from Pending to Completed/Cancelled)."""
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


# Deletion is typically not allowed for financial records; only status updates.
