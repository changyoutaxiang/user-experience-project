"""
DocumentLink model for linking Feishu documents to projects.
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..core.database import Base


class DocumentLink(Base):
    """
    DocumentLink model for storing links to external Feishu documents.

    Documents can be linked to projects or tasks (specs, designs, meeting notes, etc.).
    """

    __tablename__ = "document_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys (document can be linked to project OR task)
    project_id = Column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True
    )
    task_id = Column(
        UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True, index=True
    )

    # Document information
    title = Column(String(200), nullable=False)
    url = Column(Text, nullable=False)  # Feishu document URL
    description = Column(Text, nullable=True)

    # Metadata
    created_by_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="document_links")
    task = relationship("Task", back_populates="document_links")
    created_by = relationship("User")

    def __repr__(self):
        return f"<DocumentLink {self.title} ({self.url})>"
