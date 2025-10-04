"""# backend/app/models/package_item.py
from sqlalchemy import Column, ForeignKey, Integer, Table
from app.db.base_class import Base

package_items_association = Table(
    'package_items', Base.metadata,
    Column('package_id', Integer, ForeignKey('product_packages.id'), primary_key=True),
    Column('product_id', Integer, ForeignKey('products.product_id'), primary_key=True)
)
"""
