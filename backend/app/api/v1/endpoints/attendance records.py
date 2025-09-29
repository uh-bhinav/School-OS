# backend/app/api/v1/endpoints/attendance_records.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db
from app.schemas.attendance_record_schema import (
    AttendanceRecordCreate,
    AttendanceRecordOut,
    AttendanceRecordUpdate,
)
from app.services import attendance_record_service

router = APIRouter()


# Admin/Teacher only: Submits a single attendance record
@router.post(
    "/",
    response_model=AttendanceRecordOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_role("teacher"))
    ],  # Example: Only teachers can submit
)
async def create_attendance(
    attendance_in: AttendanceRecordCreate, db: AsyncSession = Depends(get_db)
):
    """
    Submits a single attendance record.
    """
    return await attendance_record_service.create_attendance_record(
        db=db, attendance_in=attendance_in
    )


# Student/Parent only: View a student's attendance history
@router.get(
    "/students/{student_id}",
    response_model=list[AttendanceRecordOut],
    dependencies=[Depends(require_role("parent"))],  # Example: Parents can view
)
async def get_student_attendance_history(
    student_id: int, db: AsyncSession = Depends(get_db)
):
    """
    Fetches the attendance history for a specific student.
    """
    attendance_records = await attendance_record_service.get_attendance_by_student(
        db=db, student_id=student_id
    )
    if not attendance_records:
        raise HTTPException(
            status_code=404, detail="Attendance records not found for this student."
        )
    return attendance_records


# Admin/Teacher only: Update an existing attendance record
@router.put(
    "/{attendance_id}",
    response_model=AttendanceRecordOut,
    dependencies=[Depends(require_role("teacher"))],
)
async def update_attendance(
    attendance_id: int,
    attendance_in: AttendanceRecordUpdate,
    db: AsyncSession = Depends(get_db),
):
    db_obj = await attendance_record_service.get_attendance_record_by_id(
        db, attendance_id
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return await attendance_record_service.update_attendance_record(
        db, db_obj=db_obj, attendance_in=attendance_in
    )


# Admin only: Delete an attendance record
@router.delete(
    "/{attendance_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("admin"))],
)
async def delete_attendance(attendance_id: int, db: AsyncSession = Depends(get_db)):
    db_obj = await attendance_record_service.get_attendance_record_by_id(
        db, attendance_id
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    await attendance_record_service.delete_attendance_record(db, db_obj=db_obj)
    return {"ok": True}
