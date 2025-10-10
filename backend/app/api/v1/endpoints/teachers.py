# backend/app/api/v1/endpoints/teachers.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db

# CHANGED: Import the new TeacherQualification schema
from app.schemas.teacher_schema import TeacherOut, TeacherQualification, TeacherUpdate
from app.services import teacher_service

router = APIRouter()


@router.get(
    "/school/{school_id}",
    response_model=list[TeacherOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_teachers(school_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all teacher records for a specific school. Admin only.
    """
    return await teacher_service.get_all_teachers_for_school(db=db, school_id=school_id)


@router.get(
    "/{teacher_id}",
    response_model=TeacherOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_teacher_by_id(teacher_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific teacher by their teacher_id. Admin only.
    """
    db_teacher = await teacher_service.get_teacher(db=db, teacher_id=teacher_id)
    if not db_teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")
    return db_teacher


# ADDED: New endpoint for getting qualifications
@router.get(
    "/{teacher_id}/qualifications",
    response_model=TeacherQualification,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_teacher_qualifications_by_id(teacher_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a teacher's specific qualifications and experience. Admin only.
    """
    qualifications = await teacher_service.get_teacher_qualifications(db=db, teacher_id=teacher_id)
    if not qualifications:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Qualifications not found for this teacher",
        )
    return qualifications


@router.put(
    "/{teacher_id}",
    response_model=TeacherOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_existing_teacher(teacher_id: int, *, db: AsyncSession = Depends(get_db), teacher_in: TeacherUpdate):
    """

    Update a teacher's employment details. Admin only.
    """
    db_teacher = await teacher_service.get_teacher(db=db, teacher_id=teacher_id)
    if not db_teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")

    return await teacher_service.update_teacher(db=db, db_obj=db_teacher, teacher_in=teacher_in)


@router.delete(
    "/{teacher_id}",
    response_model=TeacherOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def deactivate_existing_teacher(teacher_id: int, db: AsyncSession = Depends(get_db)):
    """
    Deactivate a teacher (soft delete). Admin only.
    """
    db_teacher = await teacher_service.get_teacher(db=db, teacher_id=teacher_id)
    if not db_teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")

    return await teacher_service.deactivate_teacher(db=db, db_obj=db_teacher)
