# backend/app/services/class_service.py
from typing import Optional

from sqlalchemy import delete, insert, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import raiseload, selectinload

from app.models.class_model import Class, class_subjects_association
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.schemas.class_schema import ClassCreate, ClassOut, ClassUpdate
from app.schemas.subject_schema import SubjectOut


async def create_class(db: AsyncSession, *, class_in: ClassCreate) -> Class:
    # This part creates the object as before
    db_obj = Class(
        school_id=class_in.school_id,
        grade_level=class_in.grade_level,
        section=class_in.section,
        academic_year_id=class_in.academic_year_id,
        class_teacher_id=class_in.class_teacher_id,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)

    # CRITICAL FIX: Re-fetch the object using get_class, which correctly
    # loads the 'subjects' relationship, ensuring it matches the ClassOut schema.
    return await get_class(db=db, class_id=db_obj.class_id, school_id=db_obj.school_id)


async def get_class(db: AsyncSession, *, class_id: int, school_id: int) -> Class | None:
    """
    DIAGNOSTIC VERSION: This function will now raise a specific error
    that tells us exactly which relationship is being lazy-loaded.
    """
    stmt = (
        select(Class)
        .where(Class.class_id == class_id, Class.school_id == school_id)
        .options(
            # Eagerly load the relationships we know we need
            selectinload(Class.class_teacher).selectinload(Teacher.profile),
            selectinload(Class.academic_year),
            # THE CRITICAL DIAGNOSTIC STEP:
            # For the subjects relationship, we will...
            selectinload(Class.subjects).options(
                # 1. Still eagerly load the 'streams' we know the schema wants.
                selectinload(Subject.streams),
                # 2. For EVERY OTHER relationship on the Subject model,
                #    if any code tries to access it, raise an immediate error.
                raiseload("*"),
            ),
        )
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_classes_for_school(db: AsyncSession, school_id: int) -> list[Class]:
    # ... (this function is enhanced to load related data)
    stmt = (
        select(Class)
        .where(Class.school_id == school_id)
        .options(
            selectinload(Class.class_teacher).selectinload(Teacher.profile),
            selectinload(Class.subjects).options(
                selectinload(Subject.streams),
                raiseload("*"),
            ),
            selectinload(Class.academic_year),
        )
        .order_by(Class.grade_level, Class.section)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_class(db: AsyncSession, *, db_obj: Class, class_in: ClassUpdate) -> Class:
    update_data = class_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    # Capture identifiers before the commit expires the instance.
    the_class_id = db_obj.class_id
    the_school_id = db_obj.school_id

    db.add(db_obj)
    await db.commit()

    # Re-fetch with the same loader options we use elsewhere so no lazy-loads occur.
    return await get_class(db=db, class_id=the_class_id, school_id=the_school_id)


async def assign_subjects_to_class(db: AsyncSession, *, db_class: Class, subject_ids: list[int]) -> ClassOut | None:
    """
    Assigns a list of subjects to a class, replacing any existing assignments.
    """
    the_class_id = db_class.class_id
    the_school_id = db_class.school_id

    if subject_ids:
        result = await db.execute(select(Subject.subject_id).where(Subject.subject_id.in_(subject_ids)))
        existing_ids = {row[0] for row in result.all()}
        missing = set(subject_ids) - existing_ids
        if missing:
            raise ValueError(f"Subject IDs not found: {sorted(missing)}")
    else:
        existing_ids = set()

    await db.execute(delete(class_subjects_association).where(class_subjects_association.c.class_id == the_class_id))

    if existing_ids:
        await db.execute(
            insert(class_subjects_association),
            [{"class_id": the_class_id, "subject_id": sid} for sid in existing_ids],
        )

    await db.commit()

    ids_stmt = select(class_subjects_association.c.subject_id).where(class_subjects_association.c.class_id == the_class_id)
    ids_result = await db.execute(ids_stmt)
    actual_ids = ids_result.scalars().all()

    # Remove the stale instance from the identity map so a fresh load occurs.
    if db_class in db:
        db.expunge(db_class)

    fresh = await get_class(db=db, class_id=the_class_id, school_id=the_school_id)
    if fresh is None:
        return None

    subjects_out: list[SubjectOut] | None = None
    if actual_ids:
        subject_stmt = select(Subject).where(Subject.subject_id.in_(actual_ids)).options(selectinload(Subject.streams), raiseload("*"))
        subject_result = await db.execute(subject_stmt)
        subjects_by_id = {sub.subject_id: sub for sub in subject_result.scalars().all()}
        ordered_subjects = [subjects_by_id[sid] for sid in actual_ids if sid in subjects_by_id]
        subjects_out = [SubjectOut.model_validate(subject, from_attributes=True) for subject in ordered_subjects]

    return ClassOut(
        class_id=fresh.class_id,
        school_id=fresh.school_id,
        grade_level=fresh.grade_level,
        section=fresh.section,
        academic_year_id=fresh.academic_year_id,
        class_teacher_id=fresh.class_teacher_id,
        is_active=fresh.is_active,
        subjects=subjects_out,
    )


async def soft_delete_class(db: AsyncSession, class_id: int) -> Optional[Class]:
    """
    Soft-deletes a class by setting its is_active flag to False.
    """
    stmt = update(Class).where(Class.class_id == class_id, Class.is_active).values(is_active=False).returning(Class)
    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one_or_none()


async def search_classes(db: AsyncSession, *, school_id: int, filters: dict) -> list[Class]:
    """
    Searches for classes based on a dynamic set of filters,
    preloading related data for a rich response.
    """
    # Start with the base query, scoped to the school
    stmt = (
        select(Class)
        .where(Class.school_id == school_id, Class.is_active)
        .options(
            selectinload(Class.class_teacher).selectinload(Teacher.profile),
            selectinload(Class.subjects).options(
                selectinload(Subject.streams),
                raiseload("*"),
            ),
            selectinload(Class.academic_year),
        )
    )

    # Dynamically apply filters from the dictionary
    if filters.get("grade_level"):
        stmt = stmt.where(Class.grade_level == filters["grade_level"])

    if filters.get("academic_year_id"):
        stmt = stmt.where(Class.academic_year_id == filters["academic_year_id"])

    if filters.get("teacher_id"):
        stmt = stmt.where(Class.class_teacher_id == filters["teacher_id"])

    stmt = stmt.order_by(Class.grade_level, Class.section)

    result = await db.execute(stmt)
    return list(result.scalars().all())
