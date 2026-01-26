# backend/app/services/hall_ticket_service.py
"""
Service for generating hall tickets for students
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.exam_schedule import ExamPeriod, HallTicket, SubjectExamSchedule
from app.models.student import Student


def generate_ticket_number(
    school_id: int, 
    student_id: int, 
    exam_period_id: int
) -> str:
    """
    Generates a unique hall ticket number
    Format: HT-{school_id}-{exam_period_id}-{student_id}-{timestamp}
    """
    timestamp = datetime.now().strftime("%Y%m%d")
    return f"HT-{school_id}-{exam_period_id}-{student_id}-{timestamp}"


async def generate_hall_tickets_for_period(
    db: AsyncSession,
    exam_period_id: int
) -> List[HallTicket]:
    """
    Generates hall tickets for all students in the exam period's class/section
    """
    # Get exam period
    result = await db.execute(
        select(ExamPeriod).where(ExamPeriod.id == exam_period_id)
    )
    exam_period = result.scalar_one_or_none()
    
    if not exam_period:
        raise ValueError(f"Exam period {exam_period_id} not found")
    
    if exam_period.status == "draft":
        raise ValueError("Cannot generate hall tickets for draft exam period")
    
    # Get all students in the class/section
    result = await db.execute(
        select(Student).where(
            and_(
                Student.school_id == exam_period.school_id,
                Student.current_class_id == exam_period.class_id,
                Student.is_active == True
            )
        )
    )
    students = result.scalars().all()
    
    if not students:
        raise ValueError(f"No students found for class {exam_period.class_id}")
    
    hall_tickets = []
    
    for student in students:
        # Check if hall ticket already exists
        result = await db.execute(
            select(HallTicket).where(
                and_(
                    HallTicket.exam_period_id == exam_period_id,
                    HallTicket.student_id == student.student_id,
                    HallTicket.is_active == True
                )
            )
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            hall_tickets.append(existing)
            continue
        
        # Generate new hall ticket
        ticket_number = generate_ticket_number(
            exam_period.school_id, 
            student.student_id, 
            exam_period_id
        )
        
        hall_ticket = HallTicket(
            exam_period_id=exam_period_id,
            student_id=student.student_id,
            ticket_number=ticket_number,
            is_active=True
        )
        
        db.add(hall_ticket)
        hall_tickets.append(hall_ticket)
    
    await db.commit()
    
    # Refresh all tickets
    for ticket in hall_tickets:
        await db.refresh(ticket)
    
    return hall_tickets


async def get_hall_ticket_data(
    db: AsyncSession,
    hall_ticket_id: int
) -> Optional[dict]:
    """
    Retrieves complete hall ticket data for PDF generation
    """
    result = await db.execute(
        select(HallTicket).where(HallTicket.id == hall_ticket_id)
    )
    hall_ticket = result.scalar_one_or_none()
    
    if not hall_ticket:
        return None
    
    # Get exam period with schedules
    result = await db.execute(
        select(ExamPeriod).where(ExamPeriod.id == hall_ticket.exam_period_id)
    )
    exam_period = result.scalar_one_or_none()
    
    # Get student details
    result = await db.execute(
        select(Student).where(Student.student_id == hall_ticket.student_id)
    )
    student = result.scalar_one_or_none()
    
    # Get subject schedules
    result = await db.execute(
        select(SubjectExamSchedule).where(
            and_(
                SubjectExamSchedule.exam_period_id == exam_period.id,
                SubjectExamSchedule.is_active == True
            )
        ).order_by(SubjectExamSchedule.exam_date)
    )
    schedules = result.scalars().all()
    
    # Format schedule data
    exam_schedule = []
    for schedule in schedules:
        # Get subject name
        from app.models.subject import Subject
        result = await db.execute(
            select(Subject).where(Subject.subject_id == schedule.subject_id)
        )
        subject = result.scalar_one_or_none()
        
        exam_schedule.append({
            "date": schedule.exam_date.strftime("%d-%m-%Y"),
            "subject": subject.name if subject else "Unknown",
            "time": schedule.start_time.strftime("%I:%M %p") if schedule.start_time else "TBA",
            "duration": f"{schedule.duration_minutes} mins",
            "max_marks": schedule.max_marks
        })
    
    return {
        "ticket_number": hall_ticket.ticket_number,
        "student": {
            "name": f"{student.first_name} {student.last_name}",
            "admission_number": student.admission_number,
            "class": exam_period.class_id,
            "section": exam_period.section,
        },
        "exam_period": {
            "name": exam_period.exam_period_name,
            "start_date": exam_period.start_date.strftime("%d-%m-%Y"),
            "end_date": exam_period.end_date.strftime("%d-%m-%Y"),
            "total_marks": exam_period.total_marks
        },
        "schedule": exam_schedule,
        "generated_at": hall_ticket.generated_at.strftime("%d-%m-%Y %I:%M %p")
    }


async def get_hall_ticket_by_student(
    db: AsyncSession,
    student_id: int,
    exam_period_id: int
) -> Optional[HallTicket]:
    """
    Retrieves hall ticket for a specific student and exam period
    """
    result = await db.execute(
        select(HallTicket).where(
            and_(
                HallTicket.student_id == student_id,
                HallTicket.exam_period_id == exam_period_id,
                HallTicket.is_active == True
            )
        )
    )
    return result.scalar_one_or_none()
