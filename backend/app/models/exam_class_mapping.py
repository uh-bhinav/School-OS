from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class ExamClassMapping(Base):
    """
    Mapping table linking exams to classes.
    One exam can be assigned to multiple classes.
    One class can have multiple exams.
    """

    __tablename__ = "exam_class_mapping"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    class_id = Column(
        Integer,
        ForeignKey("classes.class_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    exam = relationship("Exam", back_populates="class_mappings")
    class_model = relationship(
        "Class",
        back_populates="exam_mappings",
        foreign_keys="[ExamClassMapping.class_id]",
        viewonly=True,
    )  # ✅ String reference
    __table_args__ = (UniqueConstraint("exam_id", "class_id", name="unique_exam_class"),)
