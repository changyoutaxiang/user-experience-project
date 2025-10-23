"""create tasks table

Revision ID: 20251021_003
Revises: 20251021_002
Create Date: 2025-10-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20251021_003'
down_revision: Union[str, None] = '20251021_002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create task_status enum type only if it doesn't exist
    conn = op.get_bind()
    result = conn.execute(
        sa.text("SELECT 1 FROM pg_type WHERE typname = 'taskstatus'")
    ).fetchone()

    if not result:
        task_status_enum = postgresql.ENUM(
            'todo', 'in_progress', 'in_review', 'completed', 'cancelled',
            name='taskstatus',
            create_type=True
        )
        task_status_enum.create(conn)

    # Create task_priority enum type only if it doesn't exist
    result = conn.execute(
        sa.text("SELECT 1 FROM pg_type WHERE typname = 'taskpriority'")
    ).fetchone()

    if not result:
        task_priority_enum = postgresql.ENUM(
            'low', 'medium', 'high', 'urgent',
            name='taskpriority',
            create_type=True
        )
        task_priority_enum.create(conn)

    # Create tasks table (reference enums by name since they may already exist)
    task_status_enum = postgresql.ENUM(
        'todo', 'in_progress', 'in_review', 'completed', 'cancelled',
        name='taskstatus',
        create_type=False
    )
    task_priority_enum = postgresql.ENUM(
        'low', 'medium', 'high', 'urgent',
        name='taskpriority',
        create_type=False
    )

    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', task_status_enum, nullable=False, server_default='todo'),
        sa.Column('priority', task_priority_enum, nullable=False, server_default='medium'),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('assignee_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_by_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['assignee_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for tasks table
    op.create_index('ix_tasks_id', 'tasks', ['id'])
    op.create_index('ix_tasks_name', 'tasks', ['name'])
    op.create_index('ix_tasks_status', 'tasks', ['status'])
    op.create_index('ix_tasks_priority', 'tasks', ['priority'])
    op.create_index('ix_tasks_project_id', 'tasks', ['project_id'])
    op.create_index('ix_tasks_assignee_id', 'tasks', ['assignee_id'])
    op.create_index('ix_tasks_due_date', 'tasks', ['due_date'])

    # Update document_links table to support task association
    op.add_column('document_links', sa.Column('task_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_document_links_task_id', 'document_links', 'tasks', ['task_id'], ['id'], ondelete='CASCADE')
    op.create_index('ix_document_links_task_id', 'document_links', ['task_id'])

    # Make project_id nullable since documents can now be linked to tasks
    op.alter_column('document_links', 'project_id', nullable=True)


def downgrade() -> None:
    # Drop document_links task association
    op.drop_index('ix_document_links_task_id', table_name='document_links')
    op.drop_constraint('fk_document_links_task_id', 'document_links', type_='foreignkey')
    op.drop_column('document_links', 'task_id')
    op.alter_column('document_links', 'project_id', nullable=False)

    # Drop tasks table
    op.drop_index('ix_tasks_due_date', table_name='tasks')
    op.drop_index('ix_tasks_assignee_id', table_name='tasks')
    op.drop_index('ix_tasks_project_id', table_name='tasks')
    op.drop_index('ix_tasks_priority', table_name='tasks')
    op.drop_index('ix_tasks_status', table_name='tasks')
    op.drop_index('ix_tasks_name', table_name='tasks')
    op.drop_index('ix_tasks_id', table_name='tasks')
    op.drop_table('tasks')

    # Drop task enums
    task_status_enum = postgresql.ENUM(
        'todo', 'in_progress', 'in_review', 'completed', 'cancelled',
        name='taskstatus'
    )
    task_status_enum.drop(op.get_bind(), checkfirst=True)

    task_priority_enum = postgresql.ENUM(
        'low', 'medium', 'high', 'urgent',
        name='taskpriority'
    )
    task_priority_enum.drop(op.get_bind(), checkfirst=True)
