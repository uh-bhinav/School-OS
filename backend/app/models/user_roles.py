# backend/app/models/user_role.py
from sqlalchemy import UUID, Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserRole(Base):
    __tablename__ = "user_roles"
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.user_id"), primary_key=True)  #
    role_id = Column(Integer, ForeignKey("roles_definition.role_id"), primary_key=True)  #

    profile = relationship("Profile", back_populates="roles")
    role_definition = relationship("RoleDefinition")  # Assumes you have a RoleDefinition model
