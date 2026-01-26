# backend/app/services/exam_period_service.py
"""
Service for creating and managing exam periods with auto-mapping logic
"""
from datetime import date, time
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.exam_schedule import ExamPeriod, HallTicket, SubjectExamSchedule
from app.models.subject import Subject
from app.services.holiday_service import get_valid_exam_dates, is_valid_exam_date


async def get_class_subjects(
    db: AsyncSession,
    school_id: int,
    class_id: int
) -> List[Subject]:
    """
    Retrieves all active subjects for a given class
    """
    # In a real implementation, this would query a class-subject mapping table
    # For now, we'll get all subjects for the school
    result = await db.execute(
        select(Subject).where(
            and_(
                Subject.school_id == school_id,
                Subject.is_active == True
            )
        )
    )
    return result.scalars().all()


async def auto_map_subjects_to_dates(
    db: AsyncSession,
    start_date: date,
    end_date: date,
    subjects: List[Subject],
    school_id: int,
    marks_per_subject: int,
    default_start_time: time = time(9, 0),  # 9:00 AM
    default_duration: int = 60,  # 60 minutes
    state: Optional[str] = None
) -> List[dict]:
    """
    Auto-maps subjects to valid exam dates within the period
    
    Logic:
    1. Get all valid dates (excluding Sundays and holidays)
    2. Distribute subjects sequentially across valid dates
    3. One subject per day by default
    4. If more subjects than valid dates, assign multiple subjects per day
    
    Returns list of subject-date mappings
    """
    # Get valid exam dates
    valid_dates = await get_valid_exam_dates(
        db, start_date, end_date, school_id, state, exclude_sundays=True
    )
    
    if not valid_dates:
        raise ValueError("No valid exam dates available in the selected period")
    
    if len(subjects) > len(valid_dates):
        raise ValueError(
            f"Not enough valid exam dates ({len(valid_dates)}) for {len(subjects)} subjects. "
            "Please extend the exam period or reduce subjects."
        )
    
    # Map subjects to dates
    mappings = []
    for idx, subject in enumerate(subjects):
        exam_date = valid_dates[idx % len(valid_dates)]
        
        # If multiple subjects on same day, stagger start times
        time_offset = (idx // len(valid_dates)) * 90  # 90 minutes apart
        hours_offset = time_offset // 60
        minutes_offset = time_offset % 60
        
        subject_start_time = time(
            (default_start_time.hour + hours_offset) % 24,
            (default_start_time.minute + minutes_offset) % 60
        )
        
        mappings.append({
            "subject_id": subject.subject_id,
            "subject_name": subject.name,
            "exam_date": exam_date,
            "start_time": subject_start_time,
            "duration_minutes": default_duration,
            "max_marks": marks_per_subject,
            "is_auto_mapped": True
        })
    
    return mappings


async def create_exam_period(
    db: AsyncSession,
    school_id: int,
    academic_year_id: int,
    class_id: int,
    section: str,
    exam_period_name: str,
    exam_type_id: int,
    start_date: date,
    end_date: date,
    total_marks: int,
    state: Optional[str] = None,
    auto_map: bool = True
) -> ExamPeriod:
    """
    Creates an exam period with optional auto-mapping of subjects
    """
    # Validate date range
    if end_date < start_date:
        raise ValueError("End date must be after start date")
    
    # Create exam period
    exam_period = ExamPeriod(
        school_id=school_id,
        academic_year_id=academic_year_id,
        class_id=class_id,
        section=section,
        exam_period_name=exam_period_name,
        exam_type_id=exam_type_id,
        start_date=start_date,
        end_date=end_date,
        total_marks=total_marks,
        status="draft",
        is_active=True
    )
    
    db.add(exam_period)
    await db.flush()  # Get the ID
    
    if auto_map:
        # Get subjects for the class
        subjects = await get_class_subjects(db, school_id, class_id)
        
        if not subjects:
            await db.rollback()
            raise ValueError(f"No subjects found for class_id {class_id}")
        
        # Calculate marks per subject
        marks_per_subject = total_marks // len(subjects) if subjects else 0
        
        # Auto-map subjects to dates
        mappings = await auto_map_subjects_to_dates(
            db, start_date, end_date, subjects, school_id, 
            marks_per_subject, state=state
        )
        
        # Create subject exam schedules
        for mapping in mappings:
            subject_schedule = SubjectExamSchedule(
                exam_period_id=exam_period.id,
                subject_id=mapping["subject_id"],
                exam_date=mapping["exam_date"],
                start_time=mapping["start_time"],
                duration_minutes=mapping["duration_minutes"],
                max_marks=mapping["max_marks"],
                is_auto_mapped=True,
                is_active=True
            )
            db.add(subject_schedule)
    
    await db.commit()
    await db.refresh(exam_period)
    return exam_period


async def get_exam_period_with_schedules(
    db: AsyncSession,
    exam_period_id: int
) -> Optional[ExamPeriod]:
    """
    Retrieves exam period with all subject schedules
    """
    result = await db.execute(
        select(ExamPeriod).where(
            and_(
                ExamPeriod.id == exam_period_id,
                ExamPeriod.is_active == True
            )
        )
    )
    exam_period = result.scalar_one_or_none()
    
    if exam_period:
        # Load subject schedules
        result = await db.execute(
            select(SubjectExamSchedule).where(
                and_(
                    SubjectExamSchedule.exam_period_id == exam_period_id,
                    SubjectExamSchedule.is_active == True
                )
            )
        )
        exam_period.subject_schedules = result.scalars().all()
    
    return exam_period


async def update_subject_exam_date(
    db: AsyncSession,
    subject_schedule_id: int,
    new_date: date,
    new_start_time: Optional[time] = None,
    school_id: Optional[int] = None,
    state: Optional[str] = None
) -> SubjectExamSchedule:
    """
    Manually updates a subject's exam date
    Validates the new date before updating
    """
    # Get the schedule
    result = await db.execute(
        select(SubjectExamSchedule).where(SubjectExamSchedule.id == subject_schedule_id)
    )
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        raise ValueError(f"Subject exam schedule {subject_schedule_id} not found")
    
    # Validate the new date
    is_valid, reason = await is_valid_exam_date(db, new_date, school_id, state)
    if not is_valid:
        raise ValueError(f"Invalid exam date: {reason}")
    
    # Update the schedule
    schedule.exam_date = new_date
    if new_start_time:
        schedule.start_time = new_start_time
    schedule.is_auto_mapped = False
    schedule.manually_edited_at = db.bind.dialect.name == 'postgresql' and 'NOW()' or None
    
    await db.commit()
    await db.refresh(schedule)
    return schedule


async def finalize_exam_period(
    db: AsyncSession,
    exam_period_id: int
) -> ExamPeriod:
    """
    Finalizes an exam period (changes status from draft to scheduled)
    This triggers hall ticket generation
    """
    result = await db.execute(
        select(ExamPeriod).where(ExamPeriod.id == exam_period_id)
    )
    exam_period = result.scalar_one_or_none()
    
    if not exam_period:
        raise ValueError(f"Exam period {exam_period_id} not found")
    
    if exam_period.status != "draft":
        raise ValueError(f"Exam period is already {exam_period.status}")
    
    # Verify all subjects have valid schedules
    result = await db.execute(
        select(SubjectExamSchedule).where(
            and_(
                SubjectExamSchedule.exam_period_id == exam_period_id,
                SubjectExamSchedule.is_active == True
            )
        )
    )
    schedules = result.scalars().all()
    
    if not schedules:
        raise ValueError("Cannot finalize exam period without subject schedules")
    
    # Update status
    exam_period.status = "scheduled"
    
    await db.commit()
    await db.refresh(exam_period)
    return exam_period


async def get_exam_periods_by_filters(
    db: AsyncSession,
    school_id: int,
    academic_year_id: Optional[int] = None,
    class_id: Optional[int] = None,
    section: Optional[str] = None,
    status: Optional[str] = None
) -> List[ExamPeriod]:
    """
    Retrieves exam periods with optional filters
    """
    query = select(ExamPeriod).where(
        and_(
            ExamPeriod.school_id == school_id,
            ExamPeriod.is_active == True
        )
    )
    
    if academic_year_id:
        query = query.where(ExamPeriod.academic_year_id == academic_year_id)
    
    if class_id:
        query = query.where(ExamPeriod.class_id == class_id)
    
    if section:
        query = query.where(ExamPeriod.section == section)
    
    if status:
        query = query.where(ExamPeriod.status == status)
    
    result = await db.execute(query)
    return result.scalars().all()
