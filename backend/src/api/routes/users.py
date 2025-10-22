"""User API routes."""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_admin_user, get_current_user, get_db
from src.models.user import User, UserRole
from src.schemas.user import UserCreate, UserResponse, UserUpdate
from src.services.user_service import UserService

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def list_users(
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all users.

    - **is_active**: Filter by active status (optional)
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    """
    users = await UserService.list_users(
        db=db,
        is_active=is_active,
        skip=skip,
        limit=limit,
    )
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a specific user by ID.
    """
    user = await UserService.get_user_by_id(db=db, user_id=user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )

    return user


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new user (admin only).

    - **name**: User's full name
    - **email**: User's email address (must be unique)
    - **password**: User's password (min 8 characters)
    - **role**: User role (admin or member, defaults to member)
    """
    user = await UserService.create_user(db=db, user_data=user_data)
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update a user's information (admin only).

    - **name**: User's full name (optional)
    - **role**: User role (optional)
    """
    user = await UserService.update_user(db=db, user_id=user_id, user_data=user_data)
    return user


@router.delete("/{user_id}", response_model=UserResponse)
async def delete_user(
    user_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Soft-delete a user by setting is_active to False (admin only).
    """
    user = await UserService.delete_user(db=db, user_id=user_id)
    return user


@router.patch("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: UUID,
    new_role: UserRole,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update a user's role (admin only).

    - **new_role**: New role to assign (admin or member)
    """
    user = await UserService.update_user_role(db=db, user_id=user_id, new_role=new_role)
    return user
