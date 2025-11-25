from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.security import require_role
from app.models.profile import Profile
from app.schemas.exam_class_mapping_schema import ExamClassMappingOut
from app.services.exam_class_mapping_service import ExamClassMappingService

router = APIRouter()


@router.post("/assign", response_model=ExamClassMappingOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role("Admin"))], summary="[Admin] Assign exam to class")
async def assign_exam_to_class(
    exam_id: int,
    class_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_user: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Assign an exam to a class.
    """
    try:
        mapping = await ExamClassMappingService.create_mapping(db=db, exam_id=exam_id, class_id=class_id, school_id=current_user.school_id)
        return mapping
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/remove", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_role("Admin"))], summary="[Admin] Remove exam from class")
async def remove_exam_from_class(
    exam_id: int,
    class_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_user: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Remove an exam from a class.
    """
    try:
        success = await ExamClassMappingService.delete_mapping(db=db, exam_id=exam_id, class_id=class_id, school_id=current_user.school_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam-class mapping not found")
        return None
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/exam/{exam_id}/classes", response_model=list[dict], dependencies=[Depends(require_role("Admin", "Teacher", "Parent"))], summary="Get all classes for an exam")
async def get_classes_for_exam(
    exam_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_user: Profile = Depends(deps.get_current_active_user),
):
    """Get all classes assigned to an exam"""
    return await ExamClassMappingService.get_exam_classes(db, exam_id)


@router.get("/class/{class_id}/exams", response_model=list[dict], dependencies=[Depends(require_role("Admin", "Teacher", "Parent"))], summary="Get all exams for a class")
async def get_exams_for_class(
    class_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_user: Profile = Depends(deps.get_current_active_user),
):
    """Get all exams assigned to a class"""
    return await ExamClassMappingService.get_class_exams(db, class_id)
