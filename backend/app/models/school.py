# backend/app/models/school.py
from sqlalchemy import Boolean, Column, Integer, LargeBinary, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class School(Base):
    """
    SQLAlchemy model for the schools table.
    """

    __tablename__ = "schools"

    school_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    logo_url = Column(String)
    address = Column(Text)
    city = Column(String)
    state = Column(String)
    postal_code = Column(String)
    country = Column(String)
    phone_number = Column(String)
    email = Column(String)
    website = Column(String)
    configuration = Column(JSONB)
    is_active = Column(Boolean, default=True)

    razorpay_key_id_encrypted = Column(LargeBinary, nullable=True)
    razorpay_key_secret_encrypted = Column(LargeBinary, nullable=True)
    razorpay_webhook_secret_encrypted = Column(LargeBinary, nullable=True)

    discounts = relationship("Discount", back_populates="school")
    fee_components = relationship("FeeComponent", back_populates="school")
    fee_templates = relationship("FeeTemplate", back_populates="school")
    school = relationship("School", back_populates="product_packages")
