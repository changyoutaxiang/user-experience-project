"""User service for user management operations."""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import get_password_hash
from src.models.user import User, UserRole
from src.schemas.user import UserCreate, UserUpdate
from src.services.audit_service import AuditService


class UserService:
    """Service for user management operations."""

    @staticmethod
    async def list_users(
        db: AsyncSession,
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[User]:
        """
        List users with optional filters.

        Args:
            db: Database session
            is_active: Filter by active status
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of User objects
        """
        query = select(User)

        if is_active is not None:
            query = query.where(User.is_active == is_active)

        query = query.offset(skip).limit(limit).order_by(User.name)

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
        """
        Get a user by ID.

        Args:
            db: Database session
            user_id: User ID

        Returns:
            User object or None
        """
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """
        Get a user by email address.

        Args:
            db: Database session
            email: User email

        Returns:
            User object or None
        """
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user(
        db: AsyncSession,
        user_data: UserCreate,
        created_by_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ) -> User:
        """
        Create a new user.

        Args:
            db: Database session
            user_data: User creation data
            created_by_id: ID of the admin creating the user (for audit logging)
            ip_address: IP address of the request (for audit logging)

        Returns:
            Created User object

        Raises:
            HTTPException: If email already exists
        """
        # Check if email already exists
        existing_user = await UserService.get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
            )

        # Create user with hashed password
        user = User(
            name=user_data.name,
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            role=user_data.role,
            is_active=True,
        )

        db.add(user)
        await db.flush()

        # Audit log
        await AuditService.log_action(
            db=db,
            user_id=created_by_id,
            action_type="create_user",
            resource_type="user",
            resource_id=user.id,
            resource_name=user.name,
            details={"email": user.email, "role": user.role.value},
            ip_address=ip_address,
        )

        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def update_user(
        db: AsyncSession,
        user_id: UUID,
        user_data: UserUpdate,
        updated_by_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ) -> User:
        """
        Update a user's information.

        Args:
            db: Database session
            user_id: User ID to update
            user_data: User update data
            updated_by_id: ID of the admin updating the user (for audit logging)
            ip_address: IP address of the request (for audit logging)

        Returns:
            Updated User object

        Raises:
            HTTPException: If user not found
        """
        user = await UserService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Track updated fields
        updated_fields = []

        # Update only provided fields
        if user_data.name is not None:
            user.name = user_data.name
            updated_fields.append("name")
        if user_data.role is not None:
            user.role = user_data.role
            updated_fields.append("role")

        user.updated_at = datetime.utcnow()

        # Audit log
        await AuditService.log_action(
            db=db,
            user_id=updated_by_id,
            action_type="update_user",
            resource_type="user",
            resource_id=user.id,
            resource_name=user.name,
            details={"updated_fields": updated_fields},
            ip_address=ip_address,
        )

        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def delete_user(
        db: AsyncSession,
        user_id: UUID,
        deleted_by_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ) -> User:
        """
        Soft-delete a user by setting is_active to False.

        Args:
            db: Database session
            user_id: User ID to delete
            deleted_by_id: ID of the admin deleting the user (for audit logging)
            ip_address: IP address of the request (for audit logging)

        Returns:
            Deleted User object

        Raises:
            HTTPException: If user not found
        """
        user = await UserService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        user.is_active = False
        user.updated_at = datetime.utcnow()

        # Audit log
        await AuditService.log_action(
            db=db,
            user_id=deleted_by_id,
            action_type="delete_user",
            resource_type="user",
            resource_id=user.id,
            resource_name=user.name,
            details={"email": user.email},
            ip_address=ip_address,
        )

        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def update_user_role(
        db: AsyncSession,
        user_id: UUID,
        new_role: UserRole,
        updated_by_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ) -> User:
        """
        Update a user's role.

        Args:
            db: Database session
            user_id: User ID
            new_role: New role to assign
            updated_by_id: ID of the admin updating the role (for audit logging)
            ip_address: IP address of the request (for audit logging)

        Returns:
            Updated User object

        Raises:
            HTTPException: If user not found
        """
        user = await UserService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        old_role = user.role
        user.role = new_role
        user.updated_at = datetime.utcnow()

        # Audit log
        await AuditService.log_action(
            db=db,
            user_id=updated_by_id,
            action_type="update_user_role",
            resource_type="user",
            resource_id=user.id,
            resource_name=user.name,
            details={"old_role": old_role.value, "new_role": new_role.value},
            ip_address=ip_address,
        )

        await db.commit()
        await db.refresh(user)
        return user
