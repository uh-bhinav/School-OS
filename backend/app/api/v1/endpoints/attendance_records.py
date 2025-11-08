# REPLACE the entire import block at the top of the file with this:
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.profile import Profile  # <-- ADDED
from app.models.student_contact import StudentContact
from app.schemas.attendance_record_schema import (
    AgentAttendanceSheet,  # <-- ADDED
    AgentTakeAttendanceRequest,  # <-- ADDED
    AttendanceRecordBulkCreate,
    AttendanceRecordCreate,
    AttendanceRecordOut,
    AttendanceRecordUpdate,
    ClassAttendanceSummaryOut,
    DailyAbsenteeRecord,  # <-- ADDED
    LowAttendanceStudent,  # <-- ADDED
)
from app.services import attendance_record_service

router = APIRouter()


@router.get(
    "/",
    response_model=list[AttendanceRecordOut],
    dependencies=[Depends(require_role("Teacher", "Admin", "Parent"))],
)
async def list_attendance_records(student_id: int, start_date: date | None = None, end_date: date | None = None, db: AsyncSession = Depends(get_db), current_profile: Profile = Depends(get_current_user_profile)):
    """
    Retrieve attendance records for a student, optionally filtered by a date range.
    """
    records = await attendance_record_service.get_attendance_by_student_in_range(
        db=db,
        student_id=student_id,
        school_id=current_profile.school_id,
        start_date=start_date,
        end_date=end_date,
    )
    return records


# Admin only: Delete an attendance record
@router.delete(
    "/{attendance_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_attendance(attendance_id: int, db: AsyncSession = Depends(get_db)):
    db_obj = await attendance_record_service.get_attendance_record_by_id(db, attendance_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    await attendance_record_service.delete_attendance_record(db, db_obj=db_obj)
    return {"ok": True}


@router.post(
    "/bulk",
    response_model=list[AttendanceRecordOut],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin", "Teacher"))],
)
async def create_bulk_attendance(attendance_in: AttendanceRecordBulkCreate, db: AsyncSession = Depends(get_db), current_profile: Profile = Depends(get_current_user_profile)):
    """
    Create multiple attendance records for a class in a single transaction.
    """
    try:
        records = await attendance_record_service.bulk_create_attendance_records(db=db, attendance_data=attendance_in, school_id=current_profile.school_id)
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=("Bulk attendance submission failed. " "Verify class_id, student_id, period_id," " and duplicates before retrying."),
        ) from exc

    return records


@router.get(
    "/class/{class_id}/range",
    response_model=list[AttendanceRecordOut],
    dependencies=[Depends(require_role("Teacher"))],  # Or "Admin"
)
async def get_class_attendance_in_range(
    class_id: int,
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
):
    """
    Get all attendance records for a class within a specific date range.
    """
    records = await attendance_record_service.get_class_attendance_for_date_range(db=db, class_id=class_id, start_date=start_date, end_date=end_date)
    if not records:
        # REPLACE the HTTPException in the get_class_attendance_in_range function
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No attendance records found for this class the given date range.",
        )
    return records


@router.get(
    "/class/{class_id}/summary",
    response_model=ClassAttendanceSummaryOut,
    dependencies=[Depends(require_role("Teacher"))],  # Or "Admin"
)
async def get_class_weekly_summary(
    class_id: int,
    week_start_date: date,
    db: AsyncSession = Depends(get_db),
):
    """
    Get a pre-calculated weekly attendance summary for a class.
    Reads from a high-performance summary table.
    """
    summary = await attendance_record_service.get_class_attendance_summary(db=db, class_id=class_id, week_start_date=week_start_date)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No attendance summary found for this class and week.",
        )
    return summary


@router.post(
    "/",
    response_model=AttendanceRecordOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Teacher", "Admin"))],
)
async def create_attendance(attendance_in: AttendanceRecordCreate, db: AsyncSession = Depends(get_db), current_profile: Profile = Depends(get_current_user_profile)):  # <-- SECURE
    """(SECURE) Submits a single attendance record."""
    # Security: Check if student/class belongs to school
    # (This should be done in the service or here)
    return await attendance_record_service.create_attendance_record(db=db, attendance_in=attendance_in, school_id=current_profile.school_id)  # <-- SECURE


@router.get(
    "/student/{student_id}",
    response_model=list[AttendanceRecordOut],
    dependencies=[Depends(require_role("Teacher", "Admin", "Parent"))],
)
async def get_student_attendance_history(student_id: int, start_date: date | None = Query(None), end_date: date | None = Query(None), db: AsyncSession = Depends(get_db), current_profile: Profile = Depends(get_current_user_profile)):  # <-- SECURE
    """(SECURE) Fetches attendance history for a specific student."""
    # TODO: Add parent/student self-check logic here
    records = await attendance_record_service.get_attendance_by_student_in_range(
        db=db,
        student_id=student_id,
        school_id=current_profile.school_id,  # <-- SECURE
        start_date=start_date,
        end_date=end_date,
    )
    return records


@router.put(
    "/{attendance_id}",
    response_model=AttendanceRecordOut,
    dependencies=[Depends(require_role("Teacher", "Admin"))],
)
async def update_attendance(attendance_id: int, attendance_in: AttendanceRecordUpdate, db: AsyncSession = Depends(get_db), current_profile: Profile = Depends(get_current_user_profile)):  # <-- SECURE
    """(SECURE) Updates a single attendance record."""
    db_obj = await attendance_record_service.get_attendance_record_by_id(db, attendance_id=attendance_id, school_id=current_profile.school_id)  # <-- SECURE
    if not db_obj:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return await attendance_record_service.update_attendance_record(db, db_obj=db_obj, attendance_in=attendance_in)


# --- ROBUST "Power Tool" Endpoints for Agents ---


@router.get("/agent/sheet/{class_name}", response_model=AgentAttendanceSheet, dependencies=[Depends(require_role("Teacher", "Admin"))], summary="[AGENT] Get 'to-do' attendance sheet")
async def agent_get_attendance_sheet(class_name: str, target_date: date = Query(default_factory=date.today), db: AsyncSession = Depends(get_db), current_profile: Profile = Depends(get_current_user_profile)):
    """
    (ROBUST) Gets the list of students for a class to take attendance.
    Translates class_name to class_id.
    """
    try:
        target_class = await attendance_record_service._get_class_by_name(db, class_name, current_profile.school_id)
        if not target_class:
            raise HTTPException(status_code=404, detail=f"Class '{class_name}' not found.")

        sheet = await attendance_record_service.get_class_attendance_sheet(db=db, class_id=target_class.class_id, target_date=target_date, school_id=current_profile.school_id)
        return sheet
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/agent/take", response_model=list[AttendanceRecordOut], status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role("Teacher", "Admin"))], summary="[AGENT] Submit attendance for a class")
async def agent_take_attendance(attendance_in: AgentTakeAttendanceRequest, db: AsyncSession = Depends(get_db), current_profile: Profile = Depends(get_current_user_profile)):
    """
    (ROBUST) Submits attendance for a full class using lists of IDs.
    """
    if not current_profile.teacher:
        raise HTTPException(status_code=403, detail="User is not linked to a teacher profile.")

    try:
        records = await attendance_record_service.agent_bulk_create_attendance(db=db, data=attendance_in, teacher_id=current_profile.teacher.id, school_id=current_profile.school_id)
        return records
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Bulk attendance submission failed. Check for duplicates.")


@router.get("/agent/absentees/today", response_model=list[DailyAbsenteeRecord], dependencies=[Depends(require_role("Admin"))], summary="[AGENT] Get all absentees for today")
async def agent_get_all_absentees_today(db: AsyncSession = Depends(get_db), current_profile: Profile = Depends(get_current_user_profile)):
    """
    (ROBUST) Admin tool to get a school-wide list of all absentees.
    """
    return await attendance_record_service.get_absentees_for_today(db=db, school_id=current_profile.school_id)


@router.get("/agent/report/low-attendance", response_model=list[LowAttendanceStudent], dependencies=[Depends(require_role("Teacher", "Admin"))], summary="[AGENT] Get low attendance report")
async def agent_get_low_attendance_report(
    threshold_percent: float = Query(75.0, ge=0, le=100), start_date: date = Query(...), end_date: date = Query(default_factory=date.today), db: AsyncSession = Depends(get_db), current_profile: Profile = Depends(get_current_user_profile)
):
    """
    (ROBUST) Admin/Teacher tool to find students below an attendance threshold.
    """
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date.")

    return await attendance_record_service.get_low_attendance_report(db=db, school_id=current_profile.school_id, threshold_percent=threshold_percent, start_date=start_date, end_date=end_date)


@router.get("/agent/my-report", response_model=list[AttendanceRecordOut], dependencies=[Depends(require_role("Student", "Parent"))], summary="[AGENT] Get 'my' attendance report (Student/Parent)")
async def agent_get_my_attendance_report(start_date: date | None = Query(None), end_date: date | None = Query(default_factory=date.today), db: AsyncSession = Depends(get_db), current_profile: Profile = Depends(get_current_user_profile)):
    """
    (ROBUST) Gets the attendance report for the authenticated user.
    - If user is a Student, gets their own report.
    - If user is a Parent, gets the report for their *first linked child*.
    """
    school_id = current_profile.school_id
    student_id_to_fetch = None

    if current_profile.student:
        student_id_to_fetch = current_profile.student.student_id

    elif current_profile.is_parent:
        # Get the parent's first linked student
        stmt = select(StudentContact.student_id).where(StudentContact.profile_user_id == current_profile.user_id, StudentContact.is_active).limit(1)
        result = await db.execute(stmt)
        student_id_to_fetch = result.scalars().first()

    if not student_id_to_fetch:
        raise HTTPException(status_code=404, detail="No linked student found for this profile.")

    # Now call the secure service function
    return await attendance_record_service.get_attendance_by_student_in_range(db=db, student_id=student_id_to_fetch, school_id=school_id, start_date=start_date, end_date=end_date)
