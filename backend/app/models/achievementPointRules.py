from sqlalchemy import TIMESTAMP, Boolean, CheckConstraint, Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy import Enum as SQLAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.schemas.enums import AchievementType


class AchievementPointRule(Base):
    __tablename__ = "achievement_point_rules"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_type = Column(SQLAEnum(AchievementType, name="achievement_type", create_type=False), nullable=False, index=True)
    category_name = Column(String(100), nullable=False)
    base_points = Column(Integer, nullable=False, default=10)
    level_multiplier = Column(JSONB, default={"school": 1.0, "district": 1.5, "state": 2.0, "national": 3.0, "international": 5.0})
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint("base_points >= 0", name="chk_base_points_positive"),
        UniqueConstraint("school_id", "achievement_type", "category_name", name="unique_achievement_rule_per_school"),
    )

    school = relationship("School", back_populates="achievement_point_rules", lazy="selectin")
