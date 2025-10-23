"""create project tables

Revision ID: 20251021_002
Revises: 20251021_001
Create Date: 2025-10-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20251021_002'
down_revision: Union[str, None] = '20251021_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create project_status enum type only if it doesn't exist
    conn = op.get_bind()
    result = conn.execute(
        sa.text("SELECT 1 FROM pg_type WHERE typname = 'projectstatus'")
    ).fetchone()

    if not result:
        project_status_enum = postgresql.ENUM(
            'planning', 'in_progress', 'completed', 'archived',
            name='projectstatus',
            create_type=True
        )
        project_status_enum.create(conn)

    # Create projects table (use checkfirst for table creation)
    # Note: We need to reference the enum by name since it may already exist
    project_status_enum = postgresql.ENUM(
        'planning', 'in_progress', 'completed', 'archived',
        name='projectstatus',
        create_type=False
    )

    op.create_table(
        'projects',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', project_status_enum, nullable=False, server_default='planning'),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('budget', sa.Numeric(precision=15, scale=2), nullable=False, server_default='0'),
        sa.Column('spent', sa.Numeric(precision=15, scale=2), nullable=False, server_default='0'),
        sa.Column('owner_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for projects table
    op.create_index('ix_projects_id', 'projects', ['id'])
    op.create_index('ix_projects_name', 'projects', ['name'])
    op.create_index('ix_projects_status', 'projects', ['status'])
    op.create_index('ix_projects_end_date', 'projects', ['end_date'])
    op.create_index('ix_projects_owner_id', 'projects', ['owner_id'])

    # Create project_members table
    op.create_table(
        'project_members',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=True),
        sa.Column('assigned_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id', 'user_id', name='uq_project_member')
    )

    # Create indexes for project_members table
    op.create_index('ix_project_members_project_id', 'project_members', ['project_id'])
    op.create_index('ix_project_members_user_id', 'project_members', ['user_id'])

    # Create document_links table
    op.create_table(
        'document_links',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('url', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_by_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for document_links table
    op.create_index('ix_document_links_project_id', 'document_links', ['project_id'])


def downgrade() -> None:
    # Drop document_links table
    op.drop_index('ix_document_links_project_id', table_name='document_links')
    op.drop_table('document_links')

    # Drop project_members table
    op.drop_index('ix_project_members_user_id', table_name='project_members')
    op.drop_index('ix_project_members_project_id', table_name='project_members')
    op.drop_table('project_members')

    # Drop projects table
    op.drop_index('ix_projects_owner_id', table_name='projects')
    op.drop_index('ix_projects_end_date', table_name='projects')
    op.drop_index('ix_projects_status', table_name='projects')
    op.drop_index('ix_projects_name', table_name='projects')
    op.drop_index('ix_projects_id', table_name='projects')
    op.drop_table('projects')

    # Drop project_status enum type
    project_status_enum = postgresql.ENUM(
        'planning', 'in_progress', 'completed', 'archived',
        name='projectstatus'
    )
    project_status_enum.drop(op.get_bind(), checkfirst=True)
