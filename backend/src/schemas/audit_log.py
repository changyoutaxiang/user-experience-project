"""AuditLog Pydantic schemas."""
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel


class AuditLogBase(BaseModel):
    """Base audit log schema."""

    action_type: str
    resource_type: str
    resource_id: Optional[UUID] = None
    resource_name: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class AuditLogResponse(AuditLogBase):
    """Schema for audit log response."""

    id: UUID
    user_id: Optional[UUID] = None
    timestamp: datetime
    ip_address: Optional[str] = None

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    """Schema for paginated audit log list response."""

    total: int
    items: list[AuditLogResponse]

    class Config:
        from_attributes = True
