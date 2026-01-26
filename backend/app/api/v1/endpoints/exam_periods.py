# backend/app/api/v1/endpoints/exam_periods.py
"""
API endpoints for period-based exam scheduling
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.exam_period_schema import (
    AutoMapRequest,
    AutoMapResponse,
    CalendarDateInfo,
    ExamCalendarOut,
    ExamPeriodCreate,
    ExamPeriodOut,
    ExamPeriodUpdate,
    HallTicketDetailOut,
    HallTicketOut,
    HolidayCreate,
    HolidayOut,
    SubjectScheduleUpdate,
    ValidateDateRequest,
    ValidateDateResponse,
)
from app.services.exam_period_service import (
    create_exam_period,
    finalize_exam_period,
    get_exam_period_with_schedules,
    get_exam_periods_by_filters,
    update_subject_exam_date,
)
from app.services.hall_ticket_service import (
    generate_hall_tickets_for_period,
    get_hall_ticket_by_student,
    get_hall_ticket_data,
)
from app.services.holiday_service import (
    add_school_holiday,
    get_holidays_in_range,
    get_valid_exam_dates,
    is_valid_exam_date,
    seed_indian_holidays,
)

router = APIRouter()


# ===== Exam Period Endpoints =====

@router.post(
    "/periods",
    response_model=ExamPeriodOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_exam_period(
    period_in: ExamPeriodCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new exam period with auto-mapped subject schedules.
    Principal/Admin only.
    """
    try:
        exam_period = await create_exam_period(
            db=db,
            school_id=period_in.school_id,
            academic_year_id=period_in.academic_year_id,
            class_id=period_in.class_id,
            section=period_in.section,
            exam_period_name=period_in.exam_period_name,
            exam_type_id=period_in.exam_type_id,
            start_date=period_in.start_date,
            end_date=period_in.end_date,
            total_marks=period_in.total_marks,
            state=period_in.state,
            auto_map=period_in.auto_map
        )
        
        # Load with schedules
        exam_period = await get_exam_period_with_schedules(db, exam_period.id)
        return exam_period
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create exam period: {str(e)}"
        )


@router.get(
    "/periods",
    response_model=List[ExamPeriodOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_exam_periods(
    school_id: int,
    academic_year_id: Optional[int] = Query(None),
    class_id: Optional[int] = Query(None),
    section: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all exam periods with optional filters.
    Admin/Principal only.
    """
    periods = await get_exam_periods_by_filters(
        db, school_id, academic_year_id, class_id, section, status
    )
    
    # Load schedules for each period
    result = []
    for period in periods:
        period_with_schedules = await get_exam_period_with_schedules(db, period.id)
        result.append(period_with_schedules)
    
    return result


@router.get(
    "/periods/{period_id}",
    response_model=ExamPeriodOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_exam_period(
    period_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific exam period with all subject schedules.
    """
    exam_period = await get_exam_period_with_schedules(db, period_id)
    
    if not exam_period:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam period {period_id} not found"
        )
    
    return exam_period


@router.post(
    "/periods/{period_id}/finalize",
    response_model=ExamPeriodOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def finalize_period(
    period_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Finalize an exam period (change status to 'scheduled').
    This locks the schedule and enables hall ticket generation.
    """
    try:
        exam_period = await finalize_exam_period(db, period_id)
        return await get_exam_period_with_schedules(db, exam_period.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ===== Subject Schedule Management =====

@router.put(
    "/schedules/{schedule_id}",
    response_model=dict,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_subject_schedule(
    schedule_id: int,
    schedule_update: SubjectScheduleUpdate,
    school_id: Optional[int] = Query(None),
    state: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Manually update a subject's exam date/time.
    Validates the new date before updating.
    """
    try:
        updated_schedule = await update_subject_exam_date(
            db=db,
            subject_schedule_id=schedule_id,
            new_date=schedule_update.exam_date,
            new_start_time=schedule_update.start_time,
            school_id=school_id,
            state=state
        )
        
        return {
            "success": True,
            "message": "Subject schedule updated successfully",
            "schedule_id": updated_schedule.id
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ===== Calendar & Date Validation =====

@router.post(
    "/validate-date",
    response_model=ValidateDateResponse,
)
async def validate_exam_date(
    request: ValidateDateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Validate if a date is suitable for scheduling an exam.
    Checks for Sundays and holidays.
    """
    is_valid, reason = await is_valid_exam_date(
        db,
        request.exam_date,
        request.school_id,
        request.state
    )
    
    return ValidateDateResponse(
        is_valid=is_valid,
        reason=reason,
        date=request.exam_date
    )


@router.get(
    "/valid-dates",
    response_model=List[str],
)
async def get_valid_dates(
    start_date: str,
    end_date: str,
    school_id: Optional[int] = Query(None),
    state: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all valid exam dates within a period.
    Excludes Sundays and holidays.
    """
    from datetime import datetime
    
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    valid_dates = await get_valid_exam_dates(db, start, end, school_id, state)
    
    return [d.strftime("%Y-%m-%d") for d in valid_dates]


# ===== Holiday Management =====

@router.post(
    "/holidays",
    response_model=HolidayOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_holiday(
    holiday_in: HolidayCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Add a school-specific holiday.
    Admin only.
    """
    if holiday_in.holiday_type == "school_specific" and not holiday_in.school_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="school_id is required for school_specific holidays"
        )
    
    holiday = await add_school_holiday(
        db,
        school_id=holiday_in.school_id,
        name=holiday_in.name,
        holiday_date=holiday_in.date,
        description=holiday_in.description
    )
    
    return holiday


@router.get(
    "/holidays",
    response_model=List[HolidayOut],
)
async def get_holidays(
    start_date: str,
    end_date: str,
    school_id: Optional[int] = Query(None),
    state: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all holidays within a date range.
    Includes national, state, and school-specific holidays.
    """
    from datetime import datetime
    
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    holidays = await get_holidays_in_range(db, start, end, school_id, state)
    
    return holidays


@router.post(
    "/holidays/seed",
    response_model=dict,
    dependencies=[Depends(require_role("Admin"))],
)
async def seed_holidays(
    year: int = Query(2026),
    db: AsyncSession = Depends(get_db)
):
    """
    Seed Indian national holidays for a given year.
    Admin only.
    """
    count = await seed_indian_holidays(db, year)
    
    return {
        "success": True,
        "message": f"Added {count} Indian national holidays for year {year}"
    }


# ===== Hall Ticket Management =====

@router.post(
    "/periods/{period_id}/hall-tickets",
    response_model=List[HallTicketOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def generate_hall_tickets(
    period_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate hall tickets for all students in the exam period.
    Admin/Principal only.
    """
    try:
        hall_tickets = await generate_hall_tickets_for_period(db, period_id)
        return hall_tickets
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/hall-tickets/{ticket_id}",
    response_model=HallTicketDetailOut,
)
async def get_hall_ticket(
    ticket_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed hall ticket information for PDF generation.
    """
    ticket_data = await get_hall_ticket_data(db, ticket_id)
    
    if not ticket_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hall ticket {ticket_id} not found"
        )
    
    return ticket_data


@router.get(
    "/students/{student_id}/hall-tickets/{period_id}",
    response_model=HallTicketDetailOut,
)
async def get_student_hall_ticket(
    student_id: int,
    period_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get hall ticket for a specific student and exam period.
    """
    hall_ticket = await get_hall_ticket_by_student(db, student_id, period_id)
    
    if not hall_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hall ticket not found for student {student_id} in period {period_id}"
        )
    
    ticket_data = await get_hall_ticket_data(db, hall_ticket.id)
    return ticket_data
