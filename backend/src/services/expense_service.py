"""Expense service for budget tracking operations."""
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.expense import Expense
from src.models.project import Project
from src.schemas.expense import ExpenseCreate, ExpenseUpdate
from src.services.audit_service import AuditService


class ExpenseService:
    """Service for expense and budget tracking operations."""

    @staticmethod
    async def create_expense(
        db: AsyncSession,
        project_id: UUID,
        expense_data: ExpenseCreate,
        created_by_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ) -> Expense:
        """
        Create a new expense and update project spent amount.

        Args:
            db: Database session
            project_id: Project ID
            expense_data: Expense creation data
            created_by_id: User ID who created the expense
            ip_address: IP address of the request (for audit logging)

        Returns:
            Created Expense object
        """
        # Get project for audit log
        project_result = await db.execute(select(Project).where(Project.id == project_id))
        project = project_result.scalar_one_or_none()

        # Create expense
        expense = Expense(
            project_id=project_id,
            amount=expense_data.amount,
            description=expense_data.description,
            category=expense_data.category,
            recorded_at=expense_data.recorded_at or datetime.utcnow(),
            created_by_id=created_by_id,
        )

        db.add(expense)

        # Update project spent amount
        await ExpenseService._update_project_spent(db, project_id)

        # Audit log
        if project:
            await AuditService.log_action(
                db=db,
                user_id=created_by_id,
                action_type="create_expense",
                resource_type="expense",
                resource_id=expense.id,
                resource_name=expense.description[:50],  # Truncate long descriptions
                details={
                    "project_name": project.name,
                    "amount": str(expense.amount),
                    "category": expense.category,
                },
                ip_address=ip_address,
            )

        await db.commit()
        await db.refresh(expense)

        return expense

    @staticmethod
    async def list_expenses(
        db: AsyncSession,
        project_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Expense]:
        """
        List all expenses for a project.

        Args:
            db: Database session
            project_id: Project ID
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of Expense objects
        """
        query = (
            select(Expense)
            .where(Expense.project_id == project_id)
            .order_by(Expense.recorded_at.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_expense_by_id(db: AsyncSession, expense_id: UUID) -> Optional[Expense]:
        """
        Get an expense by ID.

        Args:
            db: Database session
            expense_id: Expense ID

        Returns:
            Expense object or None
        """
        result = await db.execute(select(Expense).where(Expense.id == expense_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def update_expense(
        db: AsyncSession,
        expense: Expense,
        expense_data: ExpenseUpdate,
        current_user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ) -> Expense:
        """
        Update an expense.

        Args:
            db: Database session
            expense: Expense object to update
            expense_data: Update data
            current_user_id: User ID who is updating the expense (for audit logging)
            ip_address: IP address of the request (for audit logging)

        Returns:
            Updated Expense object
        """
        project_id = expense.project_id

        # Get project for audit log
        project_result = await db.execute(select(Project).where(Project.id == project_id))
        project = project_result.scalar_one_or_none()

        # Track updated fields
        updated_fields = []

        # Update fields
        if expense_data.amount is not None:
            expense.amount = expense_data.amount
            updated_fields.append("amount")
        if expense_data.description is not None:
            expense.description = expense_data.description
            updated_fields.append("description")
        if expense_data.category is not None:
            expense.category = expense_data.category
            updated_fields.append("category")
        if expense_data.recorded_at is not None:
            expense.recorded_at = expense_data.recorded_at
            updated_fields.append("recorded_at")

        expense.updated_at = datetime.utcnow()

        # Update project spent amount
        await ExpenseService._update_project_spent(db, project_id)

        # Audit log
        if project:
            await AuditService.log_action(
                db=db,
                user_id=current_user_id,
                action_type="update_expense",
                resource_type="expense",
                resource_id=expense.id,
                resource_name=expense.description[:50],
                details={
                    "project_name": project.name,
                    "updated_fields": updated_fields,
                },
                ip_address=ip_address,
            )

        await db.commit()
        await db.refresh(expense)

        return expense

    @staticmethod
    async def delete_expense(
        db: AsyncSession,
        expense: Expense,
        current_user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ) -> None:
        """
        Delete an expense.

        Args:
            db: Database session
            expense: Expense object to delete
            current_user_id: User ID who is deleting the expense (for audit logging)
            ip_address: IP address of the request (for audit logging)
        """
        project_id = expense.project_id
        expense_id = expense.id
        expense_description = expense.description

        # Get project for audit log
        project_result = await db.execute(select(Project).where(Project.id == project_id))
        project = project_result.scalar_one_or_none()

        await db.delete(expense)

        # Update project spent amount
        await ExpenseService._update_project_spent(db, project_id)

        # Audit log
        if project:
            await AuditService.log_action(
                db=db,
                user_id=current_user_id,
                action_type="delete_expense",
                resource_type="expense",
                resource_id=expense_id,
                resource_name=expense_description[:50],
                details={"project_name": project.name},
                ip_address=ip_address,
            )

        await db.commit()

    @staticmethod
    async def _update_project_spent(db: AsyncSession, project_id: UUID) -> None:
        """
        Recalculate and update project spent amount based on expenses.

        Args:
            db: Database session
            project_id: Project ID
        """
        # Calculate total expenses
        result = await db.execute(
            select(func.sum(Expense.amount)).where(Expense.project_id == project_id)
        )
        total_spent = result.scalar() or Decimal("0")

        # Update project
        project_result = await db.execute(select(Project).where(Project.id == project_id))
        project = project_result.scalar_one_or_none()

        if project:
            project.spent = total_spent
            project.updated_at = datetime.utcnow()

    @staticmethod
    async def get_project_budget_summary(db: AsyncSession, project_id: UUID) -> dict:
        """
        Get budget summary for a project.

        Args:
            db: Database session
            project_id: Project ID

        Returns:
            Dictionary with budget summary
        """
        # Get project
        result = await db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()

        if not project:
            return None

        # Count expenses
        expense_count_result = await db.execute(
            select(func.count(Expense.id)).where(Expense.project_id == project_id)
        )
        expense_count = expense_count_result.scalar() or 0

        budget = project.budget
        spent = project.spent
        remaining = budget - spent
        usage_percentage = float((spent / budget * 100) if budget > 0 else 0)
        is_over_budget = spent > budget

        return {
            "project_id": project_id,
            "budget": budget,
            "spent": spent,
            "remaining": remaining,
            "usage_percentage": usage_percentage,
            "is_over_budget": is_over_budget,
            "expense_count": expense_count,
        }
