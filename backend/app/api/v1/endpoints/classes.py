# backend/app/api/v1/endpoints/classes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db
from app.schemas.class_schema import ClassCreate, ClassOut, ClassUpdate
from app.services import class_service

router = APIRouter()


@router.post(
    "/",
    response_model=ClassOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_class(
    *, db: AsyncSession = Depends(get_db), class_in: ClassCreate
):
    """
    Create a new class for a school. Admin only.
    """
    new_class = await class_service.create_class(db=db, class_in=class_in)
    return new_class


@router.get(
    "/{class_id}",
    response_model=ClassOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_class_by_id(class_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific class by its ID.
    """
    db_class = await class_service.get_class(db=db, class_id=class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Class not found"
        )
    return db_class


@router.put(
    "/{class_id}",
    response_model=ClassOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_existing_class(
    class_id: int, *, db: AsyncSession = Depends(get_db), class_in: ClassUpdate
):
    """
    Update a class.
    """
    db_class = await class_service.get_class(db=db, class_id=class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Class not found"
        )

    updated_class = await class_service.update_class(
        db=db, db_obj=db_class, class_in=class_in
    )
    return updated_class
