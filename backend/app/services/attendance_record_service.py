from datetime import date
from typing import Optional

from sqlalchemy import case, cast, func, literal, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance_record import AttendanceRecord
from app.models.class_attendance_weekly import ClassAttendanceWeekly
from app.models.class_model import Class
from app.models.profile import Profile
from app.models.student import Student
from app.schemas.attendance_record_schema import (
    AgentAttendanceSheet,
    AgentTakeAttendanceRequest,
    AttendanceRecordBulkCreate,
    AttendanceRecordCreate,
    AttendanceRecordOut,
    AttendanceRecordUpdate,
    AttendanceSheetStudent,
    AttendanceStatus,
    DailyAbsenteeRecord,
    LowAttendanceStudent,
)

# --- Helper Functions ---


async def _get_student_by_name(db: AsyncSession, full_name: str, school_id: int) -> Student | None:
    """Finds a student by their full name within the school."""
    stmt = select(Student).join(Profile).where(Profile.full_name.ilike(f"%{full_name}%"), Profile.school_id == school_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def _get_class_by_name(db: AsyncSession, class_name: str, school_id: int) -> Class | None:
    """Finds a class by its name (e.g., '10A') within the school."""
    stmt = select(Class).where(Class.name.ilike(class_name), Class.school_id == school_id)
    result = await db.execute(stmt)
    return result.scalars().first()


# --- Secured CRUD Functions ---


async def create_attendance_record(db: AsyncSession, *, attendance_in: AttendanceRecordCreate, school_id: int) -> AttendanceRecord:
    # SECURE: Add school_id to the record
    db_obj = AttendanceRecord(**attendance_in.model_dump(), school_id=school_id)
    db.add(db_obj)
    try:
        await db.commit()
    except SQLAlchemyError:
        await db.rollback()
        raise
    await db.refresh(db_obj)
    return db_obj


async def get_attendance_record_by_id(db: AsyncSession, *, attendance_id: int, school_id: int) -> Optional[AttendanceRecord]:
    # SECURE: Filter by both id AND school_id
    stmt = select(AttendanceRecord).where(AttendanceRecord.id == attendance_id, AttendanceRecord.school_id == school_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_attendance_by_student_in_range(
    db: AsyncSession,
    *,
    student_id: int,
    school_id: int,  # <-- SECURE: Added school_id
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[AttendanceRecord]:
    # SECURE: Filter by student_id AND school_id
    stmt = select(AttendanceRecord).where(AttendanceRecord.student_id == student_id, AttendanceRecord.school_id == school_id)
    if start_date:
        stmt = stmt.where(AttendanceRecord.date >= start_date)
    if end_date:
        stmt = stmt.where(AttendanceRecord.date <= end_date)
    stmt = stmt.order_by(AttendanceRecord.date)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_attendance_record(db: AsyncSession, *, db_obj: AttendanceRecord, attendance_in: AttendanceRecordUpdate) -> AttendanceRecord:
    # (Security is handled by the endpoint, which fetches db_obj securely)
    update_data = attendance_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


# --- ROBUST "Power Tool" Functions ---


async def get_class_attendance_sheet(db: AsyncSession, *, class_id: int, target_date: date, school_id: int) -> AgentAttendanceSheet:
    """
    (ROBUST TOOL) Gets the 'to-do' list of students for a class.
    This is called *before* taking attendance.
    """
    target_class = await db.get(Class, class_id)
    if not target_class or target_class.school_id != school_id:
        raise ValueError("Class not found in this school.")

    # Get all students in this class
    student_name_expr = Profile.first_name + literal(" ") + Profile.last_name
    stmt = (
        select(Student.student_id, student_name_expr.label("full_name"), Student.roll_number)
        .join(Profile, Student.user_id == Profile.user_id)
        .where(Student.current_class_id == class_id, Profile.school_id == school_id)
        .order_by(Student.roll_number, "full_name")
    )
    result = await db.execute(stmt)
    students = [AttendanceSheetStudent(student_id=row.student_id, full_name=row.full_name, roll_number=row.roll_number) for row in result.mappings()]

    return AgentAttendanceSheet(class_id=class_id, class_name=target_class.name, date=target_date, students=students)


async def agent_bulk_create_attendance(db: AsyncSession, *, data: AgentTakeAttendanceRequest, teacher_id: int, school_id: int) -> list[AttendanceRecordOut]:
    """
    (ROBUST TOOL) Securely creates bulk attendance from an agent request.
    """
    target_class = await _get_class_by_name(db, data.class_name, school_id)
    if not target_class:
        raise ValueError("Class not found.")

    records_to_create = []

    # Process Present list
    for student_id in data.present_student_ids:
        records_to_create.append(AttendanceRecordCreate(student_id=student_id, class_id=target_class.class_id, status=AttendanceStatus.present, teacher_id=teacher_id, date=data.date, school_id=school_id))

    # Process Absent list
    for student_id in data.absent_student_ids:
        records_to_create.append(AttendanceRecordCreate(student_id=student_id, class_id=target_class.class_id, status=AttendanceStatus.absent, teacher_id=teacher_id, date=data.date, school_id=school_id))

    # Process Late list
    for student_id in data.late_student_ids:
        records_to_create.append(AttendanceRecordCreate(student_id=student_id, class_id=target_class.class_id, status=AttendanceStatus.late, teacher_id=teacher_id, date=data.date, school_id=school_id))

    # Use your existing bulk create logic
    db_records = [AttendanceRecord(**record.model_dump()) for record in records_to_create]
    db.add_all(db_records)

    try:
        await db.commit()
    except SQLAlchemyError:
        await db.rollback()
        raise

    for record in db_records:
        await db.refresh(record)

    return [AttendanceRecordOut.model_validate(rec) for rec in db_records]


async def get_absentees_for_today(db: AsyncSession, *, school_id: int) -> list[DailyAbsenteeRecord]:
    """
    (ROBUST TOOL) Gets all students marked Absent or Late today for Admins.
    """
    today = date.today()
    student_name_expr = Profile.first_name + literal(" ") + Profile.last_name
    class_name_expr = Class.name

    stmt = (
        select(Student.student_id, student_name_expr.label("full_name"), class_name_expr.label("class_name"), AttendanceRecord.status, AttendanceRecord.notes)
        .join(Student, AttendanceRecord.student_id == Student.student_id)
        .join(Profile, Student.user_id == Profile.user_id)
        .join(Class, AttendanceRecord.class_id == Class.class_id)
        .where(AttendanceRecord.school_id == school_id, AttendanceRecord.date == today, AttendanceRecord.status.in_([AttendanceStatus.absent, AttendanceStatus.late]))
        .distinct(Student.student_id)  # Get one record per student
        .order_by(Student.student_id, AttendanceRecord.created_at.desc())
    )

    result = await db.execute(stmt)
    return [DailyAbsenteeRecord(**row) for row in result.mappings()]


async def get_low_attendance_report(db: AsyncSession, *, school_id: int, threshold_percent: float, start_date: date, end_date: date) -> list[LowAttendanceStudent]:
    """
    (ROBUST TOOL) Generates a report of students below an attendance threshold.
    """
    # 1. CTE for all students in the school
    student_name_expr = Profile.first_name + literal(" ") + Profile.last_name
    students_cte = (
        select(Student.student_id, student_name_expr.label("full_name"), Class.name.label("class_name"))
        .join(Profile, Student.user_id == Profile.user_id)
        .join(Class, Student.current_class_id == Class.class_id, isouter=True)
        .where(Profile.school_id == school_id, Student.is_active)
    ).cte("students")

    # 2. CTE for attendance records in range, counting "Present" as 1
    attendance_cte = (
        select(AttendanceRecord.student_id, func.count().label("total_days"), func.sum(case((AttendanceStatus.present, 1), else_=0)).label("present_days"), func.sum(case((AttendanceStatus.absent, 1), else_=0)).label("absent_days"))
        .where(AttendanceRecord.school_id == school_id, AttendanceRecord.date.between(start_date, end_date))
        .group_by(AttendanceRecord.student_id)
    ).cte("attendance_counts")

    # 3. Final query joining them and calculating percentage
    stmt = (
        select(
            students_cte.c.student_id,
            students_cte.c.full_name,
            students_cte.c.class_name,
            attendance_cte.c.total_days,
            attendance_cte.c.absent_days,
            (cast(attendance_cte.c.present_days, float) * 100.0 / attendance_cte.c.total_days).label("attendance_percentage"),
        )
        .join(attendance_cte, students_cte.c.student_id == attendance_cte.c.student_id)
        .where((cast(attendance_cte.c.present_days, float) * 100.0 / attendance_cte.c.total_days) < threshold_percent)
        .order_by("attendance_percentage")
    )

    result = await db.execute(stmt)
    return [LowAttendanceStudent(**row) for row in result.mappings()]


async def get_class_attendance_summary(db: AsyncSession, *, class_id: int, week_start_date: date) -> Optional[ClassAttendanceWeekly]:
    """
    Retrieves a pre-calculated weekly attendance summary for a class.
    This function reads from a high-performance summary table.
    """
    stmt = select(ClassAttendanceWeekly).where(
        ClassAttendanceWeekly.class_id == class_id,
        ClassAttendanceWeekly.week_start_date == week_start_date,
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def bulk_create_attendance_records(db: AsyncSession, *, attendance_data: AttendanceRecordBulkCreate, school_id: int) -> list[AttendanceRecord]:
    """
    (SECURE) Creates multiple attendance records in a single transaction.
    This is for the old test.
    """
    db_records = []
    for record in attendance_data:
        # Securely inject the school_id
        record_dict = record.model_dump()
        record_dict["school_id"] = school_id
        db_records.append(AttendanceRecord(**record_dict))

    db.add_all(db_records)

    try:
        await db.commit()
    except SQLAlchemyError:
        await db.rollback()
        raise

    for record in db_records:
        await db.refresh(record)

    return db_records
