# app/models/discount.py

from sqlalchemy import JSON, TIMESTAMP, Boolean, CheckConstraint, Column, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base

# We will create this enums file in the next phase, but import it now
from app.schemas.enums import DiscountType


class Discount(Base):
    __tablename__ = "discounts"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id", ondelete="CASCADE"), nullable=False)

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    type = Column(
        Enum(
            DiscountType,
            name="discount_type",
            create_type=False,
            # This line is the critical fix. It tells SQLAlchemy to use the enum's value.
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )
    value = Column(Numeric(10, 2), nullable=False)
    rules = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(TIMESTAMP(timezone=True), server_default="now()", nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default="now()", onupdate="now()", nullable=False)

    # Relationship to School
    school = relationship("School", back_populates="discounts")

    __table_args__ = (
        CheckConstraint("value > 0", name="chk_discount_value_positive"),
        CheckConstraint("type != 'percentage' OR (value >= 0 AND value <= 100)", name="chk_discount_percentage"),
    )
