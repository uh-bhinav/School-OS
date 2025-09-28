# backend/app/schemas/school_schema.py
from typing import Any, Optional  # We no longer need to import Dict

from pydantic import BaseModel, EmailStr, HttpUrl


class SchoolCreate(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[HttpUrl] = None
    configuration: Optional[dict[str, Any]] = None  # Changed from Dict to dict


class SchoolUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[HttpUrl] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[HttpUrl] = None
    configuration: Optional[dict[str, Any]] = None  # Changed from Dict to dict
    is_active: Optional[bool] = None


class SchoolOut(BaseModel):
    school_id: int
    name: str
    logo_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    configuration: Optional[dict[str, Any]] = None  # Changed from Dict to dict
    is_active: bool

    class Config:
        from_attributes = True
