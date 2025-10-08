# backend/app/services/student_contact_service.py
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.student_contact import StudentContact
from app.schemas.student_contact_schema import (
    StudentContactCreate,
    StudentContactUpdate,
)


async def get_contact_by_id(db: AsyncSession, *, contact_id: int) -> Optional[StudentContact]:
    """
    Gets a single student contact record by its primary ID.
    """
    stmt = select(StudentContact).where(StudentContact.id == contact_id)
    result = await db.execute(stmt)
    return result.scalars().first()


# CORRECTED security check function
async def is_user_linked_to_student(db: AsyncSession, *, user_id: UUID, student_id: int) -> bool:
    """
    Checks if a user (parent/guardian) is linked as a contact to a specific student.
    """
    stmt = select(StudentContact).where(
        StudentContact.profile_user_id == user_id,
        StudentContact.student_id == student_id,
        StudentContact.is_active,
    )
    result = await db.execute(stmt)
    return result.scalars().first() is not None


async def create_contact(db: AsyncSession, *, contact_in: StudentContactCreate) -> StudentContact:
    db_obj = StudentContact(**contact_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_contacts_for_student(db: AsyncSession, *, student_id: int) -> list[StudentContact]:
    stmt = select(StudentContact).where(StudentContact.student_id == student_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_contact(db: AsyncSession, *, db_obj: StudentContact, contact_in: StudentContactUpdate) -> StudentContact:
    """
    Updates a student contact's details.
    """
    update_data = contact_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def soft_delete_contact(db: AsyncSession, *, db_obj: StudentContact) -> StudentContact:
    """
    Soft-deletes a student contact by setting is_active to False.
    """
    db_obj.is_active = False
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
