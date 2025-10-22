"""User Pydantic schemas."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from src.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema with common fields."""

    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating a new user."""

    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.MEMBER


class UserUpdate(BaseModel):
    """Schema for updating a user."""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[UserRole] = None


class UserResponse(UserBase):
    """Schema for user response."""

    id: UUID
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for authentication token response."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Schema for token payload data."""

    email: Optional[str] = None
