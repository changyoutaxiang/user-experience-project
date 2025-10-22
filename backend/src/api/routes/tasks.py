"""
API routes for task operations.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.task import TaskPriority, TaskStatus
from ...models.user import User
from ...schemas.task import MyTasksSummary, TaskCreate, TaskResponse, TaskStats, TaskUpdate
from ...services.audit_service import AuditService
from ...services.task_service import TaskService
from ..deps import get_current_user

router = APIRouter()


# ========== Task CRUD Endpoints ==========


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new task.
    """
    task = await TaskService.create_task(db, task_data, current_user.id)

    # Log the action
    await AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action_type="CREATE",
        resource_type="task",
        resource_id=task.id,
        resource_name=task.name,
        details={"project_id": str(task.project_id), "status": task.status.value},
    )

    return task


@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    project_id: Optional[UUID] = Query(None, description="Filter by project ID"),
    assignee_id: Optional[UUID] = Query(None, description="Filter by assignee ID"),
    status: Optional[TaskStatus] = Query(None, description="Filter by task status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    is_overdue: Optional[bool] = Query(None, description="Filter by overdue status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List tasks with optional filters.
    """
    tasks = await TaskService.list_tasks(
        db=db,
        project_id=project_id,
        assignee_id=assignee_id,
        status=status,
        priority=priority,
        is_overdue=is_overdue,
        skip=skip,
        limit=limit,
    )
    return tasks


@router.get("/my-tasks", response_model=List[TaskResponse])
async def get_my_tasks(
    status: Optional[TaskStatus] = Query(None, description="Filter by task status"),
    is_overdue: Optional[bool] = Query(None, description="Filter by overdue status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get tasks assigned to the current user.
    """
    tasks = await TaskService.list_tasks(
        db=db,
        assignee_id=current_user.id,
        status=status,
        is_overdue=is_overdue,
    )
    return tasks


@router.get("/my-tasks/summary", response_model=MyTasksSummary)
async def get_my_tasks_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get summary statistics for tasks assigned to current user.
    """
    summary = await TaskService.get_my_tasks_summary(db, current_user.id)
    return summary


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a task by ID.
    """
    task = await TaskService.get_task_by_id(db, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Task {task_id} not found"
        )

    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update a task.
    """
    task = await TaskService.update_task(db, task_id, task_data)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Task {task_id} not found"
        )

    # Log the action
    await AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action_type="UPDATE",
        resource_type="task",
        resource_id=task.id,
        resource_name=task.name,
        details=task_data.model_dump(exclude_unset=True),
    )

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a task.
    """
    # Get task name before deletion for audit log
    task = await TaskService.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Task {task_id} not found"
        )

    task_name = task.name
    success = await TaskService.delete_task(db, task_id)

    # Log the action
    await AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action_type="DELETE",
        resource_type="task",
        resource_id=task_id,
        resource_name=task_name,
    )

    return None


# ========== Task Statistics Endpoints ==========


@router.get("/projects/{project_id}/stats", response_model=TaskStats)
async def get_project_task_stats(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get task statistics for a specific project.
    """
    stats = await TaskService.get_task_stats(db, project_id=project_id)
    return stats
