"""Estimate schemas."""

from datetime import datetime, date
from uuid import UUID

from pydantic import BaseModel

from app.models.estimate import EstimateStatus, PresentationType


# Estimate Line Item Schemas
class EstimateLineItemBase(BaseModel):
    """Base estimate line item schema."""
    name: str
    description: str | None = None
    category: str = "materials"
    quantity: float = 1.0
    unit: str = "each"
    unit_price: float = 0.0
    unit_cost: float = 0.0
    is_optional: bool = False
    is_selected: bool = True
    show_on_proposal: bool = True
    order: int = 0
    option: str | None = None


class EstimateLineItemCreate(EstimateLineItemBase):
    """Create estimate line item schema."""
    pass


class EstimateLineItemUpdate(BaseModel):
    """Update estimate line item schema."""
    name: str | None = None
    description: str | None = None
    category: str | None = None
    quantity: float | None = None
    unit: str | None = None
    unit_price: float | None = None
    unit_cost: float | None = None
    is_optional: bool | None = None
    is_selected: bool | None = None
    show_on_proposal: bool | None = None
    order: int | None = None
    option: str | None = None


class EstimateLineItemResponse(EstimateLineItemBase):
    """Estimate line item response schema."""
    id: UUID
    estimate_id: UUID
    total: float
    total_cost: float
    created_at: datetime

    class Config:
        from_attributes = True


# Estimate Schemas
class EstimateBase(BaseModel):
    """Base estimate schema."""
    name: str = "Estimate"
    description: str | None = None
    presentation_type: PresentationType = PresentationType.SINGLE


class EstimateCreate(EstimateBase):
    """Create estimate schema."""
    job_id: UUID
    expires_at: date | None = None
    tax_rate: float = 0.0
    discount_amount: float = 0.0
    discount_percent: float = 0.0
    include_financing: bool = False
    financing_term_months: int | None = None
    financing_rate: float | None = None
    scope_of_work: str | None = None
    terms_and_conditions: str | None = None
    line_items: list[EstimateLineItemCreate] | None = None
    
    # Good/Better/Best
    good_description: str | None = None
    better_description: str | None = None
    best_description: str | None = None


class EstimateUpdate(BaseModel):
    """Update estimate schema."""
    name: str | None = None
    description: str | None = None
    status: EstimateStatus | None = None
    presentation_type: PresentationType | None = None
    selected_option: str | None = None
    expires_at: date | None = None
    tax_rate: float | None = None
    discount_amount: float | None = None
    discount_percent: float | None = None
    include_financing: bool | None = None
    financing_term_months: int | None = None
    financing_rate: float | None = None
    scope_of_work: str | None = None
    terms_and_conditions: str | None = None
    good_description: str | None = None
    better_description: str | None = None
    best_description: str | None = None


class EstimateResponse(EstimateBase):
    """Estimate response schema."""
    id: UUID
    job_id: UUID
    estimate_number: str
    status: EstimateStatus
    selected_option: str | None
    
    # Dates
    sent_at: datetime | None
    viewed_at: datetime | None
    approved_at: datetime | None
    expires_at: date | None
    
    # Pricing
    subtotal: float
    tax_rate: float
    tax_amount: float
    discount_amount: float
    discount_percent: float
    total: float
    cost: float
    profit_margin: float
    profit_amount: float
    
    # Good/Better/Best
    good_total: float | None
    good_description: str | None
    better_total: float | None
    better_description: str | None
    best_total: float | None
    best_description: str | None
    
    # Financing
    include_financing: bool
    financing_term_months: int | None
    financing_rate: float | None
    monthly_payment: float | None
    
    # Signature
    is_signed: bool
    signature_url: str | None
    signed_by_name: str | None
    signed_at: datetime | None
    
    # Content
    scope_of_work: str | None
    terms_and_conditions: str | None
    measurements: dict | None
    
    # URLs
    pdf_url: str | None
    share_token: str | None
    
    # Line items
    line_items: list[EstimateLineItemResponse]
    
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Estimate Template Schemas
class EstimateTemplateCreate(BaseModel):
    """Create estimate template schema."""
    name: str
    description: str | None = None
    category: str = "general"
    line_items: list[dict] | None = None
    scope_of_work: str | None = None
    terms_and_conditions: str | None = None
    is_default: bool = False


class EstimateTemplateResponse(BaseModel):
    """Estimate template response schema."""
    id: UUID
    organization_id: UUID
    name: str
    description: str | None
    category: str
    line_items: list | None
    scope_of_work: str | None
    terms_and_conditions: str | None
    is_active: bool
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True
