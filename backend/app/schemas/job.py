"""Job schemas."""

from datetime import datetime, date
from uuid import UUID

from pydantic import BaseModel

from app.models.job import JobStatus, JobType
from app.schemas.contact import ContactResponse, PropertyResponse
from app.schemas.user import UserResponse


# Job Stage Schemas
class JobStageBase(BaseModel):
    """Base job stage schema."""
    name: str
    color: str = "#3B82F6"
    order: int = 0
    maps_to_status: JobStatus = JobStatus.LEAD


class JobStageCreate(JobStageBase):
    """Create job stage schema."""
    pass


class JobStageUpdate(BaseModel):
    """Update job stage schema."""
    name: str | None = None
    color: str | None = None
    order: int | None = None
    maps_to_status: JobStatus | None = None
    is_active: bool | None = None


class JobStageResponse(JobStageBase):
    """Job stage response schema."""
    id: UUID
    organization_id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Job Note Schemas
class JobNoteCreate(BaseModel):
    """Create job note schema."""
    content: str
    note_type: str = "note"
    is_pinned: bool = False


class JobNoteResponse(BaseModel):
    """Job note response schema."""
    id: UUID
    job_id: UUID
    content: str
    note_type: str
    is_pinned: bool
    created_by: UserResponse | None
    created_at: datetime

    class Config:
        from_attributes = True


# Job Task Schemas
class JobTaskCreate(BaseModel):
    """Create job task schema."""
    title: str
    description: str | None = None
    due_date: date | None = None
    priority: str = "medium"
    assigned_to_id: UUID | None = None


class JobTaskUpdate(BaseModel):
    """Update job task schema."""
    title: str | None = None
    description: str | None = None
    due_date: date | None = None
    priority: str | None = None
    assigned_to_id: UUID | None = None
    is_completed: bool | None = None


class JobTaskResponse(BaseModel):
    """Job task response schema."""
    id: UUID
    job_id: UUID
    title: str
    description: str | None
    due_date: date | None
    priority: str
    is_completed: bool
    completed_at: datetime | None
    assigned_to: UserResponse | None
    created_at: datetime

    class Config:
        from_attributes = True


# Job Schemas
class JobBase(BaseModel):
    """Base job schema."""
    title: str
    description: str | None = None
    job_type: JobType = JobType.FULL_REPLACEMENT
    status: JobStatus = JobStatus.LEAD


class JobCreate(JobBase):
    """Create job schema."""
    contact_id: UUID | None = None
    property_id: UUID | None = None
    stage_id: UUID | None = None
    assigned_to_id: UUID | None = None
    scheduled_date: date | None = None
    scheduled_time: str | None = None
    estimated_duration_days: int | None = None
    estimated_value: float = 0.0
    is_insurance_job: bool = False
    insurance_company: str | None = None
    claim_number: str | None = None
    adjuster_name: str | None = None
    adjuster_phone: str | None = None
    adjuster_email: str | None = None
    deductible: float | None = None
    crew_name: str | None = None
    tags: list[str] | None = None
    custom_fields: dict | None = None


class JobUpdate(BaseModel):
    """Update job schema."""
    title: str | None = None
    description: str | None = None
    job_type: JobType | None = None
    status: JobStatus | None = None
    stage_id: UUID | None = None
    stage_order: int | None = None
    contact_id: UUID | None = None
    property_id: UUID | None = None
    assigned_to_id: UUID | None = None
    scheduled_date: date | None = None
    scheduled_time: str | None = None
    estimated_duration_days: int | None = None
    actual_start_date: date | None = None
    actual_end_date: date | None = None
    estimated_value: float | None = None
    actual_value: float | None = None
    cost: float | None = None
    is_insurance_job: bool | None = None
    insurance_company: str | None = None
    claim_number: str | None = None
    adjuster_name: str | None = None
    adjuster_phone: str | None = None
    adjuster_email: str | None = None
    deductible: float | None = None
    crew_name: str | None = None
    tags: list[str] | None = None
    custom_fields: dict | None = None


class JobResponse(JobBase):
    """Job response schema."""
    id: UUID
    organization_id: UUID
    job_number: str
    contact_id: UUID | None
    property_id: UUID | None
    stage_id: UUID | None
    stage_order: int
    assigned_to_id: UUID | None
    created_by_id: UUID | None
    
    # Scheduling
    scheduled_date: date | None
    scheduled_time: str | None
    estimated_duration_days: int | None
    actual_start_date: date | None
    actual_end_date: date | None
    
    # Financial
    estimated_value: float
    actual_value: float
    cost: float
    profit_margin: float
    
    # Insurance
    is_insurance_job: bool
    insurance_company: str | None
    claim_number: str | None
    adjuster_name: str | None
    adjuster_phone: str | None
    adjuster_email: str | None
    deductible: float | None
    
    # Other
    crew_name: str | None
    tags: list | None
    custom_fields: dict | None
    days_in_status: int
    status_changed_at: datetime
    
    # Relationships (optional, loaded when needed)
    contact: ContactResponse | None = None
    property: PropertyResponse | None = None
    stage: JobStageResponse | None = None
    assigned_to: UserResponse | None = None
    
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JobList(BaseModel):
    """Paginated job list."""
    items: list[JobResponse]
    total: int
    page: int
    page_size: int
    pages: int


class JobBoardColumn(BaseModel):
    """Kanban board column."""
    stage: JobStageResponse
    jobs: list[JobResponse]
    total_value: float


class JobBoardResponse(BaseModel):
    """Kanban board response."""
    columns: list[JobBoardColumn]
    total_jobs: int
    total_value: float
