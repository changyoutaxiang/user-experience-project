"""
Pydantic schemas for expense-related operations.
"""
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

# ========== Expense Schemas ==========


class ExpenseBase(BaseModel):
    """Base schema for expense data."""

    amount: Decimal = Field(..., gt=0, description="Expense amount (must be positive)")
    description: str = Field(..., min_length=1, max_length=500)
    category: Optional[str] = Field(None, max_length=100)
    recorded_at: Optional[date] = Field(None, description="Date when expense was recorded")


class ExpenseCreate(ExpenseBase):
    """Schema for creating a new expense."""

    pass


class ExpenseUpdate(BaseModel):
    """Schema for updating an expense (all fields optional)."""

    amount: Optional[Decimal] = Field(None, gt=0)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    category: Optional[str] = Field(None, max_length=100)
    recorded_at: Optional[date] = None


class ExpenseResponse(ExpenseBase):
    """Schema for expense response."""

    id: UUID
    project_id: UUID
    created_by_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== Budget Summary Schemas ==========


class BudgetSummary(BaseModel):
    """Summary of budget and expenses for a project."""

    project_id: UUID
    budget: Decimal
    spent: Decimal
    remaining: Decimal
    usage_percentage: float
    is_over_budget: bool
    expense_count: int

    class Config:
        from_attributes = True
