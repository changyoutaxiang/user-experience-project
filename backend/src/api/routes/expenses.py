"""Expense API routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user, get_db
from src.models.user import User
from src.schemas.expense import BudgetSummary, ExpenseCreate, ExpenseResponse, ExpenseUpdate
from src.services.expense_service import ExpenseService
from src.services.project_service import ProjectService

router = APIRouter()


@router.post(
    "/projects/{project_id}/expenses",
    response_model=ExpenseResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_expense(
    project_id: UUID,
    expense_data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new expense for a project.

    - **project_id**: Project ID
    - **expense_data**: Expense creation data
    """
    # Verify project exists
    project = await ProjectService.get_project_by_id(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )

    expense = await ExpenseService.create_expense(
        db=db,
        project_id=project_id,
        expense_data=expense_data,
        created_by_id=current_user.id,
    )

    return expense


@router.get("/projects/{project_id}/expenses", response_model=List[ExpenseResponse])
async def list_project_expenses(
    project_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all expenses for a project.

    - **project_id**: Project ID
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    """
    # Verify project exists
    project = await ProjectService.get_project_by_id(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )

    expenses = await ExpenseService.list_expenses(
        db=db,
        project_id=project_id,
        skip=skip,
        limit=limit,
    )

    return expenses


@router.get("/projects/{project_id}/budget", response_model=BudgetSummary)
async def get_project_budget_summary(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get budget summary for a project.

    - **project_id**: Project ID
    """
    summary = await ExpenseService.get_project_budget_summary(
        db=db,
        project_id=project_id,
    )

    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )

    return summary


@router.get("/expenses/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a specific expense by ID.

    - **expense_id**: Expense ID
    """
    expense = await ExpenseService.get_expense_by_id(db=db, expense_id=expense_id)

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with id {expense_id} not found",
        )

    return expense


@router.patch("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: UUID,
    expense_data: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update an expense.

    - **expense_id**: Expense ID
    - **expense_data**: Fields to update
    """
    expense = await ExpenseService.get_expense_by_id(db=db, expense_id=expense_id)

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with id {expense_id} not found",
        )

    updated_expense = await ExpenseService.update_expense(
        db=db,
        expense=expense,
        expense_data=expense_data,
    )

    return updated_expense


@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete an expense.

    - **expense_id**: Expense ID
    """
    expense = await ExpenseService.get_expense_by_id(db=db, expense_id=expense_id)

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with id {expense_id} not found",
        )

    await ExpenseService.delete_expense(db=db, expense=expense)

    return None
