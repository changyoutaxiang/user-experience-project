"""
ProjectMember model for project team membership.
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..core.database import Base


class ProjectMember(Base):
    """
    ProjectMember model representing a user's membership in a project.

    This is an association table with additional metadata for the many-to-many
    relationship between users and projects.
    """

    __tablename__ = "project_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Member metadata
    role = Column(String(50), nullable=True)  # e.g., "Developer", "Designer", "QA"
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User")

    # Constraints
    __table_args__ = (UniqueConstraint("project_id", "user_id", name="uq_project_member"),)

    def __repr__(self):
        return f"<ProjectMember project_id={self.project_id} user_id={self.user_id}>"
