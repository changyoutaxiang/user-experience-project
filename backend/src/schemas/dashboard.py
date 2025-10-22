"""Dashboard Pydantic schemas."""
from typing import Dict

from pydantic import BaseModel


class ProjectStatusCount(BaseModel):
    """Project count by status."""

    planning: int = 0
    in_progress: int = 0
    completed: int = 0
    archived: int = 0


class DashboardStats(BaseModel):
    """Dashboard statistics response."""

    total_projects: int
    projects_by_status: ProjectStatusCount
    total_budget: float
    total_spent: float
    budget_usage_rate: float
    overdue_projects: int
    overdue_tasks: int
    total_tasks: int
    my_pending_tasks: int

    class Config:
        from_attributes = True


class ProjectsSummary(BaseModel):
    """Summary of projects for dashboard."""

    id: str
    name: str
    status: str
    budget_usage_rate: float
    is_overdue: bool
    is_over_budget: bool

    class Config:
        from_attributes = True
