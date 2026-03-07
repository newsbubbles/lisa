"""Estimate model - quoting and proposals."""

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
    from app.models.job import Job


class EstimateStatus(str, enum.Enum):
    """Estimate status."""
    DRAFT = "draft"
    SENT = "sent"
    VIEWED = "viewed"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


class PresentationType(str, enum.Enum):
    """How the estimate is presented to customer."""
    SINGLE = "single"  # Single price
    GOOD_BETTER_BEST = "good_better_best"  # 3 options
    ITEMIZED = "itemized"  # Line by line


class Estimate(Base, UUIDMixin, TimestampMixin):
    """Estimate/Quote for a job."""

    __tablename__ = "estimates"

    # Job
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Basic Info
    estimate_number: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), default="Estimate")
    description: Mapped[str | None] = mapped_column(Text)
    
    # Status
    status: Mapped[EstimateStatus] = mapped_column(
        SQLEnum(EstimateStatus), default=EstimateStatus.DRAFT
    )
    
    # Presentation
    presentation_type: Mapped[PresentationType] = mapped_column(
        SQLEnum(PresentationType), default=PresentationType.SINGLE
    )
    selected_option: Mapped[str | None] = mapped_column(String(50))  # good, better, best
    
    # Dates
    sent_at: Mapped[datetime | None] = mapped_column()
    viewed_at: Mapped[datetime | None] = mapped_column()
    approved_at: Mapped[datetime | None] = mapped_column()
    expires_at: Mapped[date | None] = mapped_column(Date)
    
    # Pricing - Primary (or "Better" option)
    subtotal: Mapped[float] = mapped_column(Float, default=0.0)
    tax_rate: Mapped[float] = mapped_column(Float, default=0.0)  # Percentage
    tax_amount: Mapped[float] = mapped_column(Float, default=0.0)
    discount_amount: Mapped[float] = mapped_column(Float, default=0.0)
    discount_percent: Mapped[float] = mapped_column(Float, default=0.0)
    total: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Cost (internal - for margin calculation)
    cost: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Good/Better/Best Options
    good_total: Mapped[float | None] = mapped_column(Float)
    good_description: Mapped[str | None] = mapped_column(Text)
    better_total: Mapped[float | None] = mapped_column(Float)
    better_description: Mapped[str | None] = mapped_column(Text)
    best_total: Mapped[float | None] = mapped_column(Float)
    best_description: Mapped[str | None] = mapped_column(Text)
    
    # Financing
    include_financing: Mapped[bool] = mapped_column(Boolean, default=False)
    financing_term_months: Mapped[int | None] = mapped_column(Integer)
    financing_rate: Mapped[float | None] = mapped_column(Float)  # APR
    monthly_payment: Mapped[float | None] = mapped_column(Float)
    
    # Signature
    is_signed: Mapped[bool] = mapped_column(Boolean, default=False)
    signature_url: Mapped[str | None] = mapped_column(String(500))
    signed_by_name: Mapped[str | None] = mapped_column(String(255))
    signed_at: Mapped[datetime | None] = mapped_column()
    signed_ip: Mapped[str | None] = mapped_column(String(50))
    
    # Scope of Work
    scope_of_work: Mapped[str | None] = mapped_column(Text)  # What's included
    terms_and_conditions: Mapped[str | None] = mapped_column(Text)
    
    # Measurements (from EagleView/HOVER)
    measurements: Mapped[dict | None] = mapped_column(JSONB)
    
    # PDF
    pdf_url: Mapped[str | None] = mapped_column(String(500))
    
    # Share Link
    share_token: Mapped[str | None] = mapped_column(String(100), unique=True)

    # Relationships
    job: Mapped["Job"] = relationship("Job", back_populates="estimates")
    line_items: Mapped[list["EstimateLineItem"]] = relationship(
        "EstimateLineItem", back_populates="estimate", cascade="all, delete-orphan",
        order_by="EstimateLineItem.order"
    )

    @property
    def profit_margin(self) -> float:
        """Calculate profit margin percentage."""
        if self.total == 0:
            return 0.0
        return ((self.total - self.cost) / self.total) * 100

    @property
    def profit_amount(self) -> float:
        """Calculate profit amount."""
        return self.total - self.cost

    def __repr__(self) -> str:
        return f"<Estimate {self.estimate_number}>"


class EstimateLineItem(Base, UUIDMixin, TimestampMixin):
    """Line item in an estimate."""

    __tablename__ = "estimate_line_items"

    estimate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("estimates.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Item Info
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(100), default="materials")  # materials, labor, disposal, permits, other
    
    # Pricing
    quantity: Mapped[float] = mapped_column(Float, default=1.0)
    unit: Mapped[str] = mapped_column(String(50), default="each")  # each, sq ft, linear ft, square, bundle
    unit_price: Mapped[float] = mapped_column(Float, default=0.0)
    total: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Cost (internal)
    unit_cost: Mapped[float] = mapped_column(Float, default=0.0)
    total_cost: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Display
    is_optional: Mapped[bool] = mapped_column(Boolean, default=False)
    is_selected: Mapped[bool] = mapped_column(Boolean, default=True)  # For optional items
    show_on_proposal: Mapped[bool] = mapped_column(Boolean, default=True)
    order: Mapped[int] = mapped_column(Integer, default=0)
    
    # Good/Better/Best (which option this belongs to)
    option: Mapped[str | None] = mapped_column(String(50))  # good, better, best, or null for all

    # Relationships
    estimate: Mapped["Estimate"] = relationship("Estimate", back_populates="line_items")

    def __repr__(self) -> str:
        return f"<EstimateLineItem {self.name}>"


class EstimateTemplate(Base, UUIDMixin, TimestampMixin):
    """Reusable estimate template."""

    __tablename__ = "estimate_templates"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(100), default="general")  # asphalt, metal, flat, repair
    
    # Template Data
    line_items: Mapped[list | None] = mapped_column(JSONB)  # Array of line item templates
    scope_of_work: Mapped[str | None] = mapped_column(Text)
    terms_and_conditions: Mapped[str | None] = mapped_column(Text)
    
    # Settings
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="estimate_templates"
    )

    def __repr__(self) -> str:
        return f"<EstimateTemplate {self.name}>"
