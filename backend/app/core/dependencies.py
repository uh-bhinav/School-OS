# app/core/dependencies.py
"""
Centralized dependency injection for all service classes.
Each service is instantiated with an AsyncSession from the database connection pool.
"""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

# Import all service classes
from app.services.cart_service import CartService
from app.services.order_service import OrderService
from app.services.product_category_service import ProductCategoryService
from app.services.product_package_service import ProductPackageService
from app.services.product_service import ProductService


def get_cart_service(db: AsyncSession = Depends(get_db)) -> CartService:
    """Dependency injector for CartService."""
    return CartService(db)


def get_order_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    """Dependency injector for OrderService."""
    return OrderService(db)


def get_product_service(db: AsyncSession = Depends(get_db)) -> ProductService:
    """Dependency injector for ProductService."""
    return ProductService(db)


def get_product_category_service(
    db: AsyncSession = Depends(get_db),
) -> ProductCategoryService:
    """Dependency injector for ProductCategoryService."""
    return ProductCategoryService(db)


def get_product_package_service(
    db: AsyncSession = Depends(get_db),
) -> ProductPackageService:
    """Dependency injector for ProductPackageService."""
    return ProductPackageService(db)
