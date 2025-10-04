# backend/app/db/base_class.py
from sqlalchemy.ext.declarative import declarative_base

# This creates the Base class that all your SQLAlchemy models will inherit from.
Base = declarative_base()
