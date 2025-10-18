from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import Audit
from app.schemas.audit_schema import AuditCreate


async def create_audit_log(db: AsyncSession, *, audit_data: AuditCreate) -> Audit:
    """
    Creates a new audit log entry and adds it to the current session
    WITHOUT committing the transaction.
    """
    db_audit = Audit(**audit_data.model_dump())
    db.add(db_audit)

    # --- THIS IS THE CRITICAL PART ---
    # We use flush() to send the data to the DB and get an ID,
    # but the transaction remains open.
    # We DO NOT call commit() here.
    await db.flush()

    return db_audit
