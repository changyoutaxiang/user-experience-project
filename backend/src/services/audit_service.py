"""Audit logging service for tracking user operations."""
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.audit_log import AuditLog


class AuditService:
    """Service for logging user operations."""

    @staticmethod
    async def log_action(
        db: AsyncSession,
        user_id: Optional[UUID],
        action_type: str,
        resource_type: str,
        resource_id: Optional[UUID] = None,
        resource_name: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        """
        Log a user action to the audit log.

        Args:
            db: Database session
            user_id: ID of the user performing the action
            action_type: Type of action (e.g., 'create_project', 'edit_task')
            resource_type: Type of resource (e.g., 'project', 'task', 'user')
            resource_id: ID of the affected resource
            resource_name: Name of the affected resource (for quick reference)
            details: Additional details as JSON
            ip_address: IP address of the request

        Returns:
            Created AuditLog instance
        """
        audit_log = AuditLog(
            user_id=user_id,
            action_type=action_type,
            resource_type=resource_type,
            resource_id=resource_id,
            resource_name=resource_name,
            details=details,
            ip_address=ip_address,
        )

        db.add(audit_log)
        await db.flush()
        return audit_log

    @staticmethod
    async def list_audit_logs(
        db: AsyncSession,
        user_id: Optional[UUID] = None,
        action_type: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[UUID] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[AuditLog], int]:
        """
        List audit logs with optional filtering.

        Args:
            db: Database session
            user_id: Filter by user ID
            action_type: Filter by action type
            resource_type: Filter by resource type
            resource_id: Filter by specific resource ID
            start_date: Filter logs after this date
            end_date: Filter logs before this date
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return

        Returns:
            Tuple of (list of AuditLog objects, total count)
        """
        # Build query with filters
        query = select(AuditLog)

        if user_id is not None:
            query = query.where(AuditLog.user_id == user_id)
        if action_type is not None:
            query = query.where(AuditLog.action_type == action_type)
        if resource_type is not None:
            query = query.where(AuditLog.resource_type == resource_type)
        if resource_id is not None:
            query = query.where(AuditLog.resource_id == resource_id)
        if start_date is not None:
            query = query.where(AuditLog.timestamp >= start_date)
        if end_date is not None:
            query = query.where(AuditLog.timestamp <= end_date)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply ordering and pagination
        query = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit)

        result = await db.execute(query)
        logs = list(result.scalars().all())

        return logs, total
