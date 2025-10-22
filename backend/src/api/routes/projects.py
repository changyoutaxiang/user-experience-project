"""
API routes for project operations.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.project import ProjectStatus
from ...models.user import User
from ...schemas.project import (
    DocumentLinkCreate,
    DocumentLinkResponse,
    DocumentLinkUpdate,
    ProjectCreate,
    ProjectDetailResponse,
    ProjectListItem,
    ProjectMemberAdd,
    ProjectMemberResponse,
    ProjectResponse,
    ProjectUpdate,
)
from ...services.audit_service import AuditService
from ...services.project_service import ProjectService
from ..deps import get_current_user

router = APIRouter()


# ========== Project CRUD Endpoints ==========


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new project.

    The current user will be set as the owner if owner_id is not provided.
    """
    project = await ProjectService.create_project(db, project_data, current_user.id)

    # Log the action
    await AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action_type="CREATE",
        resource_type="project",
        resource_id=project.id,
        resource_name=project.name,
        details={"status": project.status.value},
    )

    return project


@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    status: Optional[ProjectStatus] = Query(None, description="Filter by project status"),
    owner_id: Optional[UUID] = Query(None, description="Filter by owner ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List projects with optional filters.

    Supports filtering by status and owner, with pagination.
    """
    projects = await ProjectService.list_projects(
        db=db, status=status, owner_id=owner_id, skip=skip, limit=limit
    )
    return projects


@router.get("/overdue", response_model=List[ProjectResponse])
async def get_overdue_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all overdue projects.

    A project is overdue if it's not completed/archived and the end_date has passed.
    """
    projects = await ProjectService.get_overdue_projects(db)
    return projects


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a project by ID with full details including members and documents.
    """
    project = await ProjectService.get_project_by_id(db, project_id, include_details=True)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Project {project_id} not found"
        )

    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update a project.

    Only provided fields will be updated.
    """
    project = await ProjectService.update_project(db, project_id, project_data)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Project {project_id} not found"
        )

    # Log the action
    await AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action_type="UPDATE",
        resource_type="project",
        resource_id=project.id,
        resource_name=project.name,
        details=project_data.model_dump(exclude_unset=True),
    )

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a project.

    This will also delete all associated members, tasks, and document links.
    """
    # Get project name before deletion for audit log
    project = await ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Project {project_id} not found"
        )

    project_name = project.name
    success = await ProjectService.delete_project(db, project_id)

    # Log the action
    await AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action_type="DELETE",
        resource_type="project",
        resource_id=project_id,
        resource_name=project_name,
    )

    return None


# ========== Member Management Endpoints ==========


@router.post(
    "/{project_id}/members",
    response_model=ProjectMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_project_member(
    project_id: UUID,
    member_data: ProjectMemberAdd,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Add a member to a project.
    """
    member = await ProjectService.add_member(db, project_id, member_data)

    if not member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project or user not found, or user is already a member",
        )

    # Log the action
    await AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action_type="ADD_MEMBER",
        resource_type="project",
        resource_id=project_id,
        details={"user_id": str(member_data.user_id), "role": member_data.role},
    )

    return member


@router.get("/{project_id}/members", response_model=List[ProjectMemberResponse])
async def list_project_members(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all members of a project.
    """
    members = await ProjectService.list_members(db, project_id)
    return members


@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_project_member(
    project_id: UUID,
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Remove a member from a project.
    """
    success = await ProjectService.remove_member(db, project_id, user_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project member not found",
        )

    # Log the action
    await AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action_type="REMOVE_MEMBER",
        resource_type="project",
        resource_id=project_id,
        details={"user_id": str(user_id)},
    )

    return None


# ========== Document Link Management Endpoints ==========


@router.post(
    "/{project_id}/documents",
    response_model=DocumentLinkResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_document_link(
    project_id: UUID,
    link_data: DocumentLinkCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Add a Feishu document link to a project.
    """
    link = await ProjectService.add_document_link(db, project_id, link_data, current_user.id)

    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Project {project_id} not found"
        )

    # Log the action
    await AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action_type="ADD_DOCUMENT",
        resource_type="project",
        resource_id=project_id,
        details={"document_title": link_data.title, "document_url": link_data.url},
    )

    return link


@router.get("/{project_id}/documents", response_model=List[DocumentLinkResponse])
async def list_document_links(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all document links for a project.
    """
    links = await ProjectService.list_document_links(db, project_id)
    return links


@router.patch("/documents/{link_id}", response_model=DocumentLinkResponse)
async def update_document_link(
    link_id: UUID,
    link_data: DocumentLinkUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update a document link.
    """
    link = await ProjectService.update_document_link(db, link_id, link_data)

    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Document link {link_id} not found"
        )

    # Log the action
    await AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action_type="UPDATE_DOCUMENT",
        resource_type="document_link",
        resource_id=link_id,
        details=link_data.model_dump(exclude_unset=True),
    )

    return link


@router.delete("/documents/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document_link(
    link_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a document link.
    """
    success = await ProjectService.delete_document_link(db, link_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Document link {link_id} not found"
        )

    # Log the action
    await AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action_type="DELETE_DOCUMENT",
        resource_type="document_link",
        resource_id=link_id,
    )

    return None
