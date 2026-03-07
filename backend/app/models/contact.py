"""Contact and Property models - CRM functionality."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.db.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.job import Job


class ContactType(str, enum.Enum):
    """Type of contact."""
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    INSURANCE = "insurance"
    SUBCONTRACTOR = "subcontractor"
    SUPPLIER = "supplier"


class LeadSource(str, enum.Enum):
    """Source of the lead."""
    WEBSITE = "website"
    REFERRAL = "referral"
    ANGI = "angi"
    HOMEADVISOR = "homeadvisor"
    GOOGLE = "google"
    FACEBOOK = "facebook"
    DOOR_KNOCK = "door_knock"
    STORM_CHASE = "storm_chase"
    PHONE = "phone"
    OTHER = "other"


class Contact(Base, UUIDMixin, TimestampMixin):
    """Contact/Customer in the CRM."""

    __tablename__ = "contacts"

    # Organization
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Basic Info
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    company_name: Mapped[str | None] = mapped_column(String(255))
    
    # Contact Info
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    phone: Mapped[str | None] = mapped_column(String(50))
    phone_secondary: Mapped[str | None] = mapped_column(String(50))
    
    # Type & Source
    contact_type: Mapped[ContactType] = mapped_column(
        SQLEnum(ContactType), default=ContactType.RESIDENTIAL
    )
    lead_source: Mapped[LeadSource | None] = mapped_column(SQLEnum(LeadSource))
    lead_source_detail: Mapped[str | None] = mapped_column(String(255))  # e.g., "John Smith"
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    tags: Mapped[str | None] = mapped_column(Text)  # JSON array of tags
    
    # Notes
    notes: Mapped[str | None] = mapped_column(Text)

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="contacts")
    properties: Mapped[list["Property"]] = relationship(
        "Property", back_populates="contact", cascade="all, delete-orphan"
    )
    jobs: Mapped[list["Job"]] = relationship("Job", back_populates="contact")

    @property
    def full_name(self) -> str:
        """Get contact's full name."""
        return f"{self.first_name} {self.last_name}"

    @property
    def display_name(self) -> str:
        """Get display name (company or full name)."""
        if self.company_name:
            return self.company_name
        return self.full_name

    def __repr__(self) -> str:
        return f"<Contact {self.full_name}>"


class Property(Base, UUIDMixin, TimestampMixin):
    """Property/Address associated with a contact."""

    __tablename__ = "properties"

    # Contact
    contact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contacts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Address
    address_line1: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line2: Mapped[str | None] = mapped_column(String(255))
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(50), nullable=False)
    zip_code: Mapped[str] = mapped_column(String(20), nullable=False)
    country: Mapped[str] = mapped_column(String(50), default="US")
    
    # Coordinates (for maps/directions)
    latitude: Mapped[float | None] = mapped_column()
    longitude: Mapped[float | None] = mapped_column()
    
    # Property Details
    property_type: Mapped[str] = mapped_column(String(50), default="residential")
    is_primary: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Roof Details (from measurements)
    roof_area_sqft: Mapped[float | None] = mapped_column()
    roof_pitch: Mapped[str | None] = mapped_column(String(20))  # e.g., "6/12"
    roof_type: Mapped[str | None] = mapped_column(String(100))  # e.g., "asphalt shingle"
    stories: Mapped[int | None] = mapped_column()
    
    # EagleView/HOVER Data
    measurement_report_id: Mapped[str | None] = mapped_column(String(255))
    measurement_report_url: Mapped[str | None] = mapped_column(String(500))
    last_measurement_date: Mapped[datetime | None] = mapped_column()

    # Relationships
    contact: Mapped["Contact"] = relationship("Contact", back_populates="properties")
    jobs: Mapped[list["Job"]] = relationship("Job", back_populates="job_property")

    @property
    def full_address(self) -> str:
        """Get formatted full address."""
        parts = [self.address_line1]
        if self.address_line2:
            parts.append(self.address_line2)
        parts.append(f"{self.city}, {self.state} {self.zip_code}")
        return ", ".join(parts)

    def __repr__(self) -> str:
        return f"<Property {self.address_line1}>"
