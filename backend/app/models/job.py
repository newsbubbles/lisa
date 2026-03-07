"""Job model - core project management functionality."""

import uuid
from datetime import datetime, date
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, Boolean, ForeignKey, Integer, Float, Date, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.db.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.user import User
    from app.models.contact import Contact, Property
    from app.models.estimate import Estimate
    from app.models.invoice import Invoice


class JobStatus(str, enum.Enum):
    """Job pipeline status."""
    LEAD = "lead"
    PROSPECT = "prospect"
    APPROVED = "approved"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    INVOICED = "invoiced"
    PAID = "paid"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"


class JobType(str, enum.Enum):
    """Type of roofing job."""
    FULL_REPLACEMENT = "full_replacement"
    REPAIR = "repair"
    INSPECTION = "inspection"
    MAINTENANCE = "maintenance"
    GUTTER = "gutter"
    SIDING = "siding"
    INSURANCE_CLAIM = "insurance_claim"
    COMMERCIAL = "commercial"
    OTHER = "other"


class Job(Base, UUIDMixin, TimestampMixin):
    """Job/Project in the system."""

    __tablename__ = "jobs"

    # Organization
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Contact & Property
    contact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contacts.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Basic Info
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    job_number: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    
    # Type & Status
    job_type: Mapped[JobType] = mapped_column(SQLEnum(JobType), default=JobType.FULL_REPLACEMENT)
    status: Mapped[JobStatus] = mapped_column(
        SQLEnum(JobStatus), default=JobStatus.LEAD, index=True
    )
    status_changed_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    # Custom Stage (for kanban)
    stage_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_stages.id", ondelete="SET NULL"),
        nullable=True,
    )
    stage_order: Mapped[int] = mapped_column(Integer, default=0)  # Order within stage
    
    # Assignment
    assigned_to_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    
    # Scheduling
    scheduled_date: Mapped[date | None] = mapped_column(Date)
    scheduled_time: Mapped[str | None] = mapped_column(String(50))  # "AM", "PM", "9:00 AM"
    estimated_duration_days: Mapped[int | None] = mapped_column(Integer)
    actual_start_date: Mapped[date | None] = mapped_column(Date)
    actual_end_date: Mapped[date | None] = mapped_column(Date)
    
    # Financial
    estimated_value: Mapped[float] = mapped_column(Float, default=0.0)
    actual_value: Mapped[float] = mapped_column(Float, default=0.0)
    cost: Mapped[float] = mapped_column(Float, default=0.0)  # Materials + Labor
    
    # Insurance (for insurance claims)
    is_insurance_job: Mapped[bool] = mapped_column(Boolean, default=False)
    insurance_company: Mapped[str | None] = mapped_column(String(255))
    claim_number: Mapped[str | None] = mapped_column(String(100))
    adjuster_name: Mapped[str | None] = mapped_column(String(255))
    adjuster_phone: Mapped[str | None] = mapped_column(String(50))
    adjuster_email: Mapped[str | None] = mapped_column(String(255))
    deductible: Mapped[float | None] = mapped_column(Float)
    
    # Crew
    crew_name: Mapped[str | None] = mapped_column(String(255))
    
    # Tags & Custom Fields
    tags: Mapped[list | None] = mapped_column(JSONB)  # ["storm", "urgent"]
    custom_fields: Mapped[dict | None] = mapped_column(JSONB)  # Flexible custom data

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="jobs")
    contact: Mapped["Contact"] = relationship("Contact", back_populates="jobs")
    job_property: Mapped["Property"] = relationship("Property", back_populates="jobs")
    stage: Mapped["JobStage"] = relationship("JobStage", back_populates="jobs")
    assigned_to: Mapped["User"] = relationship(
        "User", back_populates="assigned_jobs", foreign_keys=[assigned_to_id]
    )
    created_by: Mapped["User"] = relationship(
        "User", back_populates="created_jobs", foreign_keys=[created_by_id]
    )
    estimates: Mapped[list["Estimate"]] = relationship("Estimate", back_populates="job")
    invoices: Mapped[list["Invoice"]] = relationship("Invoice", back_populates="job")
    notes: Mapped[list["JobNote"]] = relationship(
        "JobNote", back_populates="job", cascade="all, delete-orphan"
    )
    tasks: Mapped[list["JobTask"]] = relationship(
        "JobTask", back_populates="job", cascade="all, delete-orphan"
    )
    documents: Mapped[list["JobDocument"]] = relationship(
        "JobDocument", back_populates="job", cascade="all, delete-orphan"
    )
    photos: Mapped[list["JobPhoto"]] = relationship(
        "JobPhoto", back_populates="job", cascade="all, delete-orphan"
    )

    # Computed properties
    @property
    def profit_margin(self) -> float:
        """Calculate profit margin percentage."""
        if self.actual_value == 0:
            return 0.0
        return ((self.actual_value - self.cost) / self.actual_value) * 100

    @property
    def days_in_status(self) -> int:
        """Calculate days in current status."""
        if self.status_changed_at:
            from datetime import timezone
            now = datetime.now(timezone.utc)
            # Handle both naive and aware datetimes
            status_dt = self.status_changed_at
            if status_dt.tzinfo is None:
                status_dt = status_dt.replace(tzinfo=timezone.utc)
            return (now - status_dt).days
        return 0

    def __repr__(self) -> str:
        return f"<Job {self.job_number}: {self.title}>"


class JobStage(Base, UUIDMixin, TimestampMixin):
    """Custom job stage for kanban board."""

    __tablename__ = "job_stages"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(String(7), default="#3B82F6")  # Hex color
    order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Map to system status
    maps_to_status: Mapped[JobStatus] = mapped_column(
        SQLEnum(JobStatus), default=JobStatus.LEAD
    )

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="job_stages")
    jobs: Mapped[list["Job"]] = relationship("Job", back_populates="stage")

    def __repr__(self) -> str:
        return f"<JobStage {self.name}>"


class JobNote(Base, UUIDMixin, TimestampMixin):
    """Note/comment on a job."""

    __tablename__ = "job_notes"

    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    note_type: Mapped[str] = mapped_column(String(50), default="note")  # note, call, email, text

    # Relationships
    job: Mapped["Job"] = relationship("Job", back_populates="notes")
    created_by: Mapped["User"] = relationship("User", back_populates="notes")

    def __repr__(self) -> str:
        return f"<JobNote {self.id}>"


class JobTask(Base, UUIDMixin, TimestampMixin):
    """Task/to-do item for a job."""

    __tablename__ = "job_tasks"

    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    assigned_to_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    due_date: Mapped[date | None] = mapped_column(Date)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime | None] = mapped_column()
    priority: Mapped[str] = mapped_column(String(20), default="medium")  # low, medium, high

    # Relationships
    job: Mapped["Job"] = relationship("Job", back_populates="tasks")
    assigned_to: Mapped["User"] = relationship(
        "User", back_populates="tasks", foreign_keys=[assigned_to_id]
    )

    def __repr__(self) -> str:
        return f"<JobTask {self.title}>"


class JobDocument(Base, UUIDMixin, TimestampMixin):
    """Document attached to a job."""

    __tablename__ = "job_documents"

    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50))  # pdf, doc, etc.
    file_size: Mapped[int] = mapped_column(Integer)  # bytes
    category: Mapped[str] = mapped_column(String(50), default="other")  # contract, estimate, invoice, permit, warranty, other

    # Relationships
    job: Mapped["Job"] = relationship("Job", back_populates="documents")

    def __repr__(self) -> str:
        return f"<JobDocument {self.name}>"


class JobPhoto(Base, UUIDMixin, TimestampMixin):
    """Photo attached to a job."""

    __tablename__ = "job_photos"

    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    url: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500))
    caption: Mapped[str | None] = mapped_column(String(500))
    category: Mapped[str] = mapped_column(String(50), default="other")  # before, during, after, damage, materials
    
    # Metadata
    taken_at: Mapped[datetime | None] = mapped_column()
    latitude: Mapped[float | None] = mapped_column()
    longitude: Mapped[float | None] = mapped_column()

    # Relationships
    job: Mapped["Job"] = relationship("Job", back_populates="photos")

    def __repr__(self) -> str:
        return f"<JobPhoto {self.id}>"
