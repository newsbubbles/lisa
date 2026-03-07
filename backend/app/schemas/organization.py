"""Organization schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class OrganizationBase(BaseModel):
    """Base organization schema."""
    name: str
    email: EmailStr | None = None
    phone: str | None = None
    website: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    country: str = "US"
    timezone: str = "America/Denver"
    currency: str = "USD"
    tax_rate: float = 0.0


class OrganizationCreate(OrganizationBase):
    """Create organization schema."""
    pass


class OrganizationUpdate(BaseModel):
    """Update organization schema."""
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    website: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    country: str | None = None
    logo_url: str | None = None
    primary_color: str | None = None
    timezone: str | None = None
    currency: str | None = None
    tax_rate: float | None = None


class OrganizationResponse(OrganizationBase):
    """Organization response schema."""
    id: UUID
    slug: str
    logo_url: str | None
    primary_color: str
    subscription_tier: str
    max_users: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
