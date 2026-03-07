"""Estimate management endpoints."""

import secrets
import uuid
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.api.v1.deps import CurrentUser, CurrentOrganization, DBSession
from app.models.estimate import Estimate, EstimateLineItem, EstimateTemplate, EstimateStatus
from app.models.job import Job
from app.schemas.estimate import (
    EstimateCreate, EstimateUpdate, EstimateResponse,
    EstimateLineItemCreate, EstimateLineItemUpdate, EstimateLineItemResponse,
    EstimateTemplateCreate, EstimateTemplateResponse,
)

router = APIRouter()


def generate_estimate_number(org_id: UUID) -> str:
    """Generate a unique estimate number."""
    date_part = datetime.utcnow().strftime("%Y%m%d")
    random_part = uuid.uuid4().hex[:4].upper()
    return f"EST-{date_part}-{random_part}"


def calculate_estimate_totals(estimate: Estimate) -> None:
    """Calculate and update estimate totals."""
    subtotal = 0.0
    cost = 0.0
    good_total = 0.0
    better_total = 0.0
    best_total = 0.0
    
    for item in estimate.line_items:
        item.total = item.quantity * item.unit_price
        item.total_cost = item.quantity * item.unit_cost
        
        if item.is_selected:
            if item.option == "good":
                good_total += item.total
            elif item.option == "best":
                best_total += item.total
            else:  # better or no option
                subtotal += item.total
                cost += item.total_cost
                better_total += item.total
    
    # Apply discount
    if estimate.discount_percent > 0:
        discount = subtotal * (estimate.discount_percent / 100)
    else:
        discount = estimate.discount_amount
    
    subtotal_after_discount = subtotal - discount
    
    # Calculate tax
    tax_amount = subtotal_after_discount * (estimate.tax_rate / 100)
    
    # Update estimate
    estimate.subtotal = subtotal
    estimate.tax_amount = tax_amount
    estimate.total = subtotal_after_discount + tax_amount
    estimate.cost = cost
    
    # Good/Better/Best totals
    if estimate.presentation_type.value == "good_better_best":
        estimate.good_total = good_total + (good_total * estimate.tax_rate / 100)
        estimate.better_total = better_total + (better_total * estimate.tax_rate / 100)
        estimate.best_total = best_total + (best_total * estimate.tax_rate / 100)
    
    # Calculate monthly payment if financing enabled
    if estimate.include_financing and estimate.financing_term_months and estimate.financing_rate:
        # Simple calculation (not accounting for APR compounding)
        monthly_rate = estimate.financing_rate / 100 / 12
        months = estimate.financing_term_months
        if monthly_rate > 0:
            estimate.monthly_payment = estimate.total * (monthly_rate * (1 + monthly_rate) ** months) / ((1 + monthly_rate) ** months - 1)
        else:
            estimate.monthly_payment = estimate.total / months


# ============ Estimate Templates ============

@router.get("/templates", response_model=list[EstimateTemplateResponse])
async def list_templates(
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
    category: str | None = None,
):
    """List estimate templates."""
    query = (
        select(EstimateTemplate)
        .where(
            EstimateTemplate.organization_id == organization.id,
            EstimateTemplate.is_active == True,
        )
    )
    
    if category:
        query = query.where(EstimateTemplate.category == category)
    
    result = await db.execute(query.order_by(EstimateTemplate.name))
    return result.scalars().all()


@router.post("/templates", response_model=EstimateTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    data: EstimateTemplateCreate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Create an estimate template."""
    template = EstimateTemplate(
        organization_id=organization.id,
        **data.model_dump(),
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template


# ============ Estimates ============

@router.get("", response_model=list[EstimateResponse])
async def list_estimates(
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
    job_id: UUID | None = None,
    status: EstimateStatus | None = None,
):
    """List estimates."""
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    query = (
        select(Estimate)
        .options(selectinload(Estimate.line_items))
        .where(Estimate.job_id.in_(jobs_query))
    )
    
    if job_id:
        query = query.where(Estimate.job_id == job_id)
    
    if status:
        query = query.where(Estimate.status == status)
    
    result = await db.execute(query.order_by(Estimate.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=EstimateResponse, status_code=status.HTTP_201_CREATED)
async def create_estimate(
    data: EstimateCreate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Create a new estimate."""
    # Verify job exists and belongs to organization
    result = await db.execute(
        select(Job).where(Job.id == data.job_id, Job.organization_id == organization.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Create estimate
    estimate_data = data.model_dump(exclude={"line_items"})
    estimate = Estimate(
        estimate_number=generate_estimate_number(organization.id),
        share_token=secrets.token_urlsafe(32),
        **estimate_data,
    )
    db.add(estimate)
    await db.flush()
    
    # Create line items
    if data.line_items:
        for i, item_data in enumerate(data.line_items):
            item = EstimateLineItem(
                estimate_id=estimate.id,
                order=item_data.order or i,
                **item_data.model_dump(exclude={"order"}),
            )
            db.add(item)
    
    await db.flush()
    
    # Calculate totals
    result = await db.execute(
        select(Estimate)
        .options(selectinload(Estimate.line_items))
        .where(Estimate.id == estimate.id)
    )
    estimate = result.scalar_one()
    calculate_estimate_totals(estimate)
    
    await db.commit()
    await db.refresh(estimate)
    
    return estimate


@router.get("/{estimate_id}", response_model=EstimateResponse)
async def get_estimate(
    estimate_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Get a specific estimate."""
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    result = await db.execute(
        select(Estimate)
        .options(selectinload(Estimate.line_items))
        .where(Estimate.id == estimate_id, Estimate.job_id.in_(jobs_query))
    )
    estimate = result.scalar_one_or_none()
    
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    return estimate


@router.patch("/{estimate_id}", response_model=EstimateResponse)
async def update_estimate(
    estimate_id: UUID,
    data: EstimateUpdate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Update an estimate."""
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    result = await db.execute(
        select(Estimate)
        .options(selectinload(Estimate.line_items))
        .where(Estimate.id == estimate_id, Estimate.job_id.in_(jobs_query))
    )
    estimate = result.scalar_one_or_none()
    
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    update_data = data.model_dump(exclude_unset=True)
    
    # Track status changes
    if "status" in update_data:
        new_status = update_data["status"]
        if new_status == EstimateStatus.SENT and estimate.status == EstimateStatus.DRAFT:
            update_data["sent_at"] = datetime.utcnow()
        elif new_status == EstimateStatus.APPROVED:
            update_data["approved_at"] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(estimate, field, value)
    
    # Recalculate totals
    calculate_estimate_totals(estimate)
    
    await db.commit()
    await db.refresh(estimate)
    
    return estimate


@router.delete("/{estimate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_estimate(
    estimate_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Delete an estimate."""
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    result = await db.execute(
        select(Estimate)
        .where(Estimate.id == estimate_id, Estimate.job_id.in_(jobs_query))
    )
    estimate = result.scalar_one_or_none()
    
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    await db.delete(estimate)
    await db.commit()


# ============ Line Items ============

@router.post("/{estimate_id}/items", response_model=EstimateLineItemResponse, status_code=status.HTTP_201_CREATED)
async def add_line_item(
    estimate_id: UUID,
    data: EstimateLineItemCreate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Add a line item to an estimate."""
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    result = await db.execute(
        select(Estimate)
        .options(selectinload(Estimate.line_items))
        .where(Estimate.id == estimate_id, Estimate.job_id.in_(jobs_query))
    )
    estimate = result.scalar_one_or_none()
    
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    # Calculate total
    total = data.quantity * data.unit_price
    total_cost = data.quantity * data.unit_cost
    
    item = EstimateLineItem(
        estimate_id=estimate_id,
        total=total,
        total_cost=total_cost,
        **data.model_dump(),
    )
    db.add(item)
    await db.flush()
    
    # Recalculate estimate totals
    estimate.line_items.append(item)
    calculate_estimate_totals(estimate)
    
    await db.commit()
    await db.refresh(item)
    
    return item


@router.patch("/{estimate_id}/items/{item_id}", response_model=EstimateLineItemResponse)
async def update_line_item(
    estimate_id: UUID,
    item_id: UUID,
    data: EstimateLineItemUpdate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Update a line item."""
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    result = await db.execute(
        select(Estimate)
        .options(selectinload(Estimate.line_items))
        .where(Estimate.id == estimate_id, Estimate.job_id.in_(jobs_query))
    )
    estimate = result.scalar_one_or_none()
    
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    result = await db.execute(
        select(EstimateLineItem)
        .where(EstimateLineItem.id == item_id, EstimateLineItem.estimate_id == estimate_id)
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Line item not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    # Recalculate item total
    item.total = item.quantity * item.unit_price
    item.total_cost = item.quantity * item.unit_cost
    
    # Recalculate estimate totals
    calculate_estimate_totals(estimate)
    
    await db.commit()
    await db.refresh(item)
    
    return item


@router.delete("/{estimate_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_line_item(
    estimate_id: UUID,
    item_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Delete a line item."""
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    result = await db.execute(
        select(Estimate)
        .options(selectinload(Estimate.line_items))
        .where(Estimate.id == estimate_id, Estimate.job_id.in_(jobs_query))
    )
    estimate = result.scalar_one_or_none()
    
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    result = await db.execute(
        select(EstimateLineItem)
        .where(EstimateLineItem.id == item_id, EstimateLineItem.estimate_id == estimate_id)
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Line item not found")
    
    await db.delete(item)
    
    # Recalculate estimate totals
    estimate.line_items = [i for i in estimate.line_items if i.id != item_id]
    calculate_estimate_totals(estimate)
    
    await db.commit()


# ============ Actions ============

@router.post("/{estimate_id}/send", response_model=EstimateResponse)
async def send_estimate(
    estimate_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Send estimate to customer."""
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    result = await db.execute(
        select(Estimate)
        .options(selectinload(Estimate.line_items))
        .where(Estimate.id == estimate_id, Estimate.job_id.in_(jobs_query))
    )
    estimate = result.scalar_one_or_none()
    
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    estimate.status = EstimateStatus.SENT
    estimate.sent_at = datetime.utcnow()
    
    # TODO: Actually send email with proposal link
    # The share_token can be used to create a public link
    
    await db.commit()
    await db.refresh(estimate)
    
    return estimate
