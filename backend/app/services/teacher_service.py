# backend/app/services/teacher_service.py
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

# Combined and organized imports
from app.models.classes import Class
from app.models.profile import Profile
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.timetable import Timetable
from app.schemas.teacher_schema import TeacherQualification, TeacherUpdate

# --- Existing Functions ---


async def get_teacher(db: AsyncSession, teacher_id: int) -> Optional[Teacher]:
    """
    Get a single active teacher by their teacher_id, preloading profile info.
    """
    stmt = select(Teacher).where(Teacher.teacher_id == teacher_id, Teacher.is_active).options(selectinload(Teacher.profile))
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_teachers_for_school(db: AsyncSession, school_id: int) -> list[Teacher]:
    """
    Get all active teachers for a school, preloading their profile info.
    """
    stmt = select(Teacher).join(Teacher.profile).where(Profile.school_id == school_id, Teacher.is_active).options(selectinload(Teacher.profile)).order_by(Profile.first_name)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_teacher(db: AsyncSession, *, db_obj: Teacher, teacher_in: TeacherUpdate) -> Teacher:
    """
    Update a teacher's employment details.
    """
    update_data = teacher_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def deactivate_teacher(db: AsyncSession, *, db_obj: Teacher) -> Teacher:
    """
    Deactivate a teacher's record and their profile (soft delete).
    """
    db_obj.is_active = False
    if db_obj.profile:
        db_obj.profile.is_active = False
        db.add(db_obj.profile)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


# --- Other New Functions ---


async def assign_class_teacher(db: AsyncSession, *, teacher: Teacher, class_obj: Class) -> Class:
    """
    Assigns a teacher as the primary class teacher for a class.

    This directly updates the `class_teacher_id` foreign key on the
    `classes` table.
    """
    class_obj.class_teacher_id = teacher.teacher_id
    db.add(class_obj)
    await db.commit()
    await db.refresh(class_obj)
    return class_obj


async def get_teacher_timetable(db: AsyncSession, *, teacher_id: int, academic_year_id: int) -> list[Timetable]:
    """
    Retrieves the full weekly timetable for a specific teacher for a given
    academic year.

    This is a critical function for teachers and will be used by the
    "Teacher's Aide" AI agent. It preloads related subject, period, and
    class information for efficiency.
    """
    stmt = (
        select(Timetable)
        .where(
            Timetable.teacher_id == teacher_id,
            Timetable.academic_year_id == academic_year_id,
            Timetable.is_active,
        )
        .options(
            selectinload(Timetable.subject),
            selectinload(Timetable.period),
            # CORRECTED: Moved comment to its own line to fix line length error
            # Assuming 'class_info' is the relationship name in your Timetable model
            selectinload(Timetable.class_info),
        )
        .order_by(Timetable.day_of_week, Timetable.period_id)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_proctored_students(db: AsyncSession, *, teacher_id: int) -> list[Student]:
    """
    Gets a list of all active students assigned to a specific proctor teacher.

    This function supports the mentorship aspect of the school's operations.
    """
    stmt = select(Student).where(Student.proctor_teacher_id == teacher_id, Student.is_active).options(selectinload(Student.profile)).order_by(Student.roll_number)
    result = await db.execute(stmt)
    return list(result.scalars().all())


# --- YOUR NEWLY ADDED FUNCTION ---


async def get_teacher_qualifications(db: AsyncSession, *, teacher_id: int) -> Optional[TeacherQualification]:
    """
    Retrieves a teacher's qualifications and years of experience.

    This function reuses the get_teacher function to fetch the teacher
    record and then maps the relevant fields to the TeacherQualification
    Pydantic schema for a structured response.
    """
    # Reuse the existing function to get the full teacher object
    teacher = await get_teacher(db, teacher_id=teacher_id)
    if not teacher:
        return None

    # Use the Pydantic schema to create a structured response object
    # from_attributes=True allows it to read from the SQLAlchemy model
    return TeacherQualification.model_validate(teacher)
