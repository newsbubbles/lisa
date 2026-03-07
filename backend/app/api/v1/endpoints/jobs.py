"""Job management endpoints - core of the application."""

import uuid
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.api.v1.deps import CurrentUser, CurrentOrganization, DBSession
from app.models.job import Job, JobStage, JobNote, JobTask, JobStatus
from app.models.contact import Contact, Property
from app.models.user import User
from app.schemas.job import (
    JobCreate, JobUpdate, JobResponse, JobList, JobBoardResponse, JobBoardColumn,
    JobStageCreate, JobStageUpdate, JobStageResponse,
    JobNoteCreate, JobNoteResponse,
    JobTaskCreate, JobTaskUpdate, JobTaskResponse,
)

router = APIRouter()


def generate_job_number(org_id: UUID) -> str:
    """Generate a unique job number."""
    # Format: JOB-YYYYMMDD-XXXX
    date_part = datetime.utcnow().strftime("%Y%m%d")
    random_part = uuid.uuid4().hex[:4].upper()
    return f"JOB-{date_part}-{random_part}"


# ============ Job Stages ============

@router.get("/stages", response_model=list[JobStageResponse])
async def list_stages(
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """List all job stages for the organization."""
    result = await db.execute(
        select(JobStage)
        .where(JobStage.organization_id == organization.id, JobStage.is_active == True)
        .order_by(JobStage.order)
    )
    return result.scalars().all()


@router.post("/stages", response_model=JobStageResponse, status_code=status.HTTP_201_CREATED)
async def create_stage(
    data: JobStageCreate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Create a new job stage."""
    stage = JobStage(
        organization_id=organization.id,
        **data.model_dump(),
    )
    db.add(stage)
    await db.commit()
    await db.refresh(stage)
    return stage


@router.patch("/stages/{stage_id}", response_model=JobStageResponse)
async def update_stage(
    stage_id: UUID,
    data: JobStageUpdate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Update a job stage."""
    result = await db.execute(
        select(JobStage)
        .where(JobStage.id == stage_id, JobStage.organization_id == organization.id)
    )
    stage = result.scalar_one_or_none()
    
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(stage, field, value)
    
    await db.commit()
    await db.refresh(stage)
    return stage


# ============ Jobs ============

@router.get("", response_model=JobList)
async def list_jobs(
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    status: JobStatus | None = None,
    stage_id: UUID | None = None,
    assigned_to_id: UUID | None = None,
    contact_id: UUID | None = None,
):
    """List jobs with pagination and filtering."""
    query = (
        select(Job)
        .options(
            selectinload(Job.contact).selectinload(Contact.properties),
            selectinload(Job.job_property),
            selectinload(Job.stage),
            selectinload(Job.assigned_to),
        )
        .where(Job.organization_id == organization.id)
    )
    
    # Apply filters
    if search:
        search_filter = or_(
            Job.title.ilike(f"%{search}%"),
            Job.job_number.ilike(f"%{search}%"),
            Job.description.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
    
    if status:
        query = query.where(Job.status == status)
    
    if stage_id:
        query = query.where(Job.stage_id == stage_id)
    
    if assigned_to_id:
        query = query.where(Job.assigned_to_id == assigned_to_id)
    
    if contact_id:
        query = query.where(Job.contact_id == contact_id)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0
    
    # Apply pagination
    query = query.order_by(Job.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    jobs = result.scalars().all()
    
    return JobList(
        items=jobs,
        total=total,
        page=page,
        page_size=page_size,
        pages=(total + page_size - 1) // page_size,
    )


@router.get("/board", response_model=JobBoardResponse)
async def get_job_board(
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
    assigned_to_id: UUID | None = None,
):
    """Get jobs organized by stage for kanban board."""
    # Get all active stages
    stages_result = await db.execute(
        select(JobStage)
        .where(JobStage.organization_id == organization.id, JobStage.is_active == True)
        .order_by(JobStage.order)
    )
    stages = stages_result.scalars().all()
    
    # If no stages exist, create default ones
    if not stages:
        default_stages = [
            {"name": "Lead", "color": "#3B82F6", "order": 0, "maps_to_status": JobStatus.LEAD},
            {"name": "Prospect", "color": "#F59E0B", "order": 1, "maps_to_status": JobStatus.PROSPECT},
            {"name": "Approved", "color": "#10B981", "order": 2, "maps_to_status": JobStatus.APPROVED},
            {"name": "Scheduled", "color": "#6366F1", "order": 3, "maps_to_status": JobStatus.SCHEDULED},
            {"name": "In Progress", "color": "#EF4444", "order": 4, "maps_to_status": JobStatus.IN_PROGRESS},
            {"name": "Completed", "color": "#22C55E", "order": 5, "maps_to_status": JobStatus.COMPLETED},
            {"name": "Invoiced", "color": "#8B5CF6", "order": 6, "maps_to_status": JobStatus.INVOICED},
        ]
        for stage_data in default_stages:
            stage = JobStage(organization_id=organization.id, **stage_data)
            db.add(stage)
        await db.commit()
        
        # Reload stages
        stages_result = await db.execute(
            select(JobStage)
            .where(JobStage.organization_id == organization.id, JobStage.is_active == True)
            .order_by(JobStage.order)
        )
        stages = stages_result.scalars().all()
    
    # Build columns
    columns = []
    total_jobs = 0
    total_value = 0.0
    
    for stage in stages:
        # Get jobs for this stage
        jobs_query = (
            select(Job)
            .options(
                selectinload(Job.contact),
                selectinload(Job.job_property),
                selectinload(Job.stage),
                selectinload(Job.assigned_to),
            )
            .where(
                Job.organization_id == organization.id,
                Job.stage_id == stage.id,
            )
            .order_by(Job.stage_order, Job.created_at.desc())
        )
        
        if assigned_to_id:
            jobs_query = jobs_query.where(Job.assigned_to_id == assigned_to_id)
        
        jobs_result = await db.execute(jobs_query)
        jobs = jobs_result.scalars().all()
        
        column_value = sum(job.estimated_value or 0 for job in jobs)
        
        columns.append(JobBoardColumn(
            stage=stage,
            jobs=jobs,
            total_value=column_value,
        ))
        
        total_jobs += len(jobs)
        total_value += column_value
    
    return JobBoardResponse(
        columns=columns,
        total_jobs=total_jobs,
        total_value=total_value,
    )


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    data: JobCreate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Create a new job."""
    # If no stage provided, get the first stage (Lead)
    stage_id = data.stage_id
    if not stage_id:
        result = await db.execute(
            select(JobStage)
            .where(JobStage.organization_id == organization.id, JobStage.is_active == True)
            .order_by(JobStage.order)
            .limit(1)
        )
        first_stage = result.scalar_one_or_none()
        if first_stage:
            stage_id = first_stage.id
    
    job = Job(
        organization_id=organization.id,
        job_number=generate_job_number(organization.id),
        created_by_id=current_user.id,
        stage_id=stage_id,
        status_changed_at=datetime.utcnow(),
        **data.model_dump(exclude={"stage_id"}),
    )
    db.add(job)
    await db.commit()
    
    # Reload with relationships
    result = await db.execute(
        select(Job)
        .options(
            selectinload(Job.contact).selectinload(Contact.properties),
            selectinload(Job.job_property),
            selectinload(Job.stage),
            selectinload(Job.assigned_to),
        )
        .where(Job.id == job.id)
    )
    return result.scalar_one()


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Get a specific job with all details."""
    result = await db.execute(
        select(Job)
        .options(
            selectinload(Job.contact).selectinload(Contact.properties),
            selectinload(Job.job_property),
            selectinload(Job.stage),
            selectinload(Job.assigned_to),
        )
        .where(Job.id == job_id, Job.organization_id == organization.id)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job


@router.patch("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: UUID,
    data: JobUpdate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Update a job."""
    result = await db.execute(
        select(Job)
        .where(Job.id == job_id, Job.organization_id == organization.id)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_data = data.model_dump(exclude_unset=True)
    
    # Track status changes
    if "status" in update_data and update_data["status"] != job.status:
        update_data["status_changed_at"] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(job, field, value)
    
    await db.commit()
    
    # Reload with relationships
    result = await db.execute(
        select(Job)
        .options(
            selectinload(Job.contact).selectinload(Contact.properties),
            selectinload(Job.job_property),
            selectinload(Job.stage),
            selectinload(Job.assigned_to),
        )
        .where(Job.id == job.id)
    )
    return result.scalar_one()


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Delete a job."""
    result = await db.execute(
        select(Job)
        .where(Job.id == job_id, Job.organization_id == organization.id)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    await db.delete(job)
    await db.commit()


# ============ Job Notes ============

@router.get("/{job_id}/notes", response_model=list[JobNoteResponse])
async def list_job_notes(
    job_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """List notes for a job."""
    # Verify job exists
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.organization_id == organization.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Job not found")
    
    result = await db.execute(
        select(JobNote)
        .options(selectinload(JobNote.created_by))
        .where(JobNote.job_id == job_id)
        .order_by(JobNote.is_pinned.desc(), JobNote.created_at.desc())
    )
    return result.scalars().all()


@router.post("/{job_id}/notes", response_model=JobNoteResponse, status_code=status.HTTP_201_CREATED)
async def create_job_note(
    job_id: UUID,
    data: JobNoteCreate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Add a note to a job."""
    # Verify job exists
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.organization_id == organization.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Job not found")
    
    note = JobNote(
        job_id=job_id,
        created_by_id=current_user.id,
        **data.model_dump(),
    )
    db.add(note)
    await db.commit()
    
    result = await db.execute(
        select(JobNote)
        .options(selectinload(JobNote.created_by))
        .where(JobNote.id == note.id)
    )
    return result.scalar_one()


# ============ Job Tasks ============

@router.get("/{job_id}/tasks", response_model=list[JobTaskResponse])
async def list_job_tasks(
    job_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """List tasks for a job."""
    # Verify job exists
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.organization_id == organization.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Job not found")
    
    result = await db.execute(
        select(JobTask)
        .options(selectinload(JobTask.assigned_to))
        .where(JobTask.job_id == job_id)
        .order_by(JobTask.is_completed, JobTask.due_date, JobTask.created_at)
    )
    return result.scalars().all()


@router.post("/{job_id}/tasks", response_model=JobTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_job_task(
    job_id: UUID,
    data: JobTaskCreate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Add a task to a job."""
    # Verify job exists
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.organization_id == organization.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Job not found")
    
    task = JobTask(
        job_id=job_id,
        **data.model_dump(),
    )
    db.add(task)
    await db.commit()
    
    result = await db.execute(
        select(JobTask)
        .options(selectinload(JobTask.assigned_to))
        .where(JobTask.id == task.id)
    )
    return result.scalar_one()


@router.patch("/{job_id}/tasks/{task_id}", response_model=JobTaskResponse)
async def update_job_task(
    job_id: UUID,
    task_id: UUID,
    data: JobTaskUpdate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Update a task."""
    # Verify job exists
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.organization_id == organization.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Job not found")
    
    result = await db.execute(
        select(JobTask).where(JobTask.id == task_id, JobTask.job_id == job_id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = data.model_dump(exclude_unset=True)
    
    # Track completion
    if "is_completed" in update_data:
        if update_data["is_completed"] and not task.is_completed:
            update_data["completed_at"] = datetime.utcnow()
        elif not update_data["is_completed"]:
            update_data["completed_at"] = None
    
    for field, value in update_data.items():
        setattr(task, field, value)
    
    await db.commit()
    
    result = await db.execute(
        select(JobTask)
        .options(selectinload(JobTask.assigned_to))
        .where(JobTask.id == task.id)
    )
    return result.scalar_one()
