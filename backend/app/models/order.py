# backend/app/models/order.py
from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, Numeric, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.schemas.enums import OrderStatus


class Order(Base):
    """
    SQLAlchemy model for the orders table.
    Represents a permanent order record created from a user's cart.

    RLS POLICY: Parents can only access orders for their linked students.
    """

    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    parent_user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.user_id"), nullable=False)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)  # ADD IF MISSING

    order_number = Column(String, unique=True, nullable=False, index=True)
    # NOTE: Generated in service layer as f"ORD-{school_id}-{timestamp}-{order_id}"

    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(
        SQLEnum(
            OrderStatus,
            name="order_status_enum",
            create_type=False,  # Don't create the enum (already exists in DB)
            native_enum=True,  # ✅ This tells SQLAlchemy to use PostgreSQL ENUM type
            values_callable=lambda x: [e.value for e in x],  # ✅ Map enum values explicitly
        ),
        nullable=False,
        default=OrderStatus.PENDING_PAYMENT,
    )
    # Valid: 'pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'

    created_at = Column(DateTime(timezone=True), nullable=False, default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, default=func.now(), onupdate=func.now())

    # --- Relationships ---
    student = relationship("Student", back_populates="orders", lazy="selectin")
    parent = relationship("Profile", foreign_keys=[parent_user_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan", lazy="selectin")

    # Link to payment (one-to-one)

    payment = relationship("Payment", back_populates="order", uselist=False)

    # --- Indexes for Performance ---
    __table_args__ = (
        Index("idx_orders_parent_user_id", "parent_user_id"),
        Index("idx_orders_student_id", "student_id"),
        Index("idx_orders_status", "status"),
    )
