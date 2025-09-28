# backend/app/api/v1/endpoints/product_packages.py (Completed)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db
from app.schemas.product_package_schema import (
    ProductPackageCreate,
    ProductPackageOut,
    ProductPackageUpdate,
)
from app.services import product_package_service

router = APIRouter()


@router.post(
    "/",
    response_model=ProductPackageOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
    tags=["E-commerce"],
)
async def create_new_package(
    package_in: ProductPackageCreate, db: AsyncSession = Depends(get_db)
):
    """
    Create a new product package/bundle,
    including its list of contained products. Admin only.
    """
    return await product_package_service.create_package(db=db, obj_in=package_in)


@router.get(
    "/school/{school_id}", response_model=list[ProductPackageOut], tags=["E-commerce"]
)
async def get_all_active_packages(school_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all active product packages for a school (available to all users via RLS).
    """
    return await product_package_service.get_all_packages_for_school(
        db=db, school_id=school_id
    )


@router.get(
    "/{package_id}",
    response_model=ProductPackageOut,
    dependencies=[Depends(require_role("Parent"))],
    tags=["E-commerce"],
)
async def get_package_by_id(package_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific package by ID. Accessible by
      Parents/Students to view contents.
    """
    package = await product_package_service.get_package(db=db, package_id=package_id)
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product Package not found"
        )
    return package


@router.put(
    "/{package_id}",
    response_model=ProductPackageOut,
    dependencies=[Depends(require_role("Admin"))],
    tags=["E-commerce"],
)
async def update_package_header_by_id(
    package_id: int,
    package_in: ProductPackageUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Update a package's header details (name, price). Admin only.
    """
    package = await product_package_service.get_package(db=db, package_id=package_id)
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product Package not found"
        )
    return await product_package_service.update_package(
        db=db, db_obj=package, obj_in=package_in
    )


@router.delete(
    "/{package_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
    tags=["E-commerce"],
)
async def delete_package_by_id(package_id: int, db: AsyncSession = Depends(get_db)):
    """
    Deactivate (soft delete) a product package. Admin only.
    """
    package = await product_package_service.get_package(db=db, package_id=package_id)
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product Package not found"
        )

    await product_package_service.delete_package(db=db, db_obj=package)
    return None
