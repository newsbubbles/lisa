"""User management endpoints."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.v1.deps import CurrentUser, CurrentOrganization, DBSession, AdminUser
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse

router = APIRouter()


@router.get("", response_model=list[UserResponse])
async def list_users(
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """List all users in the organization."""
    result = await db.execute(
        select(User)
        .where(User.organization_id == organization.id)
        .order_by(User.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=UserResponse)
async def create_user(
    data: UserCreate,
    db: DBSession,
    current_user: AdminUser,
    organization: CurrentOrganization,
):
    """Create a new user (admin only)."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Check user limit
    result = await db.execute(
        select(User).where(User.organization_id == organization.id)
    )
    user_count = len(result.scalars().all())
    if user_count >= organization.max_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User limit reached ({organization.max_users}). Upgrade your plan to add more users.",
        )
    
    user = User(
        organization_id=organization.id,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        role=data.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Get a specific user."""
    result = await db.execute(
        select(User)
        .where(User.id == user_id, User.organization_id == organization.id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    data: UserUpdate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Update a user. Users can update themselves, admins can update anyone."""
    result = await db.execute(
        select(User)
        .where(User.id == user_id, User.organization_id == organization.id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Only allow self-update or admin update
    if current_user.id != user_id and current_user.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other users",
        )
    
    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    await db.commit()
    await db.refresh(user)
    
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    db: DBSession,
    current_user: AdminUser,
    organization: CurrentOrganization,
):
    """Delete a user (admin only)."""
    result = await db.execute(
        select(User)
        .where(User.id == user_id, User.organization_id == organization.id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Cannot delete yourself
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself",
        )
    
    # Cannot delete owner
    if user.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete organization owner",
        )
    
    await db.delete(user)
    await db.commit()
