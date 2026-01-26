# backend/app/models/role_definition.py

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class RoleDefinition(Base):
    """
    SQLAlchemy model for the roles_definition table.
    This table stores the names of the roles available in the system.
    """

    __tablename__ = "roles_definition"

    role_id = Column(Integer, primary_key=True)
    role_name = Column(String, unique=True, nullable=False, index=True)

    # This creates a "back-reference" so you can easily find all
    # user_role links associated with a specific role definition.
    user_roles = relationship("UserRole", back_populates="role_definition")
