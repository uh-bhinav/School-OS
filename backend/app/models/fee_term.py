from sqlalchemy import TIMESTAMP, Column, Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class FeeTerm(Base):
    __tablename__ = "fee_terms"

    id = Column(Integer, primary_key=True)
    fee_template_id = Column(Integer, ForeignKey("fee_templates.id"), nullable=False)

    name = Column(String, nullable=False)
    due_date = Column(Date, nullable=False)
    amount = Column(Numeric, nullable=False)

    created_at = Column(TIMESTAMP(timezone=True), server_default="now()")

    # The relationship syntax itself does not change
    fee_template = relationship("FeeTemplate", back_populates="fee_terms")
    discounts = relationship("StudentFeeDiscount", back_populates="fee_term")
