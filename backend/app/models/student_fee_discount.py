# app/models/fee_discount.py

from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class FeeDiscount(Base):
    __tablename__ = "fee_discounts"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    fee_term_id = Column(Integer, ForeignKey("fee_terms.id"))

    amount = Column(Numeric, nullable=False)
    reason = Column(Text)

    created_at = Column(TIMESTAMP(timezone=True), server_default="now()")

    student = relationship("Student", back_populates="fee_discounts")
    fee_term = relationship("FeeTerm", back_populates="discounts")
