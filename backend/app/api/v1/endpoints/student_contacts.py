from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db
from app.schemas.student_contact_schema import (
    StudentContactCreate,
    StudentContactOut,
    StudentContactUpdate,
)
from app.services import student_contact_service

router = APIRouter()


@router.post(
    "/",
    response_model=StudentContactOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_student_contact(contact_in: StudentContactCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new student contact link. Admin only.
    """
    return await student_contact_service.create_contact(db=db, contact_in=contact_in)


@router.get(
    "/student/{student_id}",
    response_model=list[StudentContactOut],
    dependencies=[Depends(require_role("Admin", "Teacher"))],
)
async def get_contacts_for_student(student_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all contact links for a specific student. Admin or Teacher only.
    """
    return await student_contact_service.get_contacts_for_student(db=db, student_id=student_id)


@router.get(
    "/{contact_id}",
    response_model=StudentContactOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_contact_by_id(contact_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific student contact by its ID. Admin only.
    """
    db_contact = await student_contact_service.get_contact_by_id(db=db, contact_id=contact_id)
    if not db_contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student contact not found")
    return db_contact


@router.put(
    "/{contact_id}",
    response_model=StudentContactOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_student_contact_details(
    contact_id: int,
    *,
    db: AsyncSession = Depends(get_db),
    contact_in: StudentContactUpdate,
):
    """
    Update a student contact's information. Admin only.
    """
    db_contact = await student_contact_service.get_contact_by_id(db=db, contact_id=contact_id)
    if not db_contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student contact not found")
    return await student_contact_service.update_contact(db=db, db_obj=db_contact, contact_in=contact_in)


@router.delete(
    "/{contact_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_student_contact_link(
    contact_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Soft-delete a student contact link. Admin only.
    """
    db_contact = await student_contact_service.get_contact_by_id(db=db, contact_id=contact_id)
    if not db_contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student contact not found")
    await student_contact_service.soft_delete_contact(db=db, db_obj=db_contact)
    return None
