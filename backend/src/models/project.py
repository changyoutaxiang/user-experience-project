"""
Project model for the project management system.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..core.database import Base


class ProjectStatus(str, enum.Enum):
    """Project status enumeration."""

    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class Project(Base):
    """
    Project model representing a project in the system.

    A project is the main unit of work, containing tasks, budget, and team members.
    """

    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(Enum(ProjectStatus), nullable=False, default=ProjectStatus.PLANNING, index=True)

    # Timeline
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True, index=True)  # Indexed for overdue queries

    # Budget
    budget = Column(Numeric(15, 2), nullable=False, default=0)
    spent = Column(Numeric(15, 2), nullable=False, default=0)

    # Ownership
    owner_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="owned_projects", foreign_keys=[owner_id])
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    document_links = relationship(
        "DocumentLink", back_populates="project", cascade="all, delete-orphan"
    )
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project {self.name} ({self.status.value})>"
