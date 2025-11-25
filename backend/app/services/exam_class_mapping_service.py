import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from app.models.class_model import Class
from app.models.exam_class_mapping import ExamClassMapping
from app.models.exams import Exam
from app.schemas.exam_class_mapping_schema import (
    ExamClassMappingOut,
)

logger = logging.getLogger(__name__)


class ExamClassMappingService:
    """Service for managing exam-class relationships"""

    @staticmethod
    async def create_mapping(db: AsyncSession, exam_id: int, class_id: int, school_id: int) -> ExamClassMappingOut:
        """Create a mapping between exam and class"""

        # Verify exam exists and belongs to school
        exam = await db.get(Exam, exam_id)
        if not exam or exam.school_id != school_id:
            raise ValueError(f"Exam {exam_id} not found for school {school_id}")

        # Verify class exists and belongs to school
        class_obj = await db.get(Class, class_id)
        if not class_obj or class_obj.school_id != school_id:
            raise ValueError(f"Class {class_id} not found for school {school_id}")

        # Check if mapping already exists
        stmt = select(ExamClassMapping).where(ExamClassMapping.exam_id == exam_id, ExamClassMapping.class_id == class_id)
        existing = await db.execute(stmt)
        if existing.scalars().first():
            raise ValueError(f"Exam {exam_id} is already assigned to Class {class_id}")

        # Create mapping
        mapping = ExamClassMapping(exam_id=exam_id, class_id=class_id, is_active=True)
        db.add(mapping)
        await db.commit()
        await db.refresh(mapping)

        logger.info(f"✅ Created exam-class mapping: exam_id={exam_id}, class_id={class_id}")
        return ExamClassMappingOut.model_validate(mapping)

    @staticmethod
    async def delete_mapping(db: AsyncSession, exam_id: int, class_id: int, school_id: int) -> bool:
        """Delete a mapping between exam and class"""

        # Verify exam/class belong to school
        exam = await db.get(Exam, exam_id)
        if not exam or exam.school_id != school_id:
            raise ValueError(f"Exam {exam_id} not found for school {school_id}")

        class_obj = await db.get(Class, class_id)
        if not class_obj or class_obj.school_id != school_id:
            raise ValueError(f"Class {class_id} not found for school {school_id}")

        # Delete mapping
        stmt = select(ExamClassMapping).where(ExamClassMapping.exam_id == exam_id, ExamClassMapping.class_id == class_id)
        result = await db.execute(stmt)
        mapping = result.scalars().first()

        if not mapping:
            return False

        await db.delete(mapping)
        await db.commit()

        logger.info(f"✅ Deleted exam-class mapping: exam_id={exam_id}, class_id={class_id}")
        return True

    @staticmethod
    async def get_exam_classes(db: AsyncSession, exam_id: int) -> list[dict]:
        """Get all classes assigned to an exam"""
        stmt = select(ExamClassMapping).where(ExamClassMapping.exam_id == exam_id, ExamClassMapping.is_active).options(joinedload(ExamClassMapping.class_model))
        result = await db.execute(stmt)
        mappings = result.unique().scalars().all()

        classes = []
        for mapping in mappings:
            classes.append(
                {
                    "class_id": mapping.class_model.class_id,
                    "class_name": f"{mapping.class_model.grade_level}{mapping.class_model.section}",
                    "grade_level": mapping.class_model.grade_level,
                    "section": mapping.class_model.section,
                }
            )

        return classes

    @staticmethod
    async def get_class_exams(db: AsyncSession, class_id: int) -> list[dict]:
        """Get all exams assigned to a class"""
        stmt = select(ExamClassMapping).where(ExamClassMapping.class_id == class_id, ExamClassMapping.is_active).options(joinedload(ExamClassMapping.exam))
        result = await db.execute(stmt)
        mappings = result.unique().scalars().all()

        exams = []
        for mapping in mappings:
            exams.append(
                {
                    "exam_id": mapping.exam.id,
                    "exam_name": mapping.exam.exam_name,
                    "exam_type_id": mapping.exam.exam_type_id,
                    "start_date": str(mapping.exam.start_date) if mapping.exam.start_date else None,
                    "end_date": str(mapping.exam.end_date) if mapping.exam.end_date else None,
                    "marks": float(mapping.exam.marks) if mapping.exam.marks else None,
                }
            )

        return exams

    @staticmethod
    async def deactivate_exam_for_class(db: AsyncSession, exam_id: int, class_id: int, school_id: int) -> bool:
        """Deactivate (soft delete) exam for a specific class"""

        exam = await db.get(Exam, exam_id)
        if not exam or exam.school_id != school_id:
            raise ValueError(f"Exam {exam_id} not found")

        class_obj = await db.get(Class, class_id)
        if not class_obj or class_obj.school_id != school_id:
            raise ValueError(f"Class {class_id} not found")

        stmt = select(ExamClassMapping).where(ExamClassMapping.exam_id == exam_id, ExamClassMapping.class_id == class_id)
        result = await db.execute(stmt)
        mapping = result.scalars().first()

        if not mapping:
            return False

        mapping.is_active = False
        await db.commit()

        logger.info(f"✅ Deactivated exam {exam_id} for class {class_id}")
        return True
