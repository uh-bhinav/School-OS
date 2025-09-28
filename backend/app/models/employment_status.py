# backend/app/models/employment_status.py
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class EmploymentStatus(Base):
    __tablename__ = "employment_statuses"

    status_id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    status_name = Column(String, nullable=False)

    school = relationship("School")
