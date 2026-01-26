from typing import Any, Optional

from pydantic import BaseModel


class LogCreate(BaseModel):
    log_level: str
    message: str
    details: Optional[dict[str, Any]] = None
