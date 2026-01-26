# backend/app/services/holiday_service.py
"""
Service for managing Indian holidays and valid exam dates
"""
from datetime import date, datetime, timedelta
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.exam_schedule import Holiday


# Indian National Holidays (2026 reference - should be updated yearly)
INDIAN_NATIONAL_HOLIDAYS_2026 = [
    {"name": "Republic Day", "date": "2026-01-26", "type": "national"},
    {"name": "Holi", "date": "2026-03-14", "type": "national"},
    {"name": "Good Friday", "date": "2026-04-03", "type": "national"},
    {"name": "Mahavir Jayanti", "date": "2026-04-06", "type": "national"},
    {"name": "Eid-ul-Fitr", "date": "2026-04-21", "type": "national"},
    {"name": "Buddha Purnima", "date": "2026-05-04", "type": "national"},
    {"name": "Independence Day", "date": "2026-08-15", "type": "national"},
    {"name": "Janmashtami", "date": "2026-08-25", "type": "national"},
    {"name": "Gandhi Jayanti", "date": "2026-10-02", "type": "national"},
    {"name": "Dussehra", "date": "2026-10-13", "type": "national"},
    {"name": "Diwali", "date": "2026-11-01", "type": "national"},
    {"name": "Guru Nanak Jayanti", "date": "2026-11-16", "type": "national"},
    {"name": "Christmas", "date": "2026-12-25", "type": "national"},
]


async def seed_indian_holidays(db: AsyncSession, year: int = 2026) -> int:
    """
    Seeds Indian national holidays for a given year
    Returns the number of holidays added
    """
    holidays_added = 0
    
    for holiday_data in INDIAN_NATIONAL_HOLIDAYS_2026:
        # Check if holiday already exists
        result = await db.execute(
            select(Holiday).where(
                and_(
                    Holiday.date == datetime.strptime(holiday_data["date"], "%Y-%m-%d").date(),
                    Holiday.holiday_type == "national",
                    Holiday.name == holiday_data["name"]
                )
            )
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            holiday = Holiday(
                name=holiday_data["name"],
                date=datetime.strptime(holiday_data["date"], "%Y-%m-%d").date(),
                holiday_type="national",
                is_active=True
            )
            db.add(holiday)
            holidays_added += 1
    
    await db.commit()
    return holidays_added


async def get_holidays_in_range(
    db: AsyncSession,
    start_date: date,
    end_date: date,
    school_id: Optional[int] = None,
    state: Optional[str] = None
) -> List[Holiday]:
    """
    Retrieves all holidays within a date range
    Includes national, state-specific, and school-specific holidays
    """
    query = select(Holiday).where(
        and_(
            Holiday.date >= start_date,
            Holiday.date <= end_date,
            Holiday.is_active == True
        )
    )
    
    # Include national holidays and optionally state/school specific
    filters = [Holiday.holiday_type == "national"]
    
    if state:
        filters.append(
            and_(
                Holiday.holiday_type == "state",
                Holiday.state == state
            )
        )
    
    if school_id:
        filters.append(
            and_(
                Holiday.holiday_type == "school_specific",
                Holiday.school_id == school_id
            )
        )
    
    # Combine filters with OR
    from sqlalchemy import or_
    query = query.where(or_(*filters))
    
    result = await db.execute(query)
    return result.scalars().all()


async def get_valid_exam_dates(
    db: AsyncSession,
    start_date: date,
    end_date: date,
    school_id: Optional[int] = None,
    state: Optional[str] = None,
    exclude_sundays: bool = True
) -> List[date]:
    """
    Returns a list of valid exam dates within a period
    Excludes Sundays and holidays
    """
    # Get all holidays in the range
    holidays = await get_holidays_in_range(db, start_date, end_date, school_id, state)
    holiday_dates = {holiday.date for holiday in holidays}
    
    # Generate all dates in range
    valid_dates = []
    current = start_date
    
    while current <= end_date:
        # Check if it's a Sunday (weekday() returns 6 for Sunday)
        is_sunday = current.weekday() == 6
        is_holiday = current in holiday_dates
        
        if not is_holiday and (not exclude_sundays or not is_sunday):
            valid_dates.append(current)
        
        current += timedelta(days=1)
    
    return valid_dates


async def add_school_holiday(
    db: AsyncSession,
    school_id: int,
    name: str,
    holiday_date: date,
    description: Optional[str] = None
) -> Holiday:
    """
    Adds a school-specific holiday
    """
    holiday = Holiday(
        name=name,
        date=holiday_date,
        holiday_type="school_specific",
        school_id=school_id,
        description=description,
        is_active=True
    )
    
    db.add(holiday)
    await db.commit()
    await db.refresh(holiday)
    return holiday


async def is_valid_exam_date(
    db: AsyncSession,
    exam_date: date,
    school_id: Optional[int] = None,
    state: Optional[str] = None,
    exclude_sundays: bool = True
) -> tuple[bool, Optional[str]]:
    """
    Validates if a date is suitable for an exam
    Returns (is_valid, reason_if_invalid)
    """
    # Check if it's a Sunday
    if exclude_sundays and exam_date.weekday() == 6:
        return False, "Cannot schedule exam on Sunday"
    
    # Check if it's a holiday
    holidays = await get_holidays_in_range(db, exam_date, exam_date, school_id, state)
    if holidays:
        holiday_names = ", ".join([h.name for h in holidays])
        return False, f"Cannot schedule exam on holiday: {holiday_names}"
    
    return True, None
