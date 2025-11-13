# app/models/fee_discount.py

from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class StudentFeeDiscount(Base):
    __tablename__ = "student_fee_discounts"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    fee_term_id = Column(Integer, ForeignKey("fee_terms.id"))
    applied_by_user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.user_id"), nullable=False)

    amount = Column(Numeric, nullable=False)
    reason = Column(Text)

    created_at = Column(TIMESTAMP(timezone=True), server_default="now()")
    discount_id = Column(Integer, ForeignKey("discounts.id"), nullable=False)

    student = relationship("Student", back_populates="fee_discounts")
    fee_term = relationship("FeeTerm", back_populates="discounts", foreign_keys=[fee_term_id])
    discount = relationship("Discount")
    applied_by = relationship("Profile")
