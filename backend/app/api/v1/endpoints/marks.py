# backend/app/api/v1/endpoints/marks.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db
from app.schemas.mark_schema import MarkCreate, MarkOut, MarkUpdate
from app.services import mark_service

router = APIRouter()


# Admin/Teacher only: Create a new mark record
@router.post(
    "/",
    response_model=MarkOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_role("teacher"))
    ],  # Example: Teachers can submit marks
)
async def create_new_mark(mark_in: MarkCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new mark record. Teacher only.
    """
    return await mark_service.create_mark(db=db, mark_in=mark_in)


# Student/Parent only: Get marks for a specific student
@router.get(
    "/students/{student_id}",
    response_model=list[MarkOut],
    dependencies=[Depends(require_role("student"))],  # Or Parent
)
async def get_student_marks(student_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all marks for a specific student.
    """
    marks = await mark_service.get_marks_by_student(db=db, student_id=student_id)
    if not marks:
        raise HTTPException(status_code=404, detail="Marks not found for this student.")
    return marks


# Admin/Teacher only: Update an existing mark record
@router.put(
    "/{mark_id}",
    response_model=MarkOut,
    dependencies=[Depends(require_role("teacher"))],
)
async def update_mark(
    mark_id: int, mark_in: MarkUpdate, db: AsyncSession = Depends(get_db)
):
    db_obj = await mark_service.get_mark_by_id(db, mark_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Mark not found.")
    return await mark_service.update_mark(db, db_obj=db_obj, mark_in=mark_in)


# Admin only: Delete a mark record
@router.delete(
    "/{mark_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_mark(mark_id: int, db: AsyncSession = Depends(get_db)):
    db_obj = await mark_service.get_mark_by_id(db, mark_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Mark not found.")
    await mark_service.delete_mark(db, db_obj=db_obj)
    return {"ok": True}
