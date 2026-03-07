"""User model - authentication and authorization."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.job import Job, JobNote, JobTask


class User(Base, UUIDMixin, TimestampMixin):
    """User account for Lisa."""

    __tablename__ = "users"

    # Organization
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Authentication
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # Profile
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    
    # Role & Permissions
    role: Mapped[str] = mapped_column(String(50), default="member")  # owner, admin, member, viewer
    
    # Notification Preferences
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=True)
    sms_notifications: Mapped[bool] = mapped_column(Boolean, default=False)
    push_notifications: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="users")
    assigned_jobs: Mapped[list["Job"]] = relationship(
        "Job", back_populates="assigned_to", foreign_keys="Job.assigned_to_id"
    )
    created_jobs: Mapped[list["Job"]] = relationship(
        "Job", back_populates="created_by", foreign_keys="Job.created_by_id"
    )
    notes: Mapped[list["JobNote"]] = relationship("JobNote", back_populates="created_by")
    tasks: Mapped[list["JobTask"]] = relationship(
        "JobTask", back_populates="assigned_to", foreign_keys="JobTask.assigned_to_id"
    )

    @property
    def full_name(self) -> str:
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}"

    def __repr__(self) -> str:
        return f"<User {self.email}>"
