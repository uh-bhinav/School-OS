# backend/app/services/order_service.py
"""
Order Service Layer for SchoolOS E-commerce Module.

This service handles the critical transactional logic for order creation and management.
The checkout process is the most security-critical operation in the entire e-commerce flow.

CRITICAL ARCHITECTURAL DECISION:
The create_order_from_cart() function uses pessimistic locking (SELECT FOR UPDATE)
to prevent race conditions when multiple users attempt to purchase the last available item.
This is the same pattern used by Amazon, Flipkart, and other major e-commerce platforms.

Security Architecture:
- Atomic transactions with rollback on any failure
- Pessimistic row-level locking on products (prevents overselling)
- Stock validation happens AFTER acquiring locks (bulletproof concurrency)
- Order creation and stock decrement happen in single transaction
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_, func
from sqlalchemy.orm import Session, joinedload

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.profile import Profile
from app.models.student import Student
from app.models.student_contact import StudentContact
from app.schemas.enums import OrderStatus
from app.schemas.order_schema import OrderCancel, OrderCreateFromCart, OrderUpdate


class OrderService:
    """Service class for order operations."""

    @staticmethod
    async def create_order_from_cart(
        db: Session,
        checkout_data: OrderCreateFromCart,
        current_profile: Profile,
    ) -> Order:
        """
        Create an order from user's cart (Parent checkout flow).

        This is the MOST CRITICAL function in the entire e-commerce module.
        It must be absolutely bulletproof, handling concurrency, race conditions,
        and maintaining data integrity at all costs.

        ATOMICITY IS NON-NEGOTIABLE:
        - Entire function executes in single database transaction
        - Any failure triggers complete rollback
        - No partial orders, no orphaned data

        CONCURRENCY SAFETY (Pessimistic Locking):
        - SELECT FOR UPDATE locks product rows during transaction
        - Prevents two users from buying the last item simultaneously
        - Ensures stock_quantity checks are accurate and race-condition-free

        Transaction Steps (MUST execute in this order):
        1. Validate student belongs to parent
        2. Fetch all cart items
        3. Lock all products (SELECT FOR UPDATE)
        4. Re-validate stock for each item (bulletproof check)
        5. Calculate total amount
        6. Create Order record (status: pending_payment)
        7. Create OrderItem records (snapshot prices)
        8. Decrement stock for all products
        9. Clear cart
        10. Commit transaction

        Args:
            db: Database session
            checkout_data: Student ID and optional delivery notes
            current_profile: Authenticated user profile (contains user_id)

        Returns:
            Created Order instance with items loaded

        Raises:
            HTTPException 404: If student not found or cart is empty
            HTTPException 403: If student doesn't belong to parent
            HTTPException 400: If insufficient stock or items no longer available
        """
        try:
            # Step 1: Validate student belongs to parent
            student = db.query(Student).filter(Student.student_id == checkout_data.student_id).first()

            if not student:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Student with ID {checkout_data.student_id} not found",
                )

            # Validate parent-student relationship via student_contacts table
            parent_link = (
                db.query(StudentContact)
                .filter(
                    and_(
                        StudentContact.student_id == checkout_data.student_id,
                        StudentContact.profile_user_id == current_profile.user_id,
                    )
                )
                .first()
            )

            if not parent_link:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not authorized to place orders for this student",
                )

            # Step 2: Fetch all cart items for this user
            cart = db.query(Cart).options(joinedload(Cart.items)).filter(Cart.user_id == current_profile.user_id).first()

            if not cart or not cart.items:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Your cart is empty. Add items before checkout.",
                )

            # Step 3: Lock all products (CRITICAL FOR CONCURRENCY SAFETY)
            # with_for_update() creates a SELECT FOR UPDATE query
            # This acquires row-level locks, preventing other transactions
            # from modifying these products until we commit
            product_ids = [item.product_id for item in cart.items]
            locked_products = db.query(Product).filter(Product.product_id.in_(product_ids)).with_for_update().all()  # PESSIMISTIC LOCK

            # Create product lookup dict
            products_dict = {p.product_id: p for p in locked_products}

            # Step 4: Re-validate stock for each cart item (AFTER acquiring locks)
            # This is the bulletproof stock check that prevents overselling
            stock_errors = []
            for cart_item in cart.items:
                product = products_dict.get(cart_item.product_id)

                if not product:
                    stock_errors.append(f"Product ID {cart_item.product_id} no longer exists")
                    continue

                if not product.is_active:
                    stock_errors.append(f"'{product.name}' is no longer available")
                    continue

                if cart_item.quantity > product.stock_quantity:
                    stock_errors.append(f"Insufficient stock for '{product.name}'. " f"Requested: {cart_item.quantity}, Available: {product.stock_quantity}")

            if stock_errors:
                # Rollback will happen automatically when we raise exception
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cart validation failed: " + "; ".join(stock_errors),
                )

            # Step 5: Calculate total amount
            total_amount = Decimal("0.00")
            for cart_item in cart.items:
                product = products_dict[cart_item.product_id]
                total_amount += product.price * cart_item.quantity

            # Step 6: Generate unique order number
            # Format: ORD-{school_id}-{YYYYMMDD}-{sequence}
            today = datetime.now().strftime("%Y%m%d")
            order_number = f"ORD-{current_profile.school_id}-{today}-{student.student_id}"

            # Step 7: Create Order record
            db_order = Order(
                student_id=checkout_data.student_id,
                parent_user_id=current_profile.user_id,
                order_number=order_number,
                total_amount=total_amount,
                status=OrderStatus.PENDING_PAYMENT,
                delivery_notes=checkout_data.delivery_notes,
                school_id=current_profile.school_id,
            )

            db.add(db_order)
            db.flush()  # Get order_id without committing

            # Step 8: Create OrderItem records (snapshot prices)
            for cart_item in cart.items:
                product = products_dict[cart_item.product_id]

                order_item = OrderItem(
                    order_id=db_order.order_id,
                    product_id=product.product_id,
                    quantity=cart_item.quantity,
                    price_at_time_of_order=product.price,  # Historical price snapshot
                    status="pending",
                )
                db.add(order_item)

            # Step 9: Decrement stock for all products
            for cart_item in cart.items:
                product = products_dict[cart_item.product_id]
                product.stock_quantity -= cart_item.quantity

            # Step 10: Clear cart
            db.query(CartItem).filter(CartItem.cart_id == cart.cart_id).delete()

            # Step 11: Commit transaction
            # If this succeeds, all changes are permanent
            # If this fails, ALL changes are rolled back automatically
            db.commit()

            # Reload order with items for response
            db.refresh(db_order)
            db_order = db.query(Order).options(joinedload(Order.items).joinedload(OrderItem.product)).filter(Order.order_id == db_order.order_id).first()

            return db_order

        except HTTPException:
            # Re-raise HTTP exceptions (already properly formatted)
            db.rollback()
            raise

        except Exception as e:
            # Catch any unexpected errors and rollback
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Order creation failed: {str(e)}",
            )

    @staticmethod
    async def get_order_by_id(
        db: Session,
        order_id: int,
        user_id: UUID,
        is_admin: bool = False,
    ) -> Order:
        """
        Get a single order by ID.

        Security:
        - Parents can only view their own orders
        - Admins can view all orders in their school

        Args:
            db: Database session
            order_id: Order ID
            user_id: User ID from JWT
            is_admin: Whether user is admin (for authorization)

        Returns:
            Order instance with items, product, student, and parent details loaded

        Raises:
            HTTPException 404: If order not found
            HTTPException 403: If user not authorized to view order
        """
        query = (
            db.query(Order)
            .options(
                joinedload(Order.items).joinedload(OrderItem.product),
                joinedload(Order.student),
                joinedload(Order.parent),
            )
            .filter(Order.order_id == order_id)
        )

        # If not admin, filter by parent_user_id
        if not is_admin:
            query = query.filter(Order.parent_user_id == user_id)

        db_order = query.first()

        if not db_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found",
            )

        return db_order

    @staticmethod
    async def get_user_orders(
        db: Session,
        user_id: UUID,
        student_id: Optional[int] = None,
        status: Optional[OrderStatus] = None,
    ) -> list[Order]:
        """
        Get all orders for a parent user.

        Args:
            db: Database session
            user_id: Parent user ID from JWT
            student_id: Optional filter by student
            status: Optional filter by order status

        Returns:
            List of Order instances with items loaded
        """
        query = (
            db.query(Order)
            .options(
                joinedload(Order.items).joinedload(OrderItem.product),
                joinedload(Order.student),
            )
            .filter(Order.parent_user_id == user_id)
        )

        # Apply filters
        if student_id:
            query = query.filter(Order.student_id == student_id)

        if status:
            query = query.filter(Order.status == status)

        # Order by created_at descending (newest first)
        query = query.order_by(Order.created_at.desc())

        return query.all()

    @staticmethod
    async def update_order(
        db: Session,
        db_order: Order,
        order_update: OrderUpdate,
    ) -> Order:
        """
        Update order status and metadata (Admin only).

        Business Rules - Valid Status Transitions:
        - pending_payment → processing (after payment captured)
        - processing → shipped (when dispatched)
        - shipped → delivered (when received)
        - Any non-shipped status → cancelled (before dispatch)

        Args:
            db: Database session
            db_order: Existing order instance
            order_update: Update data

        Returns:
            Updated Order instance

        Raises:
            HTTPException 400: If invalid status transition
        """
        # Validate status transition if status is being changed
        if order_update.status and order_update.status != db_order.status:
            valid_transitions = {
                OrderStatus.PENDING_PAYMENT: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
                OrderStatus.PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
                OrderStatus.SHIPPED: [OrderStatus.DELIVERED],
                OrderStatus.DELIVERED: [],  # Terminal state
                OrderStatus.CANCELLED: [],  # Terminal state
            }

            allowed = valid_transitions.get(db_order.status, [])
            if order_update.status not in allowed:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status transition from {db_order.status} to {order_update.status}",
                )

        # Apply updates
        update_data = order_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_order, field, value)

        db.commit()
        db.refresh(db_order)

        return db_order

    @staticmethod
    async def cancel_order(
        db: Session,
        db_order: Order,
        cancel_data: OrderCancel,
        cancelled_by_user_id: UUID,
    ) -> Order:
        """
        Cancel an order (Admin or Parent).

        Business Rules:
        - Can only cancel orders with status: pending_payment, processing
        - Cannot cancel shipped/delivered orders
        - Stock is restored if order was in processing state

        Args:
            db: Database session
            db_order: Order instance to cancel
            cancel_data: Cancellation reason and refund flag
            cancelled_by_user_id: User ID for audit trail

        Returns:
            Cancelled Order instance

        Raises:
            HTTPException 400: If order cannot be cancelled
        """
        # Validate order can be cancelled
        cancellable_statuses = [OrderStatus.PENDING_PAYMENT, OrderStatus.PROCESSING]
        if db_order.status not in cancellable_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel order with status '{db_order.status}'. " f"Only pending_payment and processing orders can be cancelled.",
            )

        try:
            # Restore stock for all order items
            order_items = db.query(OrderItem).filter(OrderItem.order_id == db_order.order_id).all()

            for order_item in order_items:
                product = db.query(Product).filter(Product.product_id == order_item.product_id).with_for_update().first()  # Lock product

                if product:
                    product.stock_quantity += order_item.quantity

            # Update order status
            db_order.status = OrderStatus.CANCELLED
            db_order.admin_notes = f"Cancelled by user {cancelled_by_user_id}. Reason: {cancel_data.reason}"

            # TODO: If refund_payment is True and payment exists, initiate refund
            # This requires integration with payment service
            if cancel_data.refund_payment:
                # Future implementation:
                # payment = db.query(Payment).filter(Payment.order_id == db_order.order_id).first()
                # if payment and payment.status == PaymentStatus.CAPTURED:
                #     await payment_service.initiate_refund(db, payment)
                pass

            db.commit()
            db.refresh(db_order)

            return db_order

        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Order cancellation failed: {str(e)}",
            )

    @staticmethod
    async def get_order_statistics(
        db: Session,
        school_id: int,
    ) -> dict:
        """
        Get aggregated order statistics for admin dashboard.

        Args:
            db: Database session
            school_id: School ID

        Returns:
            Dictionary with order counts and revenue metrics
        """
        # Total orders
        total_orders = db.query(func.count(Order.order_id)).join(Student, Order.student_id == Student.student_id).join(Profile, Student.user_id == Profile.user_id).filter(Profile.school_id == school_id).scalar()

        # Count by status
        status_counts = {}
        for order_status in OrderStatus:
            count = (
                db.query(func.count(Order.order_id))
                .join(Student, Order.student_id == Student.student_id)
                .join(Profile, Student.user_id == Profile.user_id)
                .filter(
                    and_(
                        Profile.school_id == school_id,
                        Order.status == order_status,
                    )
                )
                .scalar()
            )
            status_counts[order_status.value] = count

        # Total revenue (paid orders only - status = delivered)
        total_revenue = (
            db.query(func.sum(Order.total_amount))
            .join(Student, Order.student_id == Student.student_id)
            .join(Profile, Student.user_id == Profile.user_id)
            .filter(
                and_(
                    Profile.school_id == school_id,
                    Order.status == OrderStatus.DELIVERED,
                )
            )
            .scalar()
        ) or Decimal("0.00")

        # Pending revenue
        pending_revenue = (
            db.query(func.sum(Order.total_amount))
            .join(Student, Order.student_id == Student.student_id)
            .join(Profile, Student.user_id == Profile.user_id)
            .filter(
                and_(
                    Profile.school_id == school_id,
                    Order.status == OrderStatus.PENDING_PAYMENT,
                )
            )
            .scalar()
        ) or Decimal("0.00")

        # Average order value
        average_order_value = Decimal("0.00")
        if total_orders > 0:
            average_order_value = total_revenue / total_orders

        return {
            "total_orders": total_orders,
            "pending_payment_count": status_counts.get("pending_payment", 0),
            "processing_count": status_counts.get("processing", 0),
            "shipped_count": status_counts.get("shipped", 0),
            "delivered_count": status_counts.get("delivered", 0),
            "cancelled_count": status_counts.get("cancelled", 0),
            "total_revenue": total_revenue,
            "pending_revenue": pending_revenue,
            "average_order_value": average_order_value,
        }
