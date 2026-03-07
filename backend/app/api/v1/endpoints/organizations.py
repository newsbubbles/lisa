"""Organization management endpoints."""

from fastapi import APIRouter, HTTPException, status

from app.api.v1.deps import CurrentUser, CurrentOrganization, DBSession, AdminUser
from app.schemas.organization import OrganizationUpdate, OrganizationResponse

router = APIRouter()


@router.get("/current", response_model=OrganizationResponse)
async def get_current_organization(
    organization: CurrentOrganization,
):
    """Get current user's organization."""
    return organization


@router.patch("/current", response_model=OrganizationResponse)
async def update_organization(
    data: OrganizationUpdate,
    db: DBSession,
    current_user: AdminUser,
    organization: CurrentOrganization,
):
    """Update organization settings (admin only)."""
    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(organization, field, value)
    
    await db.commit()
    await db.refresh(organization)
    
    return organization
