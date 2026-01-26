from sqlalchemy import TIMESTAMP, Column, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base_class import Base


class GatewayWebhookEvent(Base):
    __tablename__ = "gateway_webhook_events"

    id = Column(Integer, primary_key=True)
    gateway_name = Column(String(50), nullable=False, default="razorpay")
    event_id = Column(String(255), nullable=False, unique=True, index=True)
    payload = Column(JSONB)
    status = Column(String(50), nullable=False)  # e.g., 'received', 'processed', 'failed'
    processing_error = Column(Text)
    received_at = Column(TIMESTAMP(timezone=True), server_default="now()")
