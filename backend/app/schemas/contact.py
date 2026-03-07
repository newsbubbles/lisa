"""Contact and Property schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr

from app.models.contact import ContactType, LeadSource


# Property Schemas
class PropertyBase(BaseModel):
    """Base property schema."""
    address_line1: str
    address_line2: str | None = None
    city: str
    state: str
    zip_code: str
    country: str = "US"
    property_type: str = "residential"
    is_primary: bool = True


class PropertyCreate(PropertyBase):
    """Create property schema."""
    latitude: float | None = None
    longitude: float | None = None
    roof_area_sqft: float | None = None
    roof_pitch: str | None = None
    roof_type: str | None = None
    stories: int | None = None


class PropertyUpdate(BaseModel):
    """Update property schema."""
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    property_type: str | None = None
    is_primary: bool | None = None
    latitude: float | None = None
    longitude: float | None = None
    roof_area_sqft: float | None = None
    roof_pitch: str | None = None
    roof_type: str | None = None
    stories: int | None = None


class PropertyResponse(PropertyBase):
    """Property response schema."""
    id: UUID
    contact_id: UUID
    latitude: float | None
    longitude: float | None
    roof_area_sqft: float | None
    roof_pitch: str | None
    roof_type: str | None
    stories: int | None
    measurement_report_id: str | None
    measurement_report_url: str | None
    last_measurement_date: datetime | None
    full_address: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Contact Schemas
class ContactBase(BaseModel):
    """Base contact schema."""
    first_name: str
    last_name: str
    company_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    phone_secondary: str | None = None
    contact_type: ContactType = ContactType.RESIDENTIAL
    lead_source: LeadSource | None = None
    lead_source_detail: str | None = None
    notes: str | None = None


class ContactCreate(ContactBase):
    """Create contact schema."""
    properties: list[PropertyCreate] | None = None
    tags: list[str] | None = None


class ContactUpdate(BaseModel):
    """Update contact schema."""
    first_name: str | None = None
    last_name: str | None = None
    company_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    phone_secondary: str | None = None
    contact_type: ContactType | None = None
    lead_source: LeadSource | None = None
    lead_source_detail: str | None = None
    notes: str | None = None
    tags: list[str] | None = None
    is_active: bool | None = None


class ContactResponse(ContactBase):
    """Contact response schema."""
    id: UUID
    organization_id: UUID
    is_active: bool
    tags: str | None
    full_name: str
    display_name: str
    properties: list[PropertyResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ContactList(BaseModel):
    """Paginated contact list."""
    items: list[ContactResponse]
    total: int
    page: int
    page_size: int
    pages: int
