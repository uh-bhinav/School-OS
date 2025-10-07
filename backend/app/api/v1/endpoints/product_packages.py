from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db

# Import Model directly for full context retrieval in PUT/DELETE
from app.models.product_package import ProductPackage
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
async def create_new_package(package_in: ProductPackageCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new product package/bundle,
    including its list of contained products. Admin only.
    """
    return await product_package_service.create_package(db=db, obj_in=package_in)


@router.get("/school/{school_id}", response_model=list[ProductPackageOut], tags=["E-commerce"])
async def get_all_active_packages(school_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all active product packages for a school (available to all users via RLS).
    """
    # The service layer handles the 'is_active=True' filter.
    return await product_package_service.get_all_packages_for_school(db=db, school_id=school_id)


@router.get(
    "/{package_id}",
    response_model=ProductPackageOut,
    dependencies=[Depends(require_role("Parent"))],
    tags=["E-commerce"],
)
async def get_package_by_id(package_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific active package by ID.
    Accessible by Parents/Students to view contents.
    """
    # Service layer ensures the result is active (is_active=True)
    package = await product_package_service.get_package(db=db, package_id=package_id)
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product Package not found or inactive",
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

    CRITICAL FIX: Uses db.get to retrieve the object regardless of 'is_active' status.
    """
    package = await db.get(ProductPackage, package_id)  # Use direct ORM access to retrieve inactive items
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product Package not found")
    return await product_package_service.update_package(db=db, db_obj=package, obj_in=package_in)


@router.delete(
    "/{package_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
    tags=["E-commerce"],
)
async def delete_package_by_id(package_id: int, db: AsyncSession = Depends(get_db)):
    """
    Deactivate (soft delete) a product package. Admin only.

    CRITICAL FIX: Uses db.get to retrieve the object regardless of 'is_active' status
    before performing the soft delete.
    """
    package = await db.get(ProductPackage, package_id)  # Use direct ORM access to retrieve inactive items
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product Package not found")

    if not package.is_active:
        # If it's already inactive, the DELETE operation is implicitly successful.
        return None

    await product_package_service.delete_package(db=db, db_obj=package)
    return None
