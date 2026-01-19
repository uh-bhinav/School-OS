"""
Dashboard Aggregation Endpoints - PRODUCTION READY

CRITICAL FIXES:
1. Uses ONLY existing model fields (no Invoice.school_id, etc.)
2. Proper school_id filtering via Student -> Profile join
3. All date fields use Date type (not string comparisons)
4. DB sessions auto-managed by FastAPI Depends
5. Efficient queries with proper joins
6. No Cartesian products or missing group_by
"""
from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.db.session import get_db
from app.models.announcement import Announcement
from app.models.attendance_record import AttendanceRecord
from app.models.class_model import Class
from app.models.invoice import Invoice
from app.models.mark import Mark
from app.models.payment import Payment
from app.models.profile import Profile
from app.models.student import Student
from app.models.teacher import Teacher

router = APIRouter()


def _verify_school_access(current_profile: Profile, school_id: int):
    """Verify user has access to requested school"""
    if current_profile.school_id != school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied to school {school_id}",
        )


@router.get("/schools/{school_id}/dashboard/metrics")
async def get_dashboard_metrics(
    school_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
) -> dict:
    """Get aggregated dashboard metrics - FIXED for real DB schema"""
    _verify_school_access(current_profile, school_id)

    # Total Students (via Profile.school_id)
    students_stmt = select(func.count(Student.student_id)).select_from(Student).join(Profile, Student.user_id == Profile.user_id).where(Profile.school_id == school_id, Student.is_active.is_(True))
    total_students = (await db.execute(students_stmt)).scalar() or 0

    # Total Teachers
    teachers_stmt = select(func.count(Teacher.teacher_id)).where(Teacher.school_id == school_id, Teacher.is_active.is_(True))
    total_teachers = (await db.execute(teachers_stmt)).scalar() or 0

    # Total Classes
    classes_stmt = select(func.count(Class.class_id)).where(Class.school_id == school_id, Class.is_active.is_(True))
    total_classes = (await db.execute(classes_stmt)).scalar() or 0

    # Pending Fees (Invoice has no school_id, join via Student->Profile)
    pending_fees_stmt = (
        select(func.sum(Invoice.amount_due - Invoice.amount_paid))
        .select_from(Invoice)
        .join(Student, Invoice.student_id == Student.student_id)
        .join(Profile, Student.user_id == Profile.user_id)
        .where(
            Profile.school_id == school_id,
            Invoice.is_active.is_(True),
            Invoice.status.in_(["due", "overdue", "partial"]),
        )
    )
    pending_fees_result = (await db.execute(pending_fees_stmt)).scalar()
    pending_fees = float(pending_fees_result or 0)

    # Announcements Count (last 30 days)
    thirty_days_ago = date.today() - timedelta(days=30)
    announcements_stmt = select(func.count(Announcement.id)).where(
        Announcement.school_id == school_id,
        Announcement.is_active.is_(True),
        func.date(Announcement.published_at) >= thirty_days_ago,
    )
    announcements_count = (await db.execute(announcements_stmt)).scalar() or 0

    # Attendance Percentage (filter via Class.school_id, not AttendanceRecord.school_id)
    attendance_present_stmt = (
        select(func.count(AttendanceRecord.id))
        .select_from(AttendanceRecord)
        .join(Class, AttendanceRecord.class_id == Class.class_id)
        .where(
            Class.school_id == school_id,
            AttendanceRecord.date >= thirty_days_ago,
            AttendanceRecord.status.in_(["Present", "present"]),
        )
    )
    attendance_total_stmt = select(func.count(AttendanceRecord.id)).select_from(AttendanceRecord).join(Class, AttendanceRecord.class_id == Class.class_id).where(Class.school_id == school_id, AttendanceRecord.date >= thirty_days_ago)
    present_count = (await db.execute(attendance_present_stmt)).scalar() or 0
    total_count = (await db.execute(attendance_total_stmt)).scalar() or 0
    attendance_percentage = (present_count / total_count * 100) if total_count > 0 else 0.0

    # Student Growth (month-over-month using enrollment_date)
    today = date.today()
    current_month_start = today.replace(day=1)
    last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
    last_month_end = current_month_start - timedelta(days=1)

    current_month_students_stmt = (
        select(func.count(Student.student_id))
        .select_from(Student)
        .join(Profile, Student.user_id == Profile.user_id)
        .where(
            Profile.school_id == school_id,
            Student.enrollment_date >= current_month_start,
            Student.enrollment_date <= today,
        )
    )
    last_month_students_stmt = (
        select(func.count(Student.student_id))
        .select_from(Student)
        .join(Profile, Student.user_id == Profile.user_id)
        .where(
            Profile.school_id == school_id,
            Student.enrollment_date >= last_month_start,
            Student.enrollment_date <= last_month_end,
        )
    )
    current_month_students = (await db.execute(current_month_students_stmt)).scalar() or 0
    last_month_students = (await db.execute(last_month_students_stmt)).scalar() or 0
    student_growth_percentage = ((current_month_students - last_month_students) / last_month_students * 100) if last_month_students > 0 else 0.0

    # Fee Collection Percentage (this month)
    total_due_stmt = (
        select(func.sum(Invoice.amount_due))
        .select_from(Invoice)
        .join(Student, Invoice.student_id == Student.student_id)
        .join(Profile, Student.user_id == Profile.user_id)
        .where(
            Profile.school_id == school_id,
            Invoice.is_active.is_(True),
            Invoice.due_date >= current_month_start,
            Invoice.due_date <= today,
        )
    )
    total_paid_stmt = (
        select(func.sum(Invoice.amount_paid))
        .select_from(Invoice)
        .join(Student, Invoice.student_id == Student.student_id)
        .join(Profile, Student.user_id == Profile.user_id)
        .where(
            Profile.school_id == school_id,
            Invoice.is_active.is_(True),
            Invoice.due_date >= current_month_start,
            Invoice.due_date <= today,
        )
    )
    total_due = (await db.execute(total_due_stmt)).scalar() or 0
    total_paid = (await db.execute(total_paid_stmt)).scalar() or 0
    fee_collection_percentage = (total_paid / total_due * 100) if total_due > 0 else 0.0

    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_classes": total_classes,
        "pending_fees": pending_fees,
        "announcements_count": announcements_count,
        "attendance_percentage": round(attendance_percentage, 2),
        "student_growth_percentage": round(student_growth_percentage, 2),
        "fee_collection_percentage": round(fee_collection_percentage, 2),
        "admission_growth_percentage": round(student_growth_percentage, 2),
        "announcement_growth_percentage": 0.0,
    }


@router.get("/schools/{school_id}/dashboard/revenue")
async def get_revenue_data(
    school_id: int,
    months: int = Query(8, ge=1, le=12),
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
) -> list[dict]:
    """Get monthly revenue trend - FIXED to use Payment.school_id"""
    _verify_school_access(current_profile, school_id)

    result = []
    today = date.today()

    for i in range(months - 1, -1, -1):
        month_date = today.replace(day=1) - timedelta(days=i * 30)
        month_start = month_date.replace(day=1)
        if month_start.month == 12:
            next_month_start = month_start.replace(year=month_start.year + 1, month=1)
        else:
            next_month_start = month_start.replace(month=month_start.month + 1)
        month_end = next_month_start - timedelta(days=1)

        # Fees (Payment has school_id!)
        fees_stmt = select(func.sum(Payment.amount_paid)).where(
            Payment.school_id == school_id,
            Payment.status.in_(["captured", "authorized"]),
            func.date(Payment.created_at) >= month_start,
            func.date(Payment.created_at) <= month_end,
        )
        fees = (await db.execute(fees_stmt)).scalar() or 0

        # Admissions
        admissions_stmt = (
            select(func.count(Student.student_id))
            .select_from(Student)
            .join(Profile, Student.user_id == Profile.user_id)
            .where(
                Profile.school_id == school_id,
                Student.enrollment_date >= month_start,
                Student.enrollment_date <= month_end,
            )
        )
        admissions = (await db.execute(admissions_stmt)).scalar() or 0

        result.append(
            {
                "month": month_start.strftime("%b %Y"),
                "fees": float(fees),
                "expenses": 0.0,
                "admissions": admissions,
            }
        )

    return result


@router.get("/schools/{school_id}/dashboard/student-distribution")
async def get_student_distribution(
    school_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
) -> list[dict]:
    """Get student distribution by grade - FIXED joins"""
    _verify_school_access(current_profile, school_id)

    total_stmt = select(func.count(Student.student_id)).select_from(Student).join(Profile, Student.user_id == Profile.user_id).where(Profile.school_id == school_id, Student.is_active.is_(True))
    total_students = (await db.execute(total_stmt)).scalar() or 0

    if total_students == 0:
        return []

    distribution_stmt = (
        select(Class.grade_level, func.count(Student.student_id).label("count"))
        .select_from(Student)
        .join(Profile, Student.user_id == Profile.user_id)
        .join(Class, Student.current_class_id == Class.class_id)
        .where(
            Profile.school_id == school_id,
            Student.is_active.is_(True),
            Class.is_active.is_(True),
        )
        .group_by(Class.grade_level)
        .order_by(Class.grade_level)
    )

    result = await db.execute(distribution_stmt)
    rows = result.all()

    return [
        {
            "grade_range": f"Grade {row.grade_level}",
            "count": row.count,
            "percentage": round((row.count / total_students) * 100, 2),
        }
        for row in rows
    ]


@router.get("/schools/{school_id}/dashboard/attendance-by-grade")
async def get_attendance_by_grade(
    school_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
) -> list[dict]:
    """Get attendance by grade - FIXED to use Class.school_id"""
    _verify_school_access(current_profile, school_id)

    if start_date:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
    else:
        start = date.today() - timedelta(days=30)

    if end_date:
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
    else:
        end = date.today()

    classes_stmt = select(Class.class_id, Class.grade_level).where(Class.school_id == school_id, Class.is_active.is_(True))
    classes_result = await db.execute(classes_stmt)
    classes = classes_result.all()

    result = []

    for class_row in classes:
        class_id = class_row.class_id
        grade_level = class_row.grade_level

        total_stmt = select(func.count(AttendanceRecord.id)).where(
            AttendanceRecord.class_id == class_id,
            AttendanceRecord.date >= start,
            AttendanceRecord.date <= end,
        )
        total_records = (await db.execute(total_stmt)).scalar() or 0

        if total_records == 0:
            continue

        present_stmt = select(func.count(AttendanceRecord.id)).where(
            AttendanceRecord.class_id == class_id,
            AttendanceRecord.date >= start,
            AttendanceRecord.date <= end,
            AttendanceRecord.status.in_(["Present", "present"]),
        )
        present_records = (await db.execute(present_stmt)).scalar() or 0

        present_percentage = (present_records / total_records) * 100
        absent_percentage = 100 - present_percentage

        students_stmt = select(func.count(func.distinct(Student.student_id))).where(Student.current_class_id == class_id, Student.is_active.is_(True))
        total_students = (await db.execute(students_stmt)).scalar() or 0

        result.append(
            {
                "grade": f"Grade {grade_level}",
                "present_percentage": round(present_percentage, 2),
                "absent_percentage": round(absent_percentage, 2),
                "total_students": total_students,
            }
        )

    return result


@router.get("/schools/{school_id}/dashboard/module-usage")
async def get_module_usage(
    school_id: int,
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
) -> list[dict]:
    """Get module usage statistics - Approximate (no activity logging)"""
    _verify_school_access(current_profile, school_id)

    cutoff_date = date.today() - timedelta(days=days)

    total_students_stmt = select(func.count(Student.student_id)).select_from(Student).join(Profile, Student.user_id == Profile.user_id).where(Profile.school_id == school_id, Student.is_active.is_(True))
    total_students = (await db.execute(total_students_stmt)).scalar() or 0

    total_teachers_stmt = select(func.count(Teacher.teacher_id)).where(Teacher.school_id == school_id, Teacher.is_active.is_(True))
    total_teachers = (await db.execute(total_teachers_stmt)).scalar() or 0

    total_users = total_students + total_teachers

    if total_users == 0:
        return []

    # Attendance module
    attendance_users_stmt = (
        select(func.count(func.distinct(AttendanceRecord.teacher_id))).select_from(AttendanceRecord).join(Class, AttendanceRecord.class_id == Class.class_id).where(Class.school_id == school_id, AttendanceRecord.date >= cutoff_date)
    )
    attendance_users = (await db.execute(attendance_users_stmt)).scalar() or 0

    # Exams module
    exams_users_stmt = (
        select(func.count(func.distinct(Student.student_id))).select_from(Mark).join(Student, Mark.student_id == Student.student_id).join(Profile, Student.user_id == Profile.user_id).where(Mark.school_id == school_id, Profile.school_id == school_id)
    )
    exams_users = (await db.execute(exams_users_stmt)).scalar() or 0

    return [
        {
            "module_key": "attendance",
            "module_name": "Attendance",
            "usage_percentage": round((attendance_users / total_users) * 100, 2),
            "active_users": attendance_users,
        },
        {
            "module_key": "exams",
            "module_name": "Exams & Marks",
            "usage_percentage": round((exams_users / total_users) * 100, 2),
            "active_users": exams_users,
        },
    ]
