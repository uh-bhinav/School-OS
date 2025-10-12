from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import Audit
from app.schemas.audit_schema import AuditCreate


async def create_audit_log(db: AsyncSession, *, audit_data: AuditCreate) -> Audit:
    """
    Creates a new entry in the audits table to record a user action.
    """
    db_audit = Audit(**audit_data.model_dump())
    db.add(db_audit)
    # The commit here is crucial. We want the audit log to be saved
    # as part of the main transaction of the calling service.
    # The calling service will be responsible for the final db.commit().
    await db.flush()  # Use flush to assign the audit_id without ending the transaction
    return db_audit
