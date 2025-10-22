"""add_performance_indexes

Revision ID: 0afdeea0b71c
Revises: 20251022_004
Create Date: 2025-10-22 13:34:31.057311

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0afdeea0b71c'
down_revision = '20251022_004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add performance indexes for common query patterns."""

    # Users table indexes
    op.create_index('ix_users_is_active', 'users', ['is_active'])
    op.create_index('ix_users_role', 'users', ['role'])

    # Projects table indexes
    op.create_index('ix_projects_status', 'projects', ['status'])
    op.create_index('ix_projects_owner_id', 'projects', ['owner_id'])
    op.create_index('ix_projects_created_at', 'projects', ['created_at'])
    op.create_index('ix_projects_start_date', 'projects', ['start_date'])
    op.create_index('ix_projects_end_date', 'projects', ['end_date'])
    # Composite index for filtering active projects by status
    op.create_index('ix_projects_status_created_at', 'projects', ['status', 'created_at'])

    # Tasks table indexes
    op.create_index('ix_tasks_project_id', 'tasks', ['project_id'])
    op.create_index('ix_tasks_assignee_id', 'tasks', ['assignee_id'])
    op.create_index('ix_tasks_created_by_id', 'tasks', ['created_by_id'])
    op.create_index('ix_tasks_status', 'tasks', ['status'])
    op.create_index('ix_tasks_priority', 'tasks', ['priority'])
    op.create_index('ix_tasks_due_date', 'tasks', ['due_date'])
    op.create_index('ix_tasks_created_at', 'tasks', ['created_at'])
    # Composite indexes for common query patterns
    op.create_index('ix_tasks_assignee_status', 'tasks', ['assignee_id', 'status'])
    op.create_index('ix_tasks_project_status', 'tasks', ['project_id', 'status'])
    op.create_index('ix_tasks_status_priority', 'tasks', ['status', 'priority'])

    # Expenses table indexes
    op.create_index('ix_expenses_project_id', 'expenses', ['project_id'])
    op.create_index('ix_expenses_created_by_id', 'expenses', ['created_by_id'])
    op.create_index('ix_expenses_created_at', 'expenses', ['created_at'])
    op.create_index('ix_expenses_category', 'expenses', ['category'])
    # Composite index for project expense queries
    op.create_index('ix_expenses_project_created', 'expenses', ['project_id', 'created_at'])

    # Project Members table indexes
    op.create_index('ix_project_members_user_id', 'project_members', ['user_id'])
    op.create_index('ix_project_members_project_id', 'project_members', ['project_id'])
    op.create_index('ix_project_members_joined_at', 'project_members', ['joined_at'])
    # Composite index for user's projects
    op.create_index('ix_project_members_user_joined', 'project_members', ['user_id', 'joined_at'])

    # Document Links table indexes
    op.create_index('ix_document_links_project_id', 'document_links', ['project_id'])
    op.create_index('ix_document_links_created_by_id', 'document_links', ['created_by_id'])
    op.create_index('ix_document_links_created_at', 'document_links', ['created_at'])

    # Audit Logs table indexes (critical for performance on large datasets)
    op.create_index('ix_audit_logs_user_id', 'audit_logs', ['user_id'])
    op.create_index('ix_audit_logs_action_type', 'audit_logs', ['action_type'])
    op.create_index('ix_audit_logs_resource_type', 'audit_logs', ['resource_type'])
    op.create_index('ix_audit_logs_resource_id', 'audit_logs', ['resource_id'])
    op.create_index('ix_audit_logs_created_at', 'audit_logs', ['created_at'])
    # Composite indexes for common audit log queries
    op.create_index('ix_audit_logs_user_created', 'audit_logs', ['user_id', 'created_at'])
    op.create_index('ix_audit_logs_resource_type_id', 'audit_logs', ['resource_type', 'resource_id'])
    op.create_index('ix_audit_logs_action_created', 'audit_logs', ['action_type', 'created_at'])


def downgrade() -> None:
    """Remove performance indexes."""

    # Audit Logs indexes
    op.drop_index('ix_audit_logs_action_created', 'audit_logs')
    op.drop_index('ix_audit_logs_resource_type_id', 'audit_logs')
    op.drop_index('ix_audit_logs_user_created', 'audit_logs')
    op.drop_index('ix_audit_logs_created_at', 'audit_logs')
    op.drop_index('ix_audit_logs_resource_id', 'audit_logs')
    op.drop_index('ix_audit_logs_resource_type', 'audit_logs')
    op.drop_index('ix_audit_logs_action_type', 'audit_logs')
    op.drop_index('ix_audit_logs_user_id', 'audit_logs')

    # Document Links indexes
    op.drop_index('ix_document_links_created_at', 'document_links')
    op.drop_index('ix_document_links_created_by_id', 'document_links')
    op.drop_index('ix_document_links_project_id', 'document_links')

    # Project Members indexes
    op.drop_index('ix_project_members_user_joined', 'project_members')
    op.drop_index('ix_project_members_joined_at', 'project_members')
    op.drop_index('ix_project_members_project_id', 'project_members')
    op.drop_index('ix_project_members_user_id', 'project_members')

    # Expenses indexes
    op.drop_index('ix_expenses_project_created', 'expenses')
    op.drop_index('ix_expenses_category', 'expenses')
    op.drop_index('ix_expenses_created_at', 'expenses')
    op.drop_index('ix_expenses_created_by_id', 'expenses')
    op.drop_index('ix_expenses_project_id', 'expenses')

    # Tasks indexes
    op.drop_index('ix_tasks_status_priority', 'tasks')
    op.drop_index('ix_tasks_project_status', 'tasks')
    op.drop_index('ix_tasks_assignee_status', 'tasks')
    op.drop_index('ix_tasks_created_at', 'tasks')
    op.drop_index('ix_tasks_due_date', 'tasks')
    op.drop_index('ix_tasks_priority', 'tasks')
    op.drop_index('ix_tasks_status', 'tasks')
    op.drop_index('ix_tasks_created_by_id', 'tasks')
    op.drop_index('ix_tasks_assignee_id', 'tasks')
    op.drop_index('ix_tasks_project_id', 'tasks')

    # Projects indexes
    op.drop_index('ix_projects_status_created_at', 'projects')
    op.drop_index('ix_projects_end_date', 'projects')
    op.drop_index('ix_projects_start_date', 'projects')
    op.drop_index('ix_projects_created_at', 'projects')
    op.drop_index('ix_projects_owner_id', 'projects')
    op.drop_index('ix_projects_status', 'projects')

    # Users indexes
    op.drop_index('ix_users_role', 'users')
    op.drop_index('ix_users_is_active', 'users')
