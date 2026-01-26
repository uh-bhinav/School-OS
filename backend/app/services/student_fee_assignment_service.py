from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student_fee_assignment import StudentFeeAssignment
from app.schemas.audit_schema import AuditCreate
from app.schemas.student_fee_assignment_schema import StudentFeeAssignmentCreate
from app.services import audit_service


class StudentFeeAssignmentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_or_update_override(self, *, override_data: StudentFeeAssignmentCreate, user_id: UUID, ip_address: str) -> StudentFeeAssignment:
        """
        Creates a new fee override or updates an existing one for a student,
        using fully asynchronous database patterns.
        """
        # --- FIX: Use the correct async 'select' pattern ---
        stmt = select(StudentFeeAssignment).where(StudentFeeAssignment.student_id == override_data.student_id, StudentFeeAssignment.fee_component_id == override_data.fee_component_id)
        result = await self.db.execute(stmt)
        existing_override = result.scalars().first()

        action_type = "UPDATE" if existing_override else "CREATE"

        if existing_override:
            # Update the existing record
            existing_override.is_active = override_data.is_active
            override_to_return = existing_override
        else:
            # Create a new record
            new_override = StudentFeeAssignment(**override_data.model_dump())
            self.db.add(new_override)
            override_to_return = new_override

        await self.db.flush()  # Flush to get the ID for the audit log

        # Create the audit log
        audit_log = AuditCreate(user_id=user_id, action_type=action_type, table_name="student_fee_assignments", record_id=str(override_to_return.id), ip_address=ip_address, new_data=override_data.model_dump())

        # Call the audit service (which correctly does not commit)
        await audit_service.create_audit_log(db=self.db, audit_data=audit_log)

        # Commit the entire transaction and refresh the object
        await self.db.commit()
        await self.db.refresh(override_to_return)

        return override_to_return
