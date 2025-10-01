# backend/app/models/stream.py

from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
)
from sqlalchemy.orm import relationship

from app.db.base import Base

# This is a SQLAlchemy association table to manage the many-to-many
# relationship between streams and subjects. It does not get its own model class.
stream_subjects_association = Table(
    "stream_subjects",
    Base.metadata,
    Column("stream_id", Integer, ForeignKey("streams.id"), primary_key=True),
    Column("subject_id", Integer, ForeignKey("subjects.subject_id"), primary_key=True),
)


class Stream(Base):
    """
    SQLAlchemy model for the streams table.
    Represents an academic stream like 'Science' or 'Commerce'.
    """

    __tablename__ = "streams"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)

    # --- Relationships ---

    # Many-to-one relationship with School
    school = relationship("School")

    # Many-to-many relationship with Subject
    # The ORM will use the 'stream_subjects_association' table to manage this link.
    subjects = relationship(
        "Subject",
        secondary=stream_subjects_association,
        # This assumes you will add a 'streams' relationship to the Subject model
        back_populates="streams",
    )
