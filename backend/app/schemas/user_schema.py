from typing import Optional

from pydantic import BaseModel, EmailStr


class UserInviteRequest(BaseModel):
    email: EmailStr
    school_id: int
    first_name: str
    last_name: str
    role_name: str
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None  # YYYY-MM-DD


class UserInviteResponse(BaseModel):
    id: str
    email: str
    role: str
    status: str
