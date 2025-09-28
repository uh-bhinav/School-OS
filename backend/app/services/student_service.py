# backend/app/services/student_service.py
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from supabase import Client

from app.models.student import Student
from app.models.user_role import UserRole
from app.schemas.student_schema import StudentCreate, StudentUpdate


async def create_student(
    db: AsyncSession, supabase: Client, *, student_in: StudentCreate
) -> Optional[Student]:
    """
    Enrolls a new student. This is a multi-step process:
    1. Create the user in Supabase Auth.
    2. The DB trigger auto-creates the corresponding profile.
    3. Create the student record in the public.students table.
    4. Assign the 'Student' role in the public.user_roles table.
    """
    # 1. Create user in Supabase Auth
    try:
        auth_user_res = await supabase.auth.admin.create_user(
            {
                "email": student_in.email,
                "password": student_in.password,
                "email_confirm": True,
                "user_metadata": {
                    "school_id": student_in.school_id,
                    "first_name": student_in.first_name,
                    "last_name": student_in.last_name,
                    "phone_number": student_in.phone_number,
                    "gender": student_in.gender,
                    "date_of_birth": (
                        student_in.date_of_birth.isoformat()
                        if student_in.date_of_birth
                        else None
                    ),
                },
            }
        )
        new_user = auth_user_res.user
        if not new_user:
            return None
    except Exception:
        # User might already exist in Auth, which is an error for a new enrollment
        return None

    # 2. Trigger creates the profile. We can now create the student record.
    db_student = Student(
        user_id=new_user.id,
        current_class_id=student_in.current_class_id,
        roll_number=student_in.roll_number,
        enrollment_date=student_in.enrollment_date,
    )
    db.add(db_student)

    # 3. Assign the 'Student' role (assuming role_id 3 is 'Student')
    db_user_role = UserRole(user_id=new_user.id, role_id=3)
    db.add(db_user_role)

    await db.commit()
    await db.refresh(db_student)
    return db_student


async def get_student(db: AsyncSession, student_id: int) -> Optional[Student]:
    stmt = (
        select(Student)
        .where(Student.student_id == student_id)
        .options(selectinload(Student.profile))
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_students_for_class(db: AsyncSession, class_id: int) -> list[Student]:
    stmt = (
        select(Student)
        .where(Student.current_class_id == class_id)
        .options(selectinload(Student.profile))
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_student(
    db: AsyncSession, *, db_obj: Student, student_in: StudentUpdate
) -> Student:
    update_data = student_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
