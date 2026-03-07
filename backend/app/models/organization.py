"""Organization model - multi-tenant support."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.contact import Contact
    from app.models.job import Job, JobStage
    from app.models.estimate import EstimateTemplate


class Organization(Base, UUIDMixin, TimestampMixin):
    """Organization/Company that uses Lisa."""

    __tablename__ = "organizations"

    # Basic Info
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    
    # Contact Info
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    website: Mapped[str | None] = mapped_column(String(255))
    
    # Address
    address_line1: Mapped[str | None] = mapped_column(String(255))
    address_line2: Mapped[str | None] = mapped_column(String(255))
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(50))
    zip_code: Mapped[str | None] = mapped_column(String(20))
    country: Mapped[str] = mapped_column(String(50), default="US")
    
    # Branding
    logo_url: Mapped[str | None] = mapped_column(String(500))
    primary_color: Mapped[str] = mapped_column(String(7), default="#2563EB")
    
    # Settings
    timezone: Mapped[str] = mapped_column(String(50), default="America/Denver")
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    tax_rate: Mapped[float] = mapped_column(default=0.0)  # Default tax rate %
    
    # Subscription
    subscription_tier: Mapped[str] = mapped_column(String(50), default="starter")
    max_users: Mapped[int] = mapped_column(Integer, default=2)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Integration Keys (encrypted in production)
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255))
    quickbooks_realm_id: Mapped[str | None] = mapped_column(String(255))
    eagleview_account_id: Mapped[str | None] = mapped_column(String(255))
    
    # Relationships
    users: Mapped[list["User"]] = relationship("User", back_populates="organization")
    contacts: Mapped[list["Contact"]] = relationship("Contact", back_populates="organization")
    jobs: Mapped[list["Job"]] = relationship("Job", back_populates="organization")
    job_stages: Mapped[list["JobStage"]] = relationship("JobStage", back_populates="organization")
    estimate_templates: Mapped[list["EstimateTemplate"]] = relationship(
        "EstimateTemplate", back_populates="organization"
    )

    def __repr__(self) -> str:
        return f"<Organization {self.name}>"
