import logging
from datetime import date
from typing import Any, Optional

from sqlalchemy import and_, case, cast, func, literal, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance_record import AttendanceRecord
from app.models.class_attendance_weekly import ClassAttendanceWeekly
from app.models.class_model import Class
from app.models.profile import Profile
from app.models.student import Student
from app.schemas.attendance_record_schema import (
    AgentTakeAttendanceRequest,
    AttendanceRecordBulkCreate,
    AttendanceRecordCreate,
    AttendanceRecordOut,
    AttendanceRecordUpdate,
    AttendanceStatus,
    DailyAbsenteeRecord,
    LowAttendanceStudent,
)

logger = logging.getLogger(__name__)
# --- Helper Functions ---


async def _get_class_by_name(db: AsyncSession, class_name: str, school_id: int) -> Class | None:
    """
    Finds a class by its name (e.g., 'Grade 1 Section A' or '1A') within the school.
    Handles both formats: "Grade X Section Y" and "XY"
    """
    import re

    class_name_clean = class_name.strip()

    # Pattern 1: "Grade 2 Section A" format
    grade_match = re.search(r"Grade\s+(\d+)\s+Section\s+([A-Z])", class_name_clean, re.IGNORECASE)
    if grade_match:
        grade = int(grade_match.group(1))
        section = grade_match.group(2).upper()
        stmt = select(Class).where(Class.grade_level == grade, Class.section == section, Class.school_id == school_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    # Pattern 2: "1A" format (digit + section)
    digit_match = re.match(r"^(\d+)([A-Z])$", class_name_clean)
    if digit_match:
        grade = int(digit_match.group(1))
        section = digit_match.group(2).upper()
        stmt = select(Class).where(Class.grade_level == grade, Class.section == section, Class.school_id == school_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    return None


# REPLACE the _get_student_by_name function
async def _get_student_by_name(db: AsyncSession, full_name: str, class_id: int, school_id: int) -> Student | None:
    """
    Finds a student by name within a specific class.
    Searches using first_name or last_name for exact/partial match.
    """
    name_clean = full_name.strip().lower()

    # Try to match first_name or last_name
    stmt = (
        select(Student)
        .join(Profile, Student.user_id == Profile.user_id)
        .where(
            Student.current_class_id == class_id,
            Profile.school_id == school_id,
            Student.is_active,
            (func.lower(Profile.first_name).ilike(f"%{name_clean}%") | func.lower(Profile.last_name).ilike(f"%{name_clean}%") | func.lower(func.concat(Profile.first_name, " ", Profile.last_name)).ilike(f"%{name_clean}%")),
        )
    )
    result = await db.execute(stmt)
    return result.scalars().first()


# ADD this new function for the agent to parse the query
async def agent_parse_and_take_attendance(db: AsyncSession, *, class_name: str, target_date: date, absent_student_names: list[str], teacher_id: int, school_id: int) -> dict[str, Any]:
    """
    (AGENT HELPER) Parses natural language attendance query and creates records.

    Example: class_name="Class 1A", absent_student_names=["Aarav"]
    Returns: List of created attendance records + summary
    """
    try:
        # Step 1: Find the class
        logger.info(f"Finding class: {class_name}")
        target_class = await _get_class_by_name(db, class_name, school_id)
        if not target_class:
            return {"success": False, "error": f"Class '{class_name}' not found in school {school_id}"}

        class_id = target_class.class_id
        logger.info(f"Found class_id={class_id} for {class_name}")

        # Step 2: Get all students in the class
        logger.info(f"Fetching students for class_id={class_id}")
        student_name_expr = func.concat(Profile.first_name, " ", Profile.last_name)
        stmt = (
            select(Student.student_id, student_name_expr.label("full_name")).join(Profile, Student.user_id == Profile.user_id).where(Student.current_class_id == class_id, Profile.school_id == school_id, Student.is_active).order_by(Student.student_id)
        )
        result = await db.execute(stmt)
        all_students = {row.student_id: row.full_name for row in result.mappings()}

        if not all_students:
            return {"success": False, "error": f"No active students found in class '{class_name}'"}

        logger.info(f"Found {len(all_students)} students in class")

        # Step 3: Parse absent student names
        absent_student_ids = []
        for absent_name in absent_student_names:
            student = await _get_student_by_name(db, absent_name, class_id, school_id)
            if student:
                absent_student_ids.append(student.student_id)
                logger.info(f"Marked as absent: {absent_name} (student_id={student.student_id})")
            else:
                logger.warning(f"Could not find student: {absent_name}")

        # Step 4: Determine present students (all - absent)
        present_student_ids = [sid for sid in all_students.keys() if sid not in absent_student_ids]

        logger.info(f"Present: {len(present_student_ids)}, Absent: {len(absent_student_ids)}")

        # Step 5: Create attendance records
        records_to_create = []

        for student_id in present_student_ids:
            records_to_create.append(AttendanceRecord(student_id=student_id, class_id=class_id, date=target_date, status="Present", teacher_id=teacher_id, school_id=school_id))

        for student_id in absent_student_ids:
            records_to_create.append(AttendanceRecord(student_id=student_id, class_id=class_id, date=target_date, status="Absent", teacher_id=teacher_id, school_id=school_id))

        # Step 6: Bulk insert
        db.add_all(records_to_create)
        try:
            await db.commit()
            for record in records_to_create:
                await db.refresh(record)
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to create attendance records: {str(e)}")
            return {"success": False, "error": f"Failed to create attendance records: {str(e)}"}

        return {
            "success": True,
            "class_name": class_name,
            "class_id": class_id,
            "date": target_date,
            "total_students": len(all_students),
            "present_count": len(present_student_ids),
            "absent_count": len(absent_student_ids),
            "absent_students": [all_students[sid] for sid in absent_student_ids],
            "records_created": len(records_to_create),
        }

    except Exception as e:
        logger.exception(f"Error in agent_parse_and_take_attendance: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


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


# Find the get_class_attendance_sheet function and replace it:


async def get_class_attendance_sheet(db: AsyncSession, *, class_id: int, target_date: date, school_id: int) -> dict[str, Any]:
    """
    Gets attendance sheet for a class on a specific date.
    Used by agent to display current attendance status.
    """
    try:
        # Step 1: Get the class
        stmt = select(Class).where(Class.class_id == class_id, Class.school_id == school_id)
        result = await db.execute(stmt)
        target_class = result.scalars().first()

        if not target_class:
            raise ValueError(f"Class {class_id} not found")

        # ✅ FIX: Build class_name from grade_level + section
        class_name = f"Grade {target_class.grade_level} Section {target_class.section}"

        # Step 2: Get all students in the class with their attendance for the day
        stmt = (
            select(Student.student_id, func.concat(Profile.first_name, " ", Profile.last_name).label("full_name"), AttendanceRecord.status, AttendanceRecord.id.label("attendance_id"))
            .join(Profile, Student.user_id == Profile.user_id)
            .outerjoin(AttendanceRecord, and_(AttendanceRecord.student_id == Student.student_id, AttendanceRecord.class_id == class_id, AttendanceRecord.date == target_date))
            .where(Student.current_class_id == class_id, Profile.school_id == school_id, Student.is_active)
            .order_by(Student.student_id)
        )

        result = await db.execute(stmt)
        students_data = []
        for row in result.mappings():
            students_data.append({"student_id": row.student_id, "full_name": row.full_name, "status": row.status or "Not Marked", "attendance_id": row.attendance_id})  # If no attendance record, mark as "Not Marked"

        return {"class_id": class_id, "class_name": class_name, "date": target_date, "total_students": len(students_data), "students": students_data}  # ✅ Now built correctly

    except Exception as e:
        logger.exception(f"Error getting attendance sheet: {e}")
        raise


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
        records_to_create.append(
            AttendanceRecord(  # ✅ Create AttendanceRecord directly, not AttendanceRecordCreate
                student_id=student_id, class_id=target_class.class_id, status=AttendanceStatus.present, teacher_id=teacher_id, date=data.date, school_id=school_id  # ✅ school_id is set
            )
        )

    # Process Absent list
    for student_id in data.absent_student_ids:
        records_to_create.append(AttendanceRecord(student_id=student_id, class_id=target_class.class_id, status=AttendanceStatus.absent, teacher_id=teacher_id, date=data.date, school_id=school_id))  # ✅ school_id is set

    # Process Late list
    for student_id in data.late_student_ids:
        records_to_create.append(AttendanceRecord(student_id=student_id, class_id=target_class.class_id, status=AttendanceStatus.late, teacher_id=teacher_id, date=data.date, school_id=school_id))  # ✅ school_id is set

    # ✅ No need to convert - records_to_create already has AttendanceRecord objects
    db.add_all(records_to_create)

    try:
        await db.commit()
    except SQLAlchemyError:
        await db.rollback()
        raise

    for record in records_to_create:
        await db.refresh(record)

    return [AttendanceRecordOut.model_validate(rec) for rec in records_to_create]


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
