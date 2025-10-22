"""Audit log API routes."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_admin_user, get_db
from src.models.user import User
from src.schemas.audit_log import AuditLogListResponse, AuditLogResponse
from src.services.audit_service import AuditService

router = APIRouter()


@router.get("/", response_model=AuditLogListResponse)
async def list_audit_logs(
    user_id: Optional[UUID] = Query(None, description="Filter by user ID"),
    action_type: Optional[str] = Query(None, description="Filter by action type"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    resource_id: Optional[UUID] = Query(None, description="Filter by resource ID"),
    start_date: Optional[datetime] = Query(
        None, description="Filter logs after this date (ISO format)"
    ),
    end_date: Optional[datetime] = Query(
        None, description="Filter logs before this date (ISO format)"
    ),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List audit logs with optional filtering (admin only).

    Supports filtering by:
    - **user_id**: User who performed the action
    - **action_type**: Type of action (e.g., 'create_project', 'delete_task')
    - **resource_type**: Type of resource (e.g., 'project', 'task', 'user')
    - **resource_id**: Specific resource ID
    - **start_date**: Logs after this date
    - **end_date**: Logs before this date

    Results are paginated and ordered by timestamp (newest first).
    """
    logs, total = await AuditService.list_audit_logs(
        db=db,
        user_id=user_id,
        action_type=action_type,
        resource_type=resource_type,
        resource_id=resource_id,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit,
    )

    return AuditLogListResponse(
        total=total, items=[AuditLogResponse.model_validate(log) for log in logs]
    )
