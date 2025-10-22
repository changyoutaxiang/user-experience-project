"""
Service layer for project operations.
"""
from datetime import date
from typing import List, Optional
from uuid import UUID

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.document_link import DocumentLink
from ..models.project import Project, ProjectStatus
from ..models.project_member import ProjectMember
from ..models.user import User
from ..schemas.project import (
    DocumentLinkCreate,
    DocumentLinkUpdate,
    ProjectCreate,
    ProjectMemberAdd,
    ProjectUpdate,
)
from .audit_service import AuditService


class ProjectService:
    """Service for managing projects."""

    @staticmethod
    async def create_project(
        db: AsyncSession,
        project_data: ProjectCreate,
        current_user_id: UUID,
        ip_address: Optional[str] = None,
    ) -> Project:
        """
        Create a new project.

        Args:
            db: Database session
            project_data: Project creation data
            current_user_id: ID of the user creating the project
            ip_address: IP address of the request (for audit logging)

        Returns:
            Created project instance
        """
        # Use current user as owner if not specified
        owner_id = project_data.owner_id or current_user_id

        project = Project(
            name=project_data.name,
            description=project_data.description,
            status=project_data.status,
            start_date=project_data.start_date,
            end_date=project_data.end_date,
            budget=project_data.budget,
            owner_id=owner_id,
        )

        db.add(project)
        await db.flush()
        await db.refresh(project, ["owner"])

        # Audit log
        await AuditService.log_action(
            db=db,
            user_id=current_user_id,
            action_type="create_project",
            resource_type="project",
            resource_id=project.id,
            resource_name=project.name,
            details={"status": project.status.value, "budget": str(project.budget)},
            ip_address=ip_address,
        )

        return project

    @staticmethod
    async def get_project_by_id(
        db: AsyncSession, project_id: UUID, include_details: bool = False
    ) -> Optional[Project]:
        """
        Get a project by ID.

        Args:
            db: Database session
            project_id: Project ID
            include_details: Whether to load members and document links

        Returns:
            Project instance or None if not found
        """
        query = select(Project).where(Project.id == project_id).options(selectinload(Project.owner))

        if include_details:
            query = query.options(
                selectinload(Project.members).selectinload(ProjectMember.user),
                selectinload(Project.document_links),
            )

        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_projects(
        db: AsyncSession,
        status: Optional[ProjectStatus] = None,
        owner_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Project]:
        """
        List projects with optional filters.

        Args:
            db: Database session
            status: Filter by project status
            owner_id: Filter by owner ID
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of projects
        """
        query = select(Project).options(selectinload(Project.owner))

        # Apply filters
        if status:
            query = query.where(Project.status == status)
        if owner_id:
            query = query.where(Project.owner_id == owner_id)

        # Pagination
        query = query.offset(skip).limit(limit).order_by(Project.created_at.desc())

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_project(
        db: AsyncSession,
        project_id: UUID,
        project_data: ProjectUpdate,
        current_user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ) -> Optional[Project]:
        """
        Update a project.

        Args:
            db: Database session
            project_id: Project ID
            project_data: Updated project data
            current_user_id: ID of the user updating the project (for audit logging)
            ip_address: IP address of the request (for audit logging)

        Returns:
            Updated project instance or None if not found
        """
        project = await ProjectService.get_project_by_id(db, project_id)
        if not project:
            return None

        # Update fields that are provided
        update_data = project_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)

        await db.flush()
        await db.refresh(project, ["owner"])

        # Audit log
        await AuditService.log_action(
            db=db,
            user_id=current_user_id,
            action_type="update_project",
            resource_type="project",
            resource_id=project.id,
            resource_name=project.name,
            details={"updated_fields": list(update_data.keys())},
            ip_address=ip_address,
        )

        return project

    @staticmethod
    async def delete_project(
        db: AsyncSession,
        project_id: UUID,
        current_user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ) -> bool:
        """
        Delete a project.

        Args:
            db: Database session
            project_id: Project ID
            current_user_id: ID of the user deleting the project (for audit logging)
            ip_address: IP address of the request (for audit logging)

        Returns:
            True if deleted, False if not found
        """
        project = await ProjectService.get_project_by_id(db, project_id)
        if not project:
            return False

        project_name = project.name

        await db.delete(project)

        # Audit log
        await AuditService.log_action(
            db=db,
            user_id=current_user_id,
            action_type="delete_project",
            resource_type="project",
            resource_id=project_id,
            resource_name=project_name,
            ip_address=ip_address,
        )

        return True

    # ========== Member Management ==========

    @staticmethod
    async def add_member(
        db: AsyncSession,
        project_id: UUID,
        member_data: ProjectMemberAdd,
        current_user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ) -> Optional[ProjectMember]:
        """
        Add a member to a project.

        Args:
            db: Database session
            project_id: Project ID
            member_data: Member data
            current_user_id: ID of the user adding the member (for audit logging)
            ip_address: IP address of the request (for audit logging)

        Returns:
            Created ProjectMember instance or None if project/user not found
        """
        # Check if project exists
        project = await ProjectService.get_project_by_id(db, project_id)
        if not project:
            return None

        # Check if user exists
        user_result = await db.execute(select(User).where(User.id == member_data.user_id))
        user = user_result.scalar_one_or_none()
        if not user:
            return None

        # Check if already a member
        existing = await db.execute(
            select(ProjectMember).where(
                and_(
                    ProjectMember.project_id == project_id,
                    ProjectMember.user_id == member_data.user_id,
                )
            )
        )
        if existing.scalar_one_or_none():
            return None  # Already a member

        member = ProjectMember(
            project_id=project_id, user_id=member_data.user_id, role=member_data.role
        )

        db.add(member)
        await db.flush()
        await db.refresh(member, ["user"])

        # Audit log
        await AuditService.log_action(
            db=db,
            user_id=current_user_id,
            action_type="add_project_member",
            resource_type="project",
            resource_id=project_id,
            resource_name=project.name,
            details={"member_name": user.name, "member_role": member_data.role},
            ip_address=ip_address,
        )

        return member

    @staticmethod
    async def remove_member(
        db: AsyncSession,
        project_id: UUID,
        user_id: UUID,
        current_user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ) -> bool:
        """
        Remove a member from a project.

        Args:
            db: Database session
            project_id: Project ID
            user_id: User ID
            current_user_id: ID of the user removing the member (for audit logging)
            ip_address: IP address of the request (for audit logging)

        Returns:
            True if removed, False if not found
        """
        result = await db.execute(
            select(ProjectMember)
            .where(and_(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id))
            .options(selectinload(ProjectMember.user))
        )
        member = result.scalar_one_or_none()

        if not member:
            return False

        # Get project for audit log
        project = await ProjectService.get_project_by_id(db, project_id)
        member_name = member.user.name if member.user else str(user_id)

        await db.delete(member)

        # Audit log
        if project:
            await AuditService.log_action(
                db=db,
                user_id=current_user_id,
                action_type="remove_project_member",
                resource_type="project",
                resource_id=project_id,
                resource_name=project.name,
                details={"member_name": member_name},
                ip_address=ip_address,
            )

        return True

    @staticmethod
    async def list_members(db: AsyncSession, project_id: UUID) -> List[ProjectMember]:
        """
        List all members of a project.

        Args:
            db: Database session
            project_id: Project ID

        Returns:
            List of ProjectMember instances
        """
        result = await db.execute(
            select(ProjectMember)
            .where(ProjectMember.project_id == project_id)
            .options(selectinload(ProjectMember.user))
            .order_by(ProjectMember.assigned_at)
        )
        return list(result.scalars().all())

    # ========== Document Link Management ==========

    @staticmethod
    async def add_document_link(
        db: AsyncSession,
        project_id: UUID,
        link_data: DocumentLinkCreate,
        created_by_id: UUID,
        ip_address: Optional[str] = None,
    ) -> Optional[DocumentLink]:
        """
        Add a document link to a project.

        Args:
            db: Database session
            project_id: Project ID
            link_data: Document link data
            created_by_id: ID of user creating the link
            ip_address: IP address of the request (for audit logging)

        Returns:
            Created DocumentLink instance or None if project not found
        """
        # Check if project exists
        project = await ProjectService.get_project_by_id(db, project_id)
        if not project:
            return None

        link = DocumentLink(
            project_id=project_id,
            title=link_data.title,
            url=link_data.url,
            description=link_data.description,
            created_by_id=created_by_id,
        )

        db.add(link)
        await db.flush()
        await db.refresh(link)

        # Audit log
        await AuditService.log_action(
            db=db,
            user_id=created_by_id,
            action_type="add_document_link",
            resource_type="project",
            resource_id=project_id,
            resource_name=project.name,
            details={"document_title": link.title, "document_url": link.url},
            ip_address=ip_address,
        )

        return link

    @staticmethod
    async def update_document_link(
        db: AsyncSession, link_id: UUID, link_data: DocumentLinkUpdate
    ) -> Optional[DocumentLink]:
        """
        Update a document link.

        Args:
            db: Database session
            link_id: Document link ID
            link_data: Updated link data

        Returns:
            Updated DocumentLink instance or None if not found
        """
        result = await db.execute(select(DocumentLink).where(DocumentLink.id == link_id))
        link = result.scalar_one_or_none()

        if not link:
            return None

        # Update fields that are provided
        update_data = link_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(link, field, value)

        await db.flush()
        await db.refresh(link)

        return link

    @staticmethod
    async def delete_document_link(
        db: AsyncSession,
        link_id: UUID,
        current_user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ) -> bool:
        """
        Delete a document link.

        Args:
            db: Database session
            link_id: Document link ID
            current_user_id: ID of the user deleting the link (for audit logging)
            ip_address: IP address of the request (for audit logging)

        Returns:
            True if deleted, False if not found
        """
        result = await db.execute(select(DocumentLink).where(DocumentLink.id == link_id))
        link = result.scalar_one_or_none()

        if not link:
            return False

        # Get project for audit log
        project = await ProjectService.get_project_by_id(db, link.project_id)
        link_title = link.title

        await db.delete(link)

        # Audit log
        if project:
            await AuditService.log_action(
                db=db,
                user_id=current_user_id,
                action_type="delete_document_link",
                resource_type="project",
                resource_id=link.project_id,
                resource_name=project.name,
                details={"document_title": link_title},
                ip_address=ip_address,
            )

        return True

    @staticmethod
    async def list_document_links(db: AsyncSession, project_id: UUID) -> List[DocumentLink]:
        """
        List all document links for a project.

        Args:
            db: Database session
            project_id: Project ID

        Returns:
            List of DocumentLink instances
        """
        result = await db.execute(
            select(DocumentLink)
            .where(DocumentLink.project_id == project_id)
            .order_by(DocumentLink.created_at.desc())
        )
        return list(result.scalars().all())

    # ========== Overdue Detection ==========

    @staticmethod
    async def get_overdue_projects(db: AsyncSession) -> List[Project]:
        """
        Get all overdue projects.

        A project is overdue if:
        - Status is not COMPLETED or ARCHIVED
        - end_date is in the past

        Args:
            db: Database session

        Returns:
            List of overdue projects
        """
        today = date.today()

        query = (
            select(Project)
            .where(
                and_(
                    Project.end_date < today,
                    Project.status.in_([ProjectStatus.PLANNING, ProjectStatus.IN_PROGRESS]),
                )
            )
            .options(selectinload(Project.owner))
            .order_by(Project.end_date)
        )

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def count_overdue_projects(db: AsyncSession) -> int:
        """
        Count overdue projects.

        Returns:
            Number of overdue projects
        """
        today = date.today()

        query = select(func.count(Project.id)).where(
            and_(
                Project.end_date < today,
                Project.status.in_([ProjectStatus.PLANNING, ProjectStatus.IN_PROGRESS]),
            )
        )

        result = await db.execute(query)
        return result.scalar() or 0

    @staticmethod
    async def get_project_stats_by_status(db: AsyncSession) -> dict:
        """
        Get count of projects by status.

        Returns:
            Dictionary with status counts
        """
        query = select(Project.status, func.count(Project.id)).group_by(Project.status)

        result = await db.execute(query)
        rows = result.all()

        stats = {status.value: 0 for status in ProjectStatus}
        for status, count in rows:
            stats[status.value] = count

        return stats
