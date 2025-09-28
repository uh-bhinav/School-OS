from typing import Optional

from pydantic import UUID4, BaseModel


class ProfileOut(BaseModel):
    user_id: UUID4  #
    school_id: int  #
    first_name: Optional[str] = None  #
    last_name: Optional[str] = None  #

    class Config:
        from_attributes = True
