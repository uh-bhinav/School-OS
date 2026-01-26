from sqlalchemy import TIMESTAMP, Column, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.db.base_class import Base


class Audit(Base):
    __tablename__ = "audits"

    audit_id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True))
    action_type = Column(String, nullable=False)
    table_name = Column(String, nullable=False)
    record_id = Column(String, nullable=False)
    old_data = Column(JSONB)
    new_data = Column(JSONB)
    action_timestamp = Column(TIMESTAMP(timezone=True), server_default="now()")
    ip_address = Column(String)
