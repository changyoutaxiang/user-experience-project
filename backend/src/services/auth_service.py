"""Authentication service."""
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import create_access_token, verify_password
from src.models.user import User


class AuthService:
    """Service for handling authentication operations."""

    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
        """Authenticate a user by email and password."""
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    @staticmethod
    def create_user_token(user: User) -> str:
        """Create access token for a user."""
        access_token = create_access_token(data={"sub": user.email})
        return access_token
