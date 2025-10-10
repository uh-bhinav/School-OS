# # backend/app/api/v1/endpoints/orders.py
# # Standard library imports
# from uuid import uuid4

# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.ext.asyncio import AsyncSession
# from supabase_auth.types import User

# from app.core.security import get_current_user_profile, require_role
# from app.db.session import get_db
# from app.schemas.order_schema import OrderCreate, OrderOut, OrderUpdate
# from app.utils.order_utils import generate_order_number
# from app.services import order_service

# router = APIRouter()


# # # Helper function to generate a unique order number
# # def generate_order_number() -> str:
# #     # In a real app, this would use a database sequence or a guaranteed unique service
# #     return f"ORD-{uuid4().hex[:8].upper()}"


# @router.post(
#     "/",
#     response_model=OrderOut,
#     status_code=status.HTTP_201_CREATED,
#     dependencies=[Depends(require_role("Parent"))],
#     tags=["E-commerce: Orders"],
# )
# async def place_new_order(
#     order_in: OrderCreate,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(get_current_user_profile),
# ):
#     """
#     Places a new order. Triggers stock checks and deduction. Parent only.
#     """
#     order_number = generate_order_number()
#     try:
#         new_order = await order_service.create_order(
#             db=db,
#             obj_in=order_in,
#             parent_user_id=current_user.id,
#             order_number=order_number,
#         )
#         return new_order
#     except HTTPException as e:
#         # Re-raise explicit exceptions from the service
#         raise e
#     except Exception as e:
#         # Catch any unexpected database/logic errors
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"An unexpected error occurred while placing the order: {e}",
#         )


# @router.get("/my-orders", response_model=list[OrderOut], tags=["E-commerce: Orders"])
# async def get_my_orders(
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(get_current_user_profile),
# ):
#     """
#     Gets all orders placed by the current authenticated parent.
#     """
#     # RLS/Service layer logic ensures only the parent's orders are returned
#     return await order_service.get_all_orders_for_parent(db=db, parent_user_id=current_user.id)


# @router.get("/{order_id}", response_model=OrderOut, tags=["E-commerce: Orders"])
# async def get_order_details(order_id: int, db: AsyncSession = Depends(get_db)):
#     """
#     Gets a specific order. RLS/Service must ensure user has access.
#     """
#     order = await order_service.get_order(db=db, order_id=order_id)
#     if not order:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

#     # Implicit RLS or explicit service logic handles parent/admin access check here
#     return order


# @router.put(
#     "/{order_id}",
#     response_model=OrderOut,
#     dependencies=[Depends(require_role("Admin"))],
#     tags=["E-commerce: Orders"],
# )
# async def update_order_status(order_id: int, order_in: OrderUpdate, db: AsyncSession = Depends(get_db)):
#     """
#     Updates the order status (e.g., Admin marks as Shipped/Completed). Admin only.
#     """
#     order = await order_service.get_order(db=db, order_id=order_id)
#     if not order:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

#     return await order_service.update_order(db=db, db_obj=order, obj_in=order_in)


# # No DELETE endpoint provided, as financial records should be kept.
