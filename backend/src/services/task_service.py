"""
Service layer for task operations.
"""
from datetime import date, datetime, timedelta
from typing import List, Optional
from uuid import UUID

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.project import Project
from ..models.task import Task, TaskPriority, TaskStatus
from ..models.user import User
from ..schemas.task import MyTasksSummary, TaskCreate, TaskStats, TaskUpdate
from .audit_service import AuditService


class TaskService:
    """Service for managing tasks."""

    @staticmethod
    async def create_task(
        db: AsyncSession,
        task_data: TaskCreate,
        created_by_id: UUID,
        ip_address: Optional[str] = None,
    ) -> Task:
        """
        Create a new task.

        Args:
            db: Database session
            task_data: Task creation data
            created_by_id: ID of the user creating the task
            ip_address: IP address of the request (for audit logging)

        Returns:
            Created task instance
        """
        task = Task(
            name=task_data.name,
            description=task_data.description,
            status=task_data.status,
            priority=task_data.priority,
            project_id=task_data.project_id,
            assignee_id=task_data.assignee_id,
            due_date=task_data.due_date,
            created_by_id=created_by_id,
        )

        db.add(task)
        await db.flush()
        await db.refresh(task, ["assignee", "created_by", "project"])

        # Audit log
        await AuditService.log_action(
            db=db,
            user_id=created_by_id,
            action_type="create_task",
            resource_type="task",
            resource_id=task.id,
            resource_name=task.name,
            details={
                "project_name": task.project.name if task.project else None,
                "assignee_name": task.assignee.name if task.assignee else None,
                "priority": task.priority.value,
            },
            ip_address=ip_address,
        )

        return task

    @staticmethod
    async def get_task_by_id(db: AsyncSession, task_id: UUID) -> Optional[Task]:
        """
        Get a task by ID.

        Args:
            db: Database session
            task_id: Task ID

        Returns:
            Task instance or None if not found
        """
        query = (
            select(Task)
            .where(Task.id == task_id)
            .options(
                selectinload(Task.assignee),
                selectinload(Task.created_by),
                selectinload(Task.project),
            )
        )

        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_tasks(
        db: AsyncSession,
        project_id: Optional[UUID] = None,
        assignee_id: Optional[UUID] = None,
        status: Optional[TaskStatus] = None,
        priority: Optional[TaskPriority] = None,
        is_overdue: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Task]:
        """
        List tasks with optional filters.

        Args:
            db: Database session
            project_id: Filter by project ID
            assignee_id: Filter by assignee ID
            status: Filter by task status
            priority: Filter by task priority
            is_overdue: Filter by overdue status
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of tasks
        """
        query = select(Task).options(
            selectinload(Task.assignee),
            selectinload(Task.created_by),
            selectinload(Task.project),
        )

        # Apply filters
        if project_id:
            query = query.where(Task.project_id == project_id)
        if assignee_id:
            query = query.where(Task.assignee_id == assignee_id)
        if status:
            query = query.where(Task.status == status)
        if priority:
            query = query.where(Task.priority == priority)
        if is_overdue is not None:
            today = date.today()
            if is_overdue:
                query = query.where(
                    and_(
                        Task.due_date < today,
                        Task.status.in_(
                            [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW]
                        ),
                    )
                )
            else:
                query = query.where(
                    or_(
                        Task.due_date >= today,
                        Task.due_date.is_(None),
                        Task.status.in_([TaskStatus.COMPLETED, TaskStatus.CANCELLED]),
                    )
                )

        # Pagination and ordering
        query = query.offset(skip).limit(limit).order_by(Task.created_at.desc())

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_task(
        db: AsyncSession,
        task_id: UUID,
        task_data: TaskUpdate,
        current_user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ) -> Optional[Task]:
        """
        Update a task.

        Args:
            db: Database session
            task_id: Task ID
            task_data: Updated task data
            current_user_id: ID of the user updating the task (for audit logging)
            ip_address: IP address of the request (for audit logging)

        Returns:
            Updated task instance or None if not found
        """
        task = await TaskService.get_task_by_id(db, task_id)
        if not task:
            return None

        # Update fields that are provided
        update_data = task_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)

        # Mark completed_at when status changes to COMPLETED
        if task_data.status == TaskStatus.COMPLETED and task.completed_at is None:
            task.completed_at = datetime.utcnow()
        elif task_data.status and task_data.status != TaskStatus.COMPLETED:
            task.completed_at = None

        await db.flush()
        await db.refresh(task, ["assignee", "created_by", "project"])

        # Audit log
        await AuditService.log_action(
            db=db,
            user_id=current_user_id,
            action_type="update_task",
            resource_type="task",
            resource_id=task.id,
            resource_name=task.name,
            details={"updated_fields": list(update_data.keys())},
            ip_address=ip_address,
        )

        return task

    @staticmethod
    async def delete_task(
        db: AsyncSession,
        task_id: UUID,
        current_user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ) -> bool:
        """
        Delete a task.

        Args:
            db: Database session
            task_id: Task ID
            current_user_id: ID of the user deleting the task (for audit logging)
            ip_address: IP address of the request (for audit logging)

        Returns:
            True if deleted, False if not found
        """
        task = await TaskService.get_task_by_id(db, task_id)
        if not task:
            return False

        task_name = task.name
        project_name = task.project.name if task.project else None

        await db.delete(task)

        # Audit log
        await AuditService.log_action(
            db=db,
            user_id=current_user_id,
            action_type="delete_task",
            resource_type="task",
            resource_id=task_id,
            resource_name=task_name,
            details={"project_name": project_name},
            ip_address=ip_address,
        )

        return True

    # ========== Task Statistics ==========

    @staticmethod
    async def get_task_stats(
        db: AsyncSession,
        project_id: Optional[UUID] = None,
        assignee_id: Optional[UUID] = None,
    ) -> TaskStats:
        """
        Get task statistics.

        Args:
            db: Database session
            project_id: Optional project ID filter
            assignee_id: Optional assignee ID filter

        Returns:
            Task statistics
        """
        query = select(Task.status, func.count(Task.id))

        if project_id:
            query = query.where(Task.project_id == project_id)
        if assignee_id:
            query = query.where(Task.assignee_id == assignee_id)

        query = query.group_by(Task.status)

        result = await db.execute(query)
        rows = result.all()

        stats = TaskStats()
        for status, count in rows:
            stats.total += count
            if status == TaskStatus.TODO:
                stats.todo = count
            elif status == TaskStatus.IN_PROGRESS:
                stats.in_progress = count
            elif status == TaskStatus.IN_REVIEW:
                stats.in_review = count
            elif status == TaskStatus.COMPLETED:
                stats.completed = count
            elif status == TaskStatus.CANCELLED:
                stats.cancelled = count

        # Count overdue tasks
        today = date.today()
        overdue_query = select(func.count(Task.id)).where(
            and_(
                Task.due_date < today,
                Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW]),
            )
        )
        if project_id:
            overdue_query = overdue_query.where(Task.project_id == project_id)
        if assignee_id:
            overdue_query = overdue_query.where(Task.assignee_id == assignee_id)

        stats.overdue = await db.scalar(overdue_query) or 0

        return stats

    @staticmethod
    async def get_my_tasks_summary(db: AsyncSession, user_id: UUID) -> MyTasksSummary:
        """
        Get summary of tasks assigned to a user.

        Args:
            db: Database session
            user_id: User ID

        Returns:
            My tasks summary
        """
        # Pending tasks count
        pending_query = select(func.count(Task.id)).where(
            and_(
                Task.assignee_id == user_id,
                Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW]),
            )
        )
        pending_tasks = await db.scalar(pending_query) or 0

        # Overdue tasks count
        today = date.today()
        overdue_query = select(func.count(Task.id)).where(
            and_(
                Task.assignee_id == user_id,
                Task.due_date < today,
                Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW]),
            )
        )
        overdue_tasks = await db.scalar(overdue_query) or 0

        # Completed this week
        week_start = date.today() - timedelta(days=date.today().weekday())
        completed_query = select(func.count(Task.id)).where(
            and_(
                Task.assignee_id == user_id,
                Task.status == TaskStatus.COMPLETED,
                Task.completed_at >= datetime.combine(week_start, datetime.min.time()),
            )
        )
        completed_this_week = await db.scalar(completed_query) or 0

        # Tasks by priority (for pending tasks only)
        priority_query = (
            select(Task.priority, func.count(Task.id))
            .where(
                and_(
                    Task.assignee_id == user_id,
                    Task.status.in_(
                        [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW]
                    ),
                )
            )
            .group_by(Task.priority)
        )
        result = await db.execute(priority_query)
        tasks_by_priority = {priority.value: count for priority, count in result.all()}

        return MyTasksSummary(
            pending_tasks=pending_tasks,
            overdue_tasks=overdue_tasks,
            completed_this_week=completed_this_week,
            tasks_by_priority=tasks_by_priority,
        )

    @staticmethod
    async def count_overdue_tasks(db: AsyncSession) -> int:
        """
        Count total overdue tasks.

        Returns:
            Number of overdue tasks
        """
        today = date.today()
        query = select(func.count(Task.id)).where(
            and_(
                Task.due_date < today,
                Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW]),
            )
        )

        result = await db.execute(query)
        return result.scalar() or 0
