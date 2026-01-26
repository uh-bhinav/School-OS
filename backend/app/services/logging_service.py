from sqlalchemy.ext.asyncio import AsyncSession

from app.models.log import Log
from app.schemas.log_schema import LogCreate


async def create_log_entry(db: AsyncSession, *, log_data: LogCreate) -> Log:
    """
    Creates a new entry in the logs table.
    """
    db_log = Log(**log_data.model_dump())
    db.add(db_log)
    # Note: This commit is separate. In an error scenario,
    # we want the log to save even if the main transaction is rolled back.
    await db.commit()
    return db_log
