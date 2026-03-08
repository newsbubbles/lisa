"""Invoice and Payment schemas."""

from datetime import datetime, date
from uuid import UUID

from pydantic import BaseModel

from app.models.invoice import InvoiceStatus, PaymentMethod


# Payment Schemas
class PaymentCreate(BaseModel):
    """Create payment schema."""
    amount: float
    payment_date: date | None = None
    payment_method: PaymentMethod = PaymentMethod.CARD
    reference_number: str | None = None
    notes: str | None = None


class PaymentResponse(BaseModel):
    """Payment response schema."""
    id: UUID
    invoice_id: UUID
    amount: float
    payment_date: date
    payment_method: PaymentMethod
    reference_number: str | None
    notes: str | None
    stripe_payment_id: str | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# Invoice Line Item Schemas
class InvoiceLineItemCreate(BaseModel):
    """Create invoice line item schema."""
    description: str
    quantity: float = 1.0
    unit_price: float = 0.0
    order: int = 0


class InvoiceLineItemResponse(BaseModel):
    """Invoice line item response schema."""
    id: UUID
    invoice_id: UUID
    description: str
    quantity: float
    unit_price: float
    total: float
    order: int

    class Config:
        from_attributes = True


# Invoice Schemas
class InvoiceCreate(BaseModel):
    """Create invoice schema."""
    job_id: UUID
    invoice_date: date | None = None
    due_date: date | None = None
    tax_rate: float = 0.0
    discount_amount: float = 0.0
    notes: str | None = None
    terms: str | None = None
    line_items: list[InvoiceLineItemCreate] | None = None


class InvoiceUpdate(BaseModel):
    """Update invoice schema."""
    status: InvoiceStatus | None = None
    invoice_date: date | None = None
    due_date: date | None = None
    tax_rate: float | None = None
    discount_amount: float | None = None
    notes: str | None = None
    terms: str | None = None


class JobSummaryForInvoice(BaseModel):
    """Minimal job info for invoice display."""
    id: UUID
    title: str
    job_number: str
    customer_name: str | None = None
    customer_email: str | None = None
    property_address: str | None = None

    class Config:
        from_attributes = True


class InvoiceResponse(BaseModel):
    """Invoice response schema."""
    id: UUID
    job_id: UUID
    invoice_number: str
    status: InvoiceStatus
    
    # Dates
    invoice_date: date
    due_date: date | None
    sent_at: datetime | None
    paid_at: datetime | None
    
    # Amounts
    subtotal: float
    tax_rate: float
    tax_amount: float
    discount_amount: float
    total: float
    amount_paid: float
    balance_due: float
    
    # Content
    notes: str | None
    terms: str | None
    
    # URLs
    pdf_url: str | None
    payment_link: str | None
    
    # Integration
    stripe_invoice_id: str | None
    quickbooks_invoice_id: str | None
    quickbooks_sync_status: str | None
    
    # Related
    line_items: list[InvoiceLineItemResponse]
    payments: list[PaymentResponse]
    job: JobSummaryForInvoice | None = None
    
    is_overdue: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
