from uuid import UUID

from sqlalchemy.orm import Session

from app.models.student_fee_assignment import StudentFeeAssignment
from app.schemas.audit_schema import AuditCreate
from app.schemas.student_fee_assignment_schema import StudentFeeAssignmentCreate
from app.services import audit_service


class StudentFeeAssignmentService:
    def __init__(self, db: Session):
        self.db = db

    def create_or_update_override(self, *, override_data: StudentFeeAssignmentCreate, user_id: UUID, ip_address: str) -> StudentFeeAssignment:
        """
        Creates or updates a fee override for a specific student.
        This allows an admin to selectively disable a fee component, like 'Bus Fee',
        for a student who deviates from their class default [cite: 324-325].
        """
        # Check if an override for this student and component already exists
        existing_override = self.db.query(StudentFeeAssignment).filter_by(student_id=override_data.student_id, fee_component_id=override_data.fee_component_id).first()

        action_type = "UPDATE" if existing_override else "CREATE"

        if existing_override:
            # If it exists, update it with the new 'is_active' status
            existing_override.is_active = override_data.is_active
            db_obj = existing_override
        else:
            # If it doesn't exist, create a new override record
            db_obj = StudentFeeAssignment(**override_data.model_dump())
            self.db.add(db_obj)

        self.db.flush()

        audit_log = AuditCreate(user_id=user_id, action_type=action_type, table_name="student_fee_assignments", record_id=str(db_obj.id), ip_address=ip_address, new_data=override_data.model_dump())
        audit_service.create_audit_log(db=self.db, audit_data=audit_log)

        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
