# REPLACE the entire import block at the top of the file with this:
from datetime import date
from typing import Optional

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.attendance_record import AttendanceRecord
from app.models.class_attendance_weekly import ClassAttendanceWeekly
from app.schemas.attendance_record_schema import (
    AttendanceRecordBulkCreate,
    AttendanceRecordCreate,
    AttendanceRecordUpdate,
)


async def create_attendance_record(
    db: AsyncSession, attendance_in: AttendanceRecordCreate
) -> AttendanceRecord:
    db_obj = AttendanceRecord(**attendance_in.model_dump())
    db.add(db_obj)
    try:
        await db.commit()
    except SQLAlchemyError:
        await db.rollback()
        raise

    await db.refresh(db_obj)
    return db_obj


async def get_attendance_record_by_id(
    db: AsyncSession, attendance_id: int
) -> Optional[AttendanceRecord]:
    stmt = select(AttendanceRecord).where(AttendanceRecord.id == attendance_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_attendance_by_student(
    db: AsyncSession, student_id: int
) -> list[AttendanceRecord]:
    stmt = (
        select(AttendanceRecord)
        .where(AttendanceRecord.student_id == student_id)
        .order_by(AttendanceRecord.date.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_attendance_by_student_in_range(
    db: AsyncSession,
    *,
    student_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[AttendanceRecord]:
    stmt = select(AttendanceRecord).where(AttendanceRecord.student_id == student_id)

    if start_date:
        stmt = stmt.where(AttendanceRecord.date >= start_date)

    if end_date:
        stmt = stmt.where(AttendanceRecord.date <= end_date)

    stmt = stmt.order_by(AttendanceRecord.date)

    result = await db.execute(stmt)
    return result.scalars().all()


async def get_attendance_by_class(
    db: AsyncSession, class_id: int, target_date: date
) -> list[AttendanceRecord]:
    stmt = (
        select(AttendanceRecord)
        .where(
            AttendanceRecord.class_id == class_id, AttendanceRecord.date == target_date
        )
        .order_by(AttendanceRecord.student_id)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_attendance_record(
    db: AsyncSession, db_obj: AttendanceRecord, attendance_in: AttendanceRecordUpdate
) -> AttendanceRecord:
    update_data = attendance_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_attendance_record(db: AsyncSession, db_obj: AttendanceRecord) -> None:
    await db.delete(db_obj)
    await db.commit()


async def bulk_create_attendance_records(
    db: AsyncSession, *, attendance_data: AttendanceRecordBulkCreate
) -> list[AttendanceRecord]:
    """
    Creates multiple attendance records in a single transaction.
    Use this for a teacher submitting attendance for an entire class period.
    """
    db_records = [AttendanceRecord(**record.model_dump()) for record in attendance_data]
    db.add_all(db_records)

    try:
        await db.commit()
    except SQLAlchemyError:
        await db.rollback()
        raise

    for record in db_records:
        await db.refresh(record)

    return db_records


async def get_class_attendance_for_date_range(
    db: AsyncSession, *, class_id: int, start_date: date, end_date: date
) -> list[AttendanceRecord]:
    """
    Retrieves all raw attendance records for a specific class within a given date range.
    """
    stmt = (
        select(AttendanceRecord)
        .where(
            AttendanceRecord.class_id == class_id,
            AttendanceRecord.date >= start_date,
            AttendanceRecord.date <= end_date,
        )
        .order_by(AttendanceRecord.date, AttendanceRecord.period_id)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_class_attendance_summary(
    db: AsyncSession, *, class_id: int, week_start_date: date
) -> Optional[ClassAttendanceWeekly]:
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
