"""Dashboard API routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.user import User
from src.schemas.dashboard import DashboardStats
from src.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("/", response_model=DashboardStats)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get dashboard statistics.

    Returns aggregated metrics including:
    - Total projects and breakdown by status
    - Budget information (total budget, total spent, usage rate)
    - Overdue projects and tasks count
    - User's pending tasks count
    """
    stats = await DashboardService.get_dashboard_stats(db, current_user.id)
    return stats


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get dashboard statistics (alias endpoint).

    Same as GET / but provides an explicit /stats endpoint.
    """
    stats = await DashboardService.get_dashboard_stats(db, current_user.id)
    return stats
