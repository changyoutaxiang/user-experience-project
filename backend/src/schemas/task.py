"""
Pydantic schemas for task-related operations.
"""
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from ..models.task import TaskPriority, TaskStatus
from .user import UserResponse

# ========== Task Schemas ==========


class TaskBase(BaseModel):
    """Base schema for task data."""

    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[date] = None
    assignee_id: Optional[UUID] = None


class TaskCreate(TaskBase):
    """Schema for creating a new task."""

    project_id: UUID


class TaskUpdate(BaseModel):
    """Schema for updating a task (all fields optional)."""

    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[date] = None
    assignee_id: Optional[UUID] = None


class TaskResponse(TaskBase):
    """Schema for task response."""

    id: UUID
    project_id: UUID
    assignee: Optional[UserResponse] = None
    created_by_id: Optional[UUID]
    is_overdue: bool = False
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskListItem(BaseModel):
    """Simplified schema for task list display."""

    id: UUID
    name: str
    status: TaskStatus
    priority: TaskPriority
    project_id: UUID
    project_name: str  # Computed from project.name
    assignee_id: Optional[UUID]
    assignee_name: Optional[str]  # Computed from assignee.name
    due_date: Optional[date]
    is_overdue: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class TaskWithProject(TaskResponse):
    """Task response with project information."""

    project_name: str
    project_status: str

    class Config:
        from_attributes = True


# ========== Task Statistics ==========


class TaskStats(BaseModel):
    """Task statistics for a project or user."""

    total: int = 0
    todo: int = 0
    in_progress: int = 0
    in_review: int = 0
    completed: int = 0
    cancelled: int = 0
    overdue: int = 0


class MyTasksSummary(BaseModel):
    """Summary of tasks assigned to current user."""

    pending_tasks: int  # TODO + IN_PROGRESS + IN_REVIEW
    overdue_tasks: int
    completed_this_week: int
    tasks_by_priority: dict  # e.g., {"low": 2, "medium": 5, "high": 3, "urgent": 1}
