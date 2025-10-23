from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel


class AuditCreate(BaseModel):
    user_id: UUID
    action_type: str  # e.g., 'CREATE', 'UPDATE', 'DELETE'
    table_name: str  # e.g., 'discounts', 'student_fee_assignments'
    record_id: str
    ip_address: Optional[str] = None
    # Use dict for flexibility with JSONB data
    new_data: Optional[dict[str, Any]] = None


class AuditOut(AuditCreate):
    audit_id: int

    class Config:
        from_attributes = True
