"""Dashboard service for aggregating project statistics."""
from datetime import date
from typing import Optional
from uuid import UUID

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.project import Project, ProjectStatus
from src.models.task import Task, TaskStatus
from src.schemas.dashboard import DashboardStats, ProjectStatusCount


class DashboardService:
    """Service for dashboard data aggregation."""

    @staticmethod
    async def get_dashboard_stats(
        db: AsyncSession, user_id: Optional[UUID] = None
    ) -> DashboardStats:
        """
        Get dashboard statistics from real project data.

        Args:
            db: Database session
            user_id: Optional user ID for filtering user-specific stats

        Returns:
            DashboardStats with aggregated metrics
        """
        # Total project count
        total_projects = await db.scalar(select(func.count(Project.id))) or 0

        # Count projects by status
        planning_count = (
            await db.scalar(
                select(func.count(Project.id)).where(Project.status == ProjectStatus.PLANNING)
            )
            or 0
        )
        in_progress_count = (
            await db.scalar(
                select(func.count(Project.id)).where(Project.status == ProjectStatus.IN_PROGRESS)
            )
            or 0
        )
        completed_count = (
            await db.scalar(
                select(func.count(Project.id)).where(Project.status == ProjectStatus.COMPLETED)
            )
            or 0
        )
        archived_count = (
            await db.scalar(
                select(func.count(Project.id)).where(Project.status == ProjectStatus.ARCHIVED)
            )
            or 0
        )

        projects_by_status = ProjectStatusCount(
            planning=planning_count,
            in_progress=in_progress_count,
            completed=completed_count,
            archived=archived_count,
        )

        # Budget calculations
        budget_result = await db.execute(
            select(
                func.coalesce(func.sum(Project.budget), 0).label("total_budget"),
                func.coalesce(func.sum(Project.spent), 0).label("total_spent"),
            )
        )
        budget_row = budget_result.first()
        total_budget = float(budget_row.total_budget) if budget_row else 0.0
        total_spent = float(budget_row.total_spent) if budget_row else 0.0
        budget_usage_rate = 0.0 if total_budget == 0 else (total_spent / total_budget) * 100

        # Overdue projects count
        today = date.today()
        overdue_projects = (
            await db.scalar(
                select(func.count(Project.id)).where(
                    and_(
                        Project.end_date < today,
                        Project.status.in_([ProjectStatus.PLANNING, ProjectStatus.IN_PROGRESS]),
                    )
                )
            )
            or 0
        )

        # Task-related stats
        total_tasks = await db.scalar(select(func.count(Task.id))) or 0

        overdue_tasks = (
            await db.scalar(
                select(func.count(Task.id)).where(
                    and_(
                        Task.due_date < today,
                        Task.status.in_(
                            [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW]
                        ),
                    )
                )
            )
            or 0
        )

        if user_id:
            my_pending_tasks = (
                await db.scalar(
                    select(func.count(Task.id)).where(
                        and_(
                            Task.assignee_id == user_id,
                            Task.status.in_(
                                [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW]
                            ),
                        )
                    )
                )
                or 0
            )
        else:
            my_pending_tasks = 0

        return DashboardStats(
            total_projects=total_projects,
            projects_by_status=projects_by_status,
            total_budget=total_budget,
            total_spent=total_spent,
            budget_usage_rate=budget_usage_rate,
            overdue_projects=overdue_projects,
            overdue_tasks=overdue_tasks,
            total_tasks=total_tasks,
            my_pending_tasks=my_pending_tasks,
        )
