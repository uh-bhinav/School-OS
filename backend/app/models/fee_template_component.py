from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer

from app.db.base_class import Base


class FeeTemplateComponent(Base):
    __tablename__ = "fee_template_components"

    id = Column(Integer, primary_key=True)
    fee_template_id = Column(Integer, ForeignKey("fee_templates.id"), nullable=False)
    fee_component_id = Column(Integer, ForeignKey("fee_components.id"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default="now()")
