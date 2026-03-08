"""Invoice management endpoints."""

import uuid
from datetime import datetime, date
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.v1.deps import CurrentUser, CurrentOrganization, DBSession
from app.models.invoice import Invoice, InvoiceLineItem, Payment, InvoiceStatus
from app.models.job import Job
from app.schemas.invoice import (
    InvoiceCreate, InvoiceUpdate, InvoiceResponse,
    PaymentCreate, PaymentResponse, JobSummaryForInvoice,
)

router = APIRouter()


def generate_invoice_number(org_id: UUID) -> str:
    """Generate a unique invoice number."""
    date_part = datetime.utcnow().strftime("%Y")
    random_part = uuid.uuid4().hex[:4].upper()
    return f"INV-{date_part}-{random_part}"


def build_job_summary(job: Job) -> JobSummaryForInvoice:
    """Build job summary for invoice display."""
    customer_name = None
    customer_email = None
    property_address = None
    
    if job.contact:
        customer_name = f"{job.contact.first_name} {job.contact.last_name}".strip()
        customer_email = job.contact.email
    
    if job.property:
        parts = [job.property.street, job.property.city, job.property.state, job.property.zip]
        property_address = ", ".join(p for p in parts if p)
    
    return JobSummaryForInvoice(
        id=job.id,
        title=job.title,
        job_number=job.job_number,
        customer_name=customer_name,
        customer_email=customer_email,
        property_address=property_address,
    )


def calculate_invoice_totals(invoice: Invoice) -> None:
    """Calculate and update invoice totals."""
    subtotal = sum(item.total for item in invoice.line_items)
    
    # Calculate tax
    tax_amount = subtotal * (invoice.tax_rate / 100)
    
    # Apply discount
    total = subtotal + tax_amount - invoice.discount_amount
    
    # Calculate amount paid
    amount_paid = sum(p.amount for p in invoice.payments if p.status == "completed")
    
    invoice.subtotal = subtotal
    invoice.tax_amount = tax_amount
    invoice.total = total
    invoice.amount_paid = amount_paid
    invoice.balance_due = total - amount_paid
    
    # Update status based on payments
    if amount_paid >= total:
        invoice.status = InvoiceStatus.PAID
        invoice.paid_at = datetime.utcnow()
    elif amount_paid > 0:
        invoice.status = InvoiceStatus.PARTIAL
    elif invoice.due_date and date.today() > invoice.due_date:
        invoice.status = InvoiceStatus.OVERDUE


@router.get("", response_model=list[InvoiceResponse])
async def list_invoices(
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
    job_id: UUID | None = None,
    status: InvoiceStatus | None = None,
):
    """List invoices."""
    from app.models.contact import Contact, Property
    
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    query = (
        select(Invoice)
        .options(
            selectinload(Invoice.line_items),
            selectinload(Invoice.payments),
            selectinload(Invoice.job).selectinload(Job.contact),
            selectinload(Invoice.job).selectinload(Job.property),
        )
        .where(Invoice.job_id.in_(jobs_query))
    )
    
    if job_id:
        query = query.where(Invoice.job_id == job_id)
    
    if status:
        query = query.where(Invoice.status == status)
    
    result = await db.execute(query.order_by(Invoice.created_at.desc()))
    invoices = result.scalars().all()
    
    # Transform to include job summary
    response_list = []
    for invoice in invoices:
        invoice_dict = {
            "id": invoice.id,
            "job_id": invoice.job_id,
            "invoice_number": invoice.invoice_number,
            "status": invoice.status,
            "invoice_date": invoice.invoice_date,
            "due_date": invoice.due_date,
            "sent_at": invoice.sent_at,
            "paid_at": invoice.paid_at,
            "subtotal": invoice.subtotal,
            "tax_rate": invoice.tax_rate,
            "tax_amount": invoice.tax_amount,
            "discount_amount": invoice.discount_amount,
            "total": invoice.total,
            "amount_paid": invoice.amount_paid,
            "balance_due": invoice.balance_due,
            "notes": invoice.notes,
            "terms": invoice.terms,
            "pdf_url": invoice.pdf_url,
            "payment_link": invoice.payment_link,
            "stripe_invoice_id": invoice.stripe_invoice_id,
            "quickbooks_invoice_id": invoice.quickbooks_invoice_id,
            "quickbooks_sync_status": invoice.quickbooks_sync_status,
            "line_items": invoice.line_items,
            "payments": invoice.payments,
            "job": build_job_summary(invoice.job) if invoice.job else None,
            "is_overdue": invoice.is_overdue,
            "created_at": invoice.created_at,
            "updated_at": invoice.updated_at,
        }
        response_list.append(InvoiceResponse(**invoice_dict))
    
    return response_list


@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    data: InvoiceCreate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Create a new invoice."""
    # Verify job exists and belongs to organization
    result = await db.execute(
        select(Job).where(Job.id == data.job_id, Job.organization_id == organization.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Create invoice
    invoice_data = data.model_dump(exclude={"line_items"})
    invoice = Invoice(
        invoice_number=generate_invoice_number(organization.id),
        **invoice_data,
    )
    db.add(invoice)
    await db.flush()
    
    # Create line items
    if data.line_items:
        for i, item_data in enumerate(data.line_items):
            total = item_data.quantity * item_data.unit_price
            item = InvoiceLineItem(
                invoice_id=invoice.id,
                total=total,
                order=item_data.order or i,
                description=item_data.description,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
            )
            db.add(item)
    
    await db.flush()
    
    # Calculate totals
    result = await db.execute(
        select(Invoice)
        .options(
            selectinload(Invoice.line_items),
            selectinload(Invoice.payments),
        )
        .where(Invoice.id == invoice.id)
    )
    invoice = result.scalar_one()
    calculate_invoice_totals(invoice)
    
    await db.commit()
    await db.refresh(invoice)
    
    return invoice


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Get a specific invoice."""
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    result = await db.execute(
        select(Invoice)
        .options(
            selectinload(Invoice.line_items),
            selectinload(Invoice.payments),
            selectinload(Invoice.job).selectinload(Job.contact),
            selectinload(Invoice.job).selectinload(Job.property),
        )
        .where(Invoice.id == invoice_id, Invoice.job_id.in_(jobs_query))
    )
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Build response with job summary
    invoice_dict = {
        "id": invoice.id,
        "job_id": invoice.job_id,
        "invoice_number": invoice.invoice_number,
        "status": invoice.status,
        "invoice_date": invoice.invoice_date,
        "due_date": invoice.due_date,
        "sent_at": invoice.sent_at,
        "paid_at": invoice.paid_at,
        "subtotal": invoice.subtotal,
        "tax_rate": invoice.tax_rate,
        "tax_amount": invoice.tax_amount,
        "discount_amount": invoice.discount_amount,
        "total": invoice.total,
        "amount_paid": invoice.amount_paid,
        "balance_due": invoice.balance_due,
        "notes": invoice.notes,
        "terms": invoice.terms,
        "pdf_url": invoice.pdf_url,
        "payment_link": invoice.payment_link,
        "stripe_invoice_id": invoice.stripe_invoice_id,
        "quickbooks_invoice_id": invoice.quickbooks_invoice_id,
        "quickbooks_sync_status": invoice.quickbooks_sync_status,
        "line_items": invoice.line_items,
        "payments": invoice.payments,
        "job": build_job_summary(invoice.job) if invoice.job else None,
        "is_overdue": invoice.is_overdue,
        "created_at": invoice.created_at,
        "updated_at": invoice.updated_at,
    }
    return InvoiceResponse(**invoice_dict)


@router.patch("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: UUID,
    data: InvoiceUpdate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Update an invoice."""
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    result = await db.execute(
        select(Invoice)
        .options(
            selectinload(Invoice.line_items),
            selectinload(Invoice.payments),
        )
        .where(Invoice.id == invoice_id, Invoice.job_id.in_(jobs_query))
    )
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(invoice, field, value)
    
    # Recalculate totals
    calculate_invoice_totals(invoice)
    
    await db.commit()
    await db.refresh(invoice)
    
    return invoice


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Delete an invoice."""
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    result = await db.execute(
        select(Invoice)
        .where(Invoice.id == invoice_id, Invoice.job_id.in_(jobs_query))
    )
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    await db.delete(invoice)
    await db.commit()


# ============ Payments ============

@router.post("/{invoice_id}/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def record_payment(
    invoice_id: UUID,
    data: PaymentCreate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Record a payment for an invoice."""
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    result = await db.execute(
        select(Invoice)
        .options(
            selectinload(Invoice.line_items),
            selectinload(Invoice.payments),
        )
        .where(Invoice.id == invoice_id, Invoice.job_id.in_(jobs_query))
    )
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    payment = Payment(
        invoice_id=invoice_id,
        payment_date=data.payment_date or date.today(),
        **data.model_dump(exclude={"payment_date"}),
    )
    db.add(payment)
    await db.flush()
    
    # Recalculate invoice totals
    invoice.payments.append(payment)
    calculate_invoice_totals(invoice)
    
    await db.commit()
    await db.refresh(payment)
    
    return payment


@router.get("/{invoice_id}/payments", response_model=list[PaymentResponse])
async def list_payments(
    invoice_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """List payments for an invoice."""
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    result = await db.execute(
        select(Invoice)
        .where(Invoice.id == invoice_id, Invoice.job_id.in_(jobs_query))
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    result = await db.execute(
        select(Payment)
        .where(Payment.invoice_id == invoice_id)
        .order_by(Payment.payment_date.desc())
    )
    return result.scalars().all()


# ============ Actions ============

@router.post("/{invoice_id}/send", response_model=InvoiceResponse)
async def send_invoice(
    invoice_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Send invoice to customer."""
    # Get job IDs for this organization
    jobs_query = select(Job.id).where(Job.organization_id == organization.id)
    
    result = await db.execute(
        select(Invoice)
        .options(
            selectinload(Invoice.line_items),
            selectinload(Invoice.payments),
        )
        .where(Invoice.id == invoice_id, Invoice.job_id.in_(jobs_query))
    )
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice.status = InvoiceStatus.SENT
    invoice.sent_at = datetime.utcnow()
    
    # TODO: Actually send email with invoice and payment link
    # TODO: Create Stripe payment link
    
    await db.commit()
    await db.refresh(invoice)
    
    return invoice
