# backend/app/services/exam_type_service.py
import inspect
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

# No longer need 'from typing import List'
from app.models.exam_type import ExamType
from app.schemas.exam_type_schema import ExamTypeCreate


async def _maybe_await(result):
    if inspect.isawaitable(result):
        return await result
    return result


async def create_exam_type(
    db: AsyncSession, *, exam_type_in: ExamTypeCreate
) -> ExamType:
    db_obj = ExamType(**exam_type_in.model_dump())
    await _maybe_await(db.add(db_obj))

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    await db.refresh(db_obj)
    return db_obj


async def get_all_exam_types_for_school(
    db: AsyncSession, school_id: int
) -> list[ExamType]:  # Changed from List to list
    stmt = select(ExamType).where(ExamType.school_id == school_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_exam_type_id_by_name(
    db: AsyncSession, school_id: int, type_name: str
) -> Optional[int]:
    """
    Agentic Function: Retrieves the ID for a given exam type name within a school.
    """
    stmt = select(ExamType.exam_type_id).where(
        ExamType.school_id == school_id, ExamType.type_name == type_name
    )
    result = await db.execute(stmt)
    # Returns the integer ID or None
    return result.scalar_one_or_none()


async def check_type_name_exists(
    db: AsyncSession, school_id: int, type_name: str
) -> bool:
    """
    Agentic Function: Checks if an exam type name already exists for the school.
    """
    stmt = select(
        select(ExamType)
        .where(ExamType.school_id == school_id, ExamType.type_name == type_name)
        .exists()
    )
    result = await db.execute(stmt)
    return result.scalar_one()


async def update_type_name(
    db: AsyncSession, exam_type_id: int, new_name: str
) -> Optional[ExamType]:
    """
    Agentic Function: Updates the name of an existing exam type.
    """
    db_obj = await db.get(ExamType, exam_type_id)
    if not db_obj:
        return None

    db_obj.type_name = new_name
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
