from sqlalchemy import TIMESTAMP, Column, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base_class import Base


class Log(Base):
    __tablename__ = "logs"

    log_id = Column(Integer, primary_key=True)
    timestamp = Column(TIMESTAMP(timezone=True), server_default="now()")
    log_level = Column(String)
    message = Column(Text)
    details = Column(JSONB)
