"""# backend/app/models/order.py
from sqlalchemy import UUID, Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Order(Base):

    SQLAlchemy model for the orders table.


    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    parent_user_id = Column(UUID, ForeignKey("profiles.user_id"), nullable=False)

    order_number = Column(String, unique=True, nullable=False)
    total_amount = Column(Numeric, nullable=False)
    status = Column(String, default="Pending")  # Pending, Completed, Cancelled

    # Relationships
    student = relationship("Student")
    parent = relationship("Profile")
    items = relationship("OrderItem", back_populates="order")  # Link to order items
"""
