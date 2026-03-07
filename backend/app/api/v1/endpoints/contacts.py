"""Contact management endpoints."""

import json
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.api.v1.deps import CurrentUser, CurrentOrganization, DBSession
from app.models.contact import Contact, Property
from app.schemas.contact import (
    ContactCreate, ContactUpdate, ContactResponse, ContactList,
    PropertyCreate, PropertyUpdate, PropertyResponse
)

router = APIRouter()


@router.get("", response_model=ContactList)
async def list_contacts(
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    contact_type: str | None = None,
    is_active: bool | None = None,
):
    """List contacts with pagination and filtering."""
    query = (
        select(Contact)
        .options(selectinload(Contact.properties))
        .where(Contact.organization_id == organization.id)
    )
    
    # Apply filters
    if search:
        search_filter = or_(
            Contact.first_name.ilike(f"%{search}%"),
            Contact.last_name.ilike(f"%{search}%"),
            Contact.email.ilike(f"%{search}%"),
            Contact.phone.ilike(f"%{search}%"),
            Contact.company_name.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
    
    if contact_type:
        query = query.where(Contact.contact_type == contact_type)
    
    if is_active is not None:
        query = query.where(Contact.is_active == is_active)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0
    
    # Apply pagination
    query = query.order_by(Contact.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    contacts = result.scalars().all()
    
    return ContactList(
        items=contacts,
        total=total,
        page=page,
        page_size=page_size,
        pages=(total + page_size - 1) // page_size,
    )


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    data: ContactCreate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Create a new contact."""
    # Create contact
    contact = Contact(
        organization_id=organization.id,
        first_name=data.first_name,
        last_name=data.last_name,
        company_name=data.company_name,
        email=data.email,
        phone=data.phone,
        phone_secondary=data.phone_secondary,
        contact_type=data.contact_type,
        lead_source=data.lead_source,
        lead_source_detail=data.lead_source_detail,
        notes=data.notes,
        tags=json.dumps(data.tags) if data.tags else None,
    )
    db.add(contact)
    await db.flush()
    
    # Create properties
    if data.properties:
        for prop_data in data.properties:
            property = Property(
                contact_id=contact.id,
                **prop_data.model_dump(),
            )
            db.add(property)
    
    await db.commit()
    
    # Reload with relationships
    result = await db.execute(
        select(Contact)
        .options(selectinload(Contact.properties))
        .where(Contact.id == contact.id)
    )
    return result.scalar_one()


@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Get a specific contact."""
    result = await db.execute(
        select(Contact)
        .options(selectinload(Contact.properties))
        .where(Contact.id == contact_id, Contact.organization_id == organization.id)
    )
    contact = result.scalar_one_or_none()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )
    
    return contact


@router.patch("/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: UUID,
    data: ContactUpdate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Update a contact."""
    result = await db.execute(
        select(Contact)
        .options(selectinload(Contact.properties))
        .where(Contact.id == contact_id, Contact.organization_id == organization.id)
    )
    contact = result.scalar_one_or_none()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )
    
    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    if "tags" in update_data:
        update_data["tags"] = json.dumps(update_data["tags"]) if update_data["tags"] else None
    
    for field, value in update_data.items():
        setattr(contact, field, value)
    
    await db.commit()
    await db.refresh(contact)
    
    return contact


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Delete a contact."""
    result = await db.execute(
        select(Contact)
        .where(Contact.id == contact_id, Contact.organization_id == organization.id)
    )
    contact = result.scalar_one_or_none()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )
    
    await db.delete(contact)
    await db.commit()


# Property endpoints
@router.post("/{contact_id}/properties", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def add_property(
    contact_id: UUID,
    data: PropertyCreate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Add a property to a contact."""
    # Verify contact exists and belongs to organization
    result = await db.execute(
        select(Contact)
        .where(Contact.id == contact_id, Contact.organization_id == organization.id)
    )
    contact = result.scalar_one_or_none()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )
    
    property = Property(
        contact_id=contact_id,
        **data.model_dump(),
    )
    db.add(property)
    await db.commit()
    await db.refresh(property)
    
    return property


@router.patch("/{contact_id}/properties/{property_id}", response_model=PropertyResponse)
async def update_property(
    contact_id: UUID,
    property_id: UUID,
    data: PropertyUpdate,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Update a property."""
    # Verify contact exists and belongs to organization
    result = await db.execute(
        select(Contact)
        .where(Contact.id == contact_id, Contact.organization_id == organization.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )
    
    result = await db.execute(
        select(Property)
        .where(Property.id == property_id, Property.contact_id == contact_id)
    )
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )
    
    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(property, field, value)
    
    await db.commit()
    await db.refresh(property)
    
    return property


@router.delete("/{contact_id}/properties/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    contact_id: UUID,
    property_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    organization: CurrentOrganization,
):
    """Delete a property."""
    # Verify contact exists and belongs to organization
    result = await db.execute(
        select(Contact)
        .where(Contact.id == contact_id, Contact.organization_id == organization.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )
    
    result = await db.execute(
        select(Property)
        .where(Property.id == property_id, Property.contact_id == contact_id)
    )
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )
    
    await db.delete(property)
    await db.commit()
