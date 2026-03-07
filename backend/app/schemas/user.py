"""User schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    first_name: str
    last_name: str
    phone: str | None = None
    role: str = "member"


class UserCreate(UserBase):
    """Create user schema."""
    password: str
    organization_id: UUID | None = None


class UserUpdate(BaseModel):
    """Update user schema."""
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
    email_notifications: bool | None = None
    sms_notifications: bool | None = None
    push_notifications: bool | None = None


class UserResponse(UserBase):
    """User response schema."""
    id: UUID
    organization_id: UUID
    is_active: bool
    is_verified: bool
    avatar_url: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    """User in database (includes hashed password)."""
    hashed_password: str
