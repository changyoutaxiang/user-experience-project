"""Authentication API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.user import User
from src.schemas.user import Token, UserCreate, UserResponse
from src.services.auth_service import AuthService
from src.services.user_service import UserService

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """
    Login endpoint.

    Authenticate user with email and password, return JWT access token.
    """
    user = await AuthService.authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    access_token = AuthService.create_user_token(user)

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """Get current authenticated user information."""
    return UserResponse.from_orm(current_user)


@router.post("/logout")
async def logout():
    """
    Logout endpoint.

    Note: JWT tokens are stateless, so logout is handled client-side
    by removing the token from storage.
    """
    return {"message": "Successfully logged out"}


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Public user registration endpoint.

    Creates a new user account with 'member' role.
    - **name**: User's full name
    - **email**: User's email address (must be unique)
    - **password**: User's password (min 8 characters)
    """
    # Force role to 'member' for public registration
    from src.models.user import UserRole
    user_data.role = UserRole.MEMBER

    # Create the user (UserService will check if email already exists)
    user = await UserService.create_user(db=db, user_data=user_data)
    return user
