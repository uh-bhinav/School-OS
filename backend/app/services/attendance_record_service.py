# backend/app/services/attendance_record_service.py
from datetime import date
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.attendance_record import AttendanceRecord
from app.schemas.attendance_record_schema import (
    AttendanceRecordCreate,
    AttendanceRecordUpdate,
)


async def create_attendance_record(
    db: AsyncSession, attendance_in: AttendanceRecordCreate
) -> AttendanceRecord:
    db_obj = AttendanceRecord(**attendance_in.model_dump())
    db.add(db_obj)
    await db.commit()
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
