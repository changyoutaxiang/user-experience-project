"""
Pydantic schemas for project-related operations.
"""
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from ..models.project import ProjectStatus
from .user import UserResponse

# ========== Project Schemas ==========


class ProjectBase(BaseModel):
    """Base schema for project data."""

    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.PLANNING
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Decimal = Field(default=Decimal("0"), ge=0)

    @field_validator("end_date")
    @classmethod
    def validate_dates(cls, v, info):
        """Ensure end_date is after start_date."""
        if v and info.data.get("start_date") and v < info.data["start_date"]:
            raise ValueError("end_date must be after start_date")
        return v


class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""

    owner_id: Optional[UUID] = None  # If not provided, will use current user


class ProjectUpdate(BaseModel):
    """Schema for updating a project (all fields optional)."""

    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[Decimal] = Field(None, ge=0)
    spent: Optional[Decimal] = Field(None, ge=0)

    @field_validator("end_date")
    @classmethod
    def validate_dates(cls, v, info):
        """Ensure end_date is after start_date."""
        if v and info.data.get("start_date") and v < info.data["start_date"]:
            raise ValueError("end_date must be after start_date")
        return v


class ProjectResponse(ProjectBase):
    """Schema for project response."""

    id: UUID
    spent: Decimal
    owner_id: UUID
    owner: UserResponse
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListItem(BaseModel):
    """Simplified schema for project list display."""

    id: UUID
    name: str
    status: ProjectStatus
    start_date: Optional[date]
    end_date: Optional[date]
    budget: Decimal
    spent: Decimal
    owner_id: UUID
    owner_name: str  # Computed from owner.name
    member_count: int = 0  # Count of project members
    task_count: int = 0  # Count of tasks (will be used in Phase 5)
    created_at: datetime

    class Config:
        from_attributes = True


# ========== ProjectMember Schemas ==========


class ProjectMemberAdd(BaseModel):
    """Schema for adding a member to a project."""

    user_id: UUID
    role: Optional[str] = Field(None, max_length=50)


class ProjectMemberUpdate(BaseModel):
    """Schema for updating a project member's role."""

    role: Optional[str] = Field(None, max_length=50)


class ProjectMemberResponse(BaseModel):
    """Schema for project member response."""

    id: UUID
    project_id: UUID
    user_id: UUID
    user: UserResponse
    role: Optional[str]
    assigned_at: datetime

    class Config:
        from_attributes = True


# ========== DocumentLink Schemas ==========


class DocumentLinkCreate(BaseModel):
    """Schema for creating a document link."""

    title: str = Field(..., min_length=1, max_length=200)
    url: str = Field(..., min_length=1)
    description: Optional[str] = None

    @field_validator("url")
    @classmethod
    def validate_feishu_url(cls, v):
        """Validate that the URL is a valid Feishu document URL."""
        from ..utils.validators import is_valid_feishu_url

        if not is_valid_feishu_url(v):
            raise ValueError("Invalid Feishu document URL")
        return v


class DocumentLinkUpdate(BaseModel):
    """Schema for updating a document link."""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None


class DocumentLinkResponse(BaseModel):
    """Schema for document link response."""

    id: UUID
    project_id: UUID
    title: str
    url: str
    description: Optional[str]
    created_by_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== Detailed Project Response ==========


class ProjectDetailResponse(ProjectResponse):
    """Detailed project response including members and documents."""

    members: List[ProjectMemberResponse] = []
    document_links: List[DocumentLinkResponse] = []

    class Config:
        from_attributes = True
