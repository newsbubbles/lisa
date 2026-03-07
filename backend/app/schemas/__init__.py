"""Pydantic schemas for API request/response validation."""

from app.schemas.auth import Token, TokenPayload, UserLogin, UserRegister
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserInDB
from app.schemas.organization import OrganizationCreate, OrganizationUpdate, OrganizationResponse
from app.schemas.contact import (
    ContactCreate, ContactUpdate, ContactResponse, ContactList,
    PropertyCreate, PropertyUpdate, PropertyResponse
)
from app.schemas.job import (
    JobCreate, JobUpdate, JobResponse, JobList, JobBoardResponse,
    JobNoteCreate, JobNoteResponse,
    JobTaskCreate, JobTaskUpdate, JobTaskResponse,
    JobStageCreate, JobStageUpdate, JobStageResponse
)
from app.schemas.estimate import (
    EstimateCreate, EstimateUpdate, EstimateResponse,
    EstimateLineItemCreate, EstimateLineItemUpdate, EstimateLineItemResponse,
    EstimateTemplateCreate, EstimateTemplateResponse
)
from app.schemas.invoice import (
    InvoiceCreate, InvoiceUpdate, InvoiceResponse,
    PaymentCreate, PaymentResponse
)

__all__ = [
    # Auth
    "Token", "TokenPayload", "UserLogin", "UserRegister",
    # User
    "UserCreate", "UserUpdate", "UserResponse", "UserInDB",
    # Organization
    "OrganizationCreate", "OrganizationUpdate", "OrganizationResponse",
    # Contact
    "ContactCreate", "ContactUpdate", "ContactResponse", "ContactList",
    "PropertyCreate", "PropertyUpdate", "PropertyResponse",
    # Job
    "JobCreate", "JobUpdate", "JobResponse", "JobList", "JobBoardResponse",
    "JobNoteCreate", "JobNoteResponse",
    "JobTaskCreate", "JobTaskUpdate", "JobTaskResponse",
    "JobStageCreate", "JobStageUpdate", "JobStageResponse",
    # Estimate
    "EstimateCreate", "EstimateUpdate", "EstimateResponse",
    "EstimateLineItemCreate", "EstimateLineItemUpdate", "EstimateLineItemResponse",
    "EstimateTemplateCreate", "EstimateTemplateResponse",
    # Invoice
    "InvoiceCreate", "InvoiceUpdate", "InvoiceResponse",
    "PaymentCreate", "PaymentResponse",
]
