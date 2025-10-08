from typing import Optional

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

# Keep any other imports you have, like Mark, Exam, etc.
from app.models.attendance_record import AttendanceRecord
from app.models.exams import Exam
from app.models.mark import Mark

# Import all necessary models and schemas
from app.models.profile import Profile
from app.models.student import Student
from app.models.subject import Subject
from app.models.user_roles import UserRole
from app.schemas.student_schema import (
    MarkForSummaryOut,
    StudentAcademicSummaryOut,
    StudentBulkPromoteIn,
    StudentCreate,
    StudentUpdate,
)
from supabase import Client


async def create_student(db: AsyncSession, supabase: Client, *, student_in: StudentCreate) -> Optional[Student]:
    """
    Creates a student record in the local DB. Assumes the user was just created in Supabase.
    This function is now robust and will create a profile if one doesn't exist.
    """
    try:
        # Find the user created by the endpoint
        list_users_response = await supabase.auth.admin.list_users(filters={"email": student_in.email})
        if not list_users_response.users:
            return None
        new_user = list_users_response.users[0]
    except Exception:
        return None

    # --- THE FINAL FIX: Manually create a profile if the trigger didn't ---
    # Check if a profile for this user already exists.
    existing_profile = await db.get(Profile, new_user.id)
    if not existing_profile:
        # If no profile is found, create one. This makes the function
        # independent of the database trigger, fixing our test.
        profile = Profile(
            user_id=new_user.id,
            school_id=student_in.school_id,
            first_name=student_in.first_name,
            last_name=student_in.last_name,
            phone_number=student_in.phone_number,
            gender=student_in.gender,
            date_of_birth=student_in.date_of_birth,
        )
        db.add(profile)

    # Proceed with creating the student in our local database
    db_student = Student(
        user_id=new_user.id,
        current_class_id=student_in.current_class_id,
        roll_number=student_in.roll_number,
        enrollment_date=student_in.enrollment_date,
    )
    db.add(db_student)

    db_user_role = UserRole(user_id=new_user.id, role_id=3)  # Assuming role_id 3 is 'Student'
    db.add(db_user_role)

    await db.commit()
    await db.refresh(db_student)
    return db_student


async def get_student_by_id(db: AsyncSession, student_id: int) -> Optional[Student]:
    stmt = select(Student).where(Student.student_id == student_id, Student.is_active).options(selectinload(Student.profile))
    result = await db.execute(stmt)
    return result.scalars().first()


# ... (The rest of your service file remains unchanged) ...
async def get_all_students_for_class(db: AsyncSession, class_id: int) -> list[Student]:
    stmt = select(Student).where(Student.current_class_id == class_id, Student.is_active).options(selectinload(Student.profile))
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_student(db: AsyncSession, *, db_obj: Student, student_in: StudentUpdate) -> Student:
    update_data = student_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def soft_delete_student(db: AsyncSession, student_id: int) -> Optional[Student]:
    student_to_delete = await get_student_by_id(db, student_id)
    if not student_to_delete:
        return None
    user_id_to_deactivate = student_to_delete.user_id
    stmt_student = update(Student).where(Student.student_id == student_id).values(is_active=False)
    await db.execute(stmt_student)
    stmt_profile = update(Profile).where(Profile.user_id == user_id_to_deactivate).values(is_active=False)
    await db.execute(stmt_profile)
    await db.commit()
    return student_to_delete


async def search_students(
    db: AsyncSession,
    *,
    school_id: int,
    name: Optional[str] = None,
    class_id: Optional[int] = None,
    roll_number: Optional[str] = None,
    limit: Optional[int] = None,
) -> list[Student]:
    stmt = select(Student).join(Student.profile).where(Profile.school_id == school_id, Student.is_active).options(selectinload(Student.profile))
    if name:
        search_name = f"%{name}%"
        stmt = stmt.where(Profile.first_name.ilike(search_name) | Profile.last_name.ilike(search_name))
    if class_id:
        stmt = stmt.where(Student.current_class_id == class_id)
    if roll_number:
        stmt = stmt.where(Student.roll_number == roll_number)
    if limit:
        stmt = stmt.limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def bulk_promote_students(db: AsyncSession, *, promotion_data: StudentBulkPromoteIn) -> dict:
    stmt = update(Student).where(Student.student_id.in_(promotion_data.student_ids)).values(current_class_id=promotion_data.target_class_id)
    result = await db.execute(stmt)
    await db.commit()
    return {"status": "success", "promoted_count": result.rowcount}


async def get_student_academic_summary(db: AsyncSession, *, student_id: int, academic_year_id: Optional[int] = None) -> Optional[StudentAcademicSummaryOut]:
    student = await get_student_by_id(db, student_id=student_id)
    if not student or not student.profile:
        return None
    attendance_stmt = select(
        func.count().filter(AttendanceRecord.status == "Present"),
        func.count(),
    ).where(AttendanceRecord.student_id == student_id)
    attendance_result = (await db.execute(attendance_stmt)).first()
    present_count, total_count = attendance_result or (0, 0)
    attendance_percentage = (present_count / total_count) * 100 if total_count > 0 else None
    marks_stmt = select(Mark, Subject.name, Exam.exam_name, Exam.marks).join(Subject, Mark.subject_id == Subject.subject_id).join(Exam, Mark.exam_id == Exam.id).where(Mark.student_id == student_id).order_by(Exam.start_date.desc()).limit(10)
    marks_results = (await db.execute(marks_stmt)).all()
    recent_marks = []
    total_score = 0
    total_max_marks = 0
    for mark, subject_name, exam_name, max_marks in marks_results:
        recent_marks.append(
            MarkForSummaryOut(
                subject_name=subject_name,
                exam_name=exam_name,
                marks_obtained=mark.marks_obtained,
            )
        )
        total_score += mark.marks_obtained
        total_max_marks += max_marks
    average_percentage = (total_score / total_max_marks) * 100 if total_max_marks > 0 else None
    summary = StudentAcademicSummaryOut(
        student_id=student_id,
        full_name=f"{student.profile.first_name} {student.profile.last_name}",
        overall_attendance_percentage=attendance_percentage,
        average_score_percentage=average_percentage,
        recent_marks=recent_marks,
    )
    return summary
