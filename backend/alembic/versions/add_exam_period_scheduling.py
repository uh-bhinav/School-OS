"""Add exam period scheduling tables

Revision ID: add_exam_period_scheduling
Revises: 
Create Date: 2026-01-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_exam_period_scheduling'
down_revision = None  # Update this to your last migration
branch_labels = None
depends_on = None


def upgrade():
    # Create exam_periods table
    op.create_table(
        'exam_periods',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('school_id', sa.Integer(), nullable=False),
        sa.Column('academic_year_id', sa.Integer(), nullable=False),
        sa.Column('class_id', sa.Integer(), nullable=False),
        sa.Column('section', sa.String(), nullable=False),
        sa.Column('exam_period_name', sa.String(), nullable=False),
        sa.Column('exam_type_id', sa.Integer(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('total_marks', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), server_default='draft'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.ForeignKeyConstraint(['school_id'], ['schools.school_id'], ),
        sa.ForeignKeyConstraint(['academic_year_id'], ['academic_years.id'], ),
        sa.ForeignKeyConstraint(['class_id'], ['classes.class_id'], ),
        sa.ForeignKeyConstraint(['exam_type_id'], ['exam_types.exam_type_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_exam_periods_id', 'exam_periods', ['id'])
    op.create_index('ix_exam_periods_school_id', 'exam_periods', ['school_id'])
    op.create_index('ix_exam_periods_status', 'exam_periods', ['status'])
    
    # Create subject_exam_schedules table
    op.create_table(
        'subject_exam_schedules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('exam_period_id', sa.Integer(), nullable=False),
        sa.Column('subject_id', sa.Integer(), nullable=False),
        sa.Column('exam_date', sa.Date(), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), server_default='60'),
        sa.Column('max_marks', sa.Integer(), nullable=False),
        sa.Column('is_auto_mapped', sa.Boolean(), server_default='true'),
        sa.Column('manually_edited_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.ForeignKeyConstraint(['exam_period_id'], ['exam_periods.id'], ),
        sa.ForeignKeyConstraint(['subject_id'], ['subjects.subject_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_subject_exam_schedules_id', 'subject_exam_schedules', ['id'])
    op.create_index('ix_subject_exam_schedules_exam_period_id', 'subject_exam_schedules', ['exam_period_id'])
    op.create_index('ix_subject_exam_schedules_exam_date', 'subject_exam_schedules', ['exam_date'])
    
    # Create holidays table
    op.create_table(
        'holidays',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('holiday_type', sa.String(), nullable=False),
        sa.Column('state', sa.String(), nullable=True),
        sa.Column('school_id', sa.Integer(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['school_id'], ['schools.school_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_holidays_date', 'holidays', ['date'])
    op.create_index('ix_holidays_holiday_type', 'holidays', ['holiday_type'])
    
    # Create hall_tickets table
    op.create_table(
        'hall_tickets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('exam_period_id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('ticket_number', sa.String(), nullable=False),
        sa.Column('generated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('pdf_url', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.ForeignKeyConstraint(['exam_period_id'], ['exam_periods.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['students.student_id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('ticket_number')
    )
    op.create_index('ix_hall_tickets_ticket_number', 'hall_tickets', ['ticket_number'])
    op.create_index('ix_hall_tickets_exam_period_id', 'hall_tickets', ['exam_period_id'])
    op.create_index('ix_hall_tickets_student_id', 'hall_tickets', ['student_id'])


def downgrade():
    # Drop tables in reverse order (respect foreign keys)
    op.drop_table('hall_tickets')
    op.drop_table('subject_exam_schedules')
    op.drop_table('holidays')
    op.drop_table('exam_periods')
