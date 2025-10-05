# REPLACE the import block at the top of the file with this:
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.streams import stream_subjects_association


class Subject(Base):
    """
    SQLAlchemy model for the subjects table.
    """

    __tablename__ = "subjects"

    subject_id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.school_id"), nullable=False)
    name = Column(String, nullable=False)
    short_code = Column(String)
    description = Column(Text)
    category = Column(String)
    is_active = Column(Boolean, default=True)

    school = relationship("School")

    # RESOLVED CONFLICT: KEEP BOTH RELATIONSHIPS
    # 1. Relationship for Marks (from financials branch)
    marks_records = relationship("Mark", back_populates="subjects")

    # 2. Relationship for Streams (from main/other branch)
    streams = relationship(
        "Stream", secondary=stream_subjects_association, back_populates="subjects"
    )
    timetables = relationship("Timetable", back_populates="subject")
