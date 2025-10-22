# backend/app/models/school.py
from sqlalchemy import Boolean, Column, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB

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
