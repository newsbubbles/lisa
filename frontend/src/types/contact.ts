/**
 * Contact Types for Lisa CRM
 * 
 * Defines all contact-related types including customers, leads, vendors, and subcontractors.
 */

// Contact type/role
export type ContactType = 'customer' | 'lead' | 'vendor' | 'subcontractor'

// Contact source (how they found us)
export type ContactSource = 
  | 'referral'
  | 'website'
  | 'google'
  | 'facebook'
  | 'instagram'
  | 'door_knock'
  | 'yard_sign'
  | 'home_show'
  | 'insurance'
  | 'other'

// Property types
export type PropertyType = 'residential' | 'commercial' | 'multi_family' | 'industrial'

// Roof types
export type RoofType = 
  | 'asphalt_shingle'
  | 'metal'
  | 'tile'
  | 'slate'
  | 'flat'
  | 'tpo'
  | 'epdm'
  | 'modified_bitumen'
  | 'cedar_shake'
  | 'synthetic'
  | 'other'

// Contact status
export type ContactStatus = 'active' | 'inactive' | 'do_not_contact'

// Communication preference
export type CommunicationPreference = 'phone' | 'text' | 'email' | 'any'

/**
 * Property address associated with a contact
 */
export interface Property {
  id: string
  street: string
  street2?: string
  city: string
  state: string
  zip: string
  country?: string
  isPrimary: boolean
  propertyType?: PropertyType
  roofType?: RoofType
  roofAge?: number // years
  squareFootage?: number
  stories?: number
  lastInspectionDate?: string
  notes?: string
  latitude?: number
  longitude?: number
}

/**
 * Contact note/comment
 */
export interface ContactNote {
  id: string
  contactId: string
  content: string
  createdAt: string
  createdBy: string
  createdByName?: string
  isPinned?: boolean
}

/**
 * Activity log entry for a contact
 */
export interface ContactActivity {
  id: string
  contactId: string
  type: 'call' | 'email' | 'text' | 'meeting' | 'note' | 'status_change' | 'job_created' | 'estimate_sent' | 'invoice_sent'
  description: string
  createdAt: string
  createdBy?: string
  createdByName?: string
  metadata?: Record<string, any>
}

/**
 * Related job summary (for display in contact details)
 */
export interface RelatedJob {
  id: string
  jobNumber: string
  name: string
  status: string
  propertyAddress: string
  totalAmount?: number
  createdAt: string
  completedAt?: string
}

/**
 * Related estimate summary
 */
export interface RelatedEstimate {
  id: string
  estimateNumber: string
  name: string
  status: string
  totalAmount: number
  createdAt: string
  sentAt?: string
  acceptedAt?: string
}

/**
 * Related invoice summary
 */
export interface RelatedInvoice {
  id: string
  invoiceNumber: string
  status: string
  totalAmount: number
  dueDate: string
  paidAt?: string
}

/**
 * Main Contact interface
 */
export interface Contact {
  id: string
  
  // Basic info
  firstName: string
  lastName: string
  displayName?: string // computed: firstName + lastName or company
  email?: string
  phone?: string
  mobilePhone?: string
  workPhone?: string
  fax?: string
  
  // Company info (for commercial/vendor/subcontractor)
  company?: string
  jobTitle?: string
  
  // Classification
  type: ContactType
  status: ContactStatus
  source?: ContactSource
  sourceDetails?: string // e.g., "Referred by John Smith"
  
  // Preferences
  communicationPreference?: CommunicationPreference
  doNotCall?: boolean
  doNotEmail?: boolean
  doNotText?: boolean
  
  // Organization
  tags: string[]
  assignedTo?: string // user ID
  assignedToName?: string
  
  // Properties
  properties: Property[]
  
  // Insurance info (for insurance claims)
  insuranceCompany?: string
  insuranceClaimNumber?: string
  insuranceAdjuster?: string
  insuranceAdjusterPhone?: string
  
  // Subcontractor specific
  specialty?: string // e.g., "Gutters", "HVAC", "Electrical"
  licenseNumber?: string
  insuranceExpiration?: string
  
  // Vendor specific
  vendorCategory?: string // e.g., "Materials", "Equipment", "Services"
  accountNumber?: string
  paymentTerms?: string
  
  // Financial
  creditLimit?: number
  balance?: number
  lifetimeValue?: number
  
  // Metadata
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  lastContactedAt?: string
}

/**
 * Contact with related data (for detail view)
 */
export interface ContactWithRelations extends Contact {
  recentNotes?: ContactNote[]
  recentActivity?: ContactActivity[]
  relatedJobs?: RelatedJob[]
  relatedEstimates?: RelatedEstimate[]
  relatedInvoices?: RelatedInvoice[]
  jobCount?: number
  estimateCount?: number
  invoiceCount?: number
}

/**
 * Contact creation/update payload
 */
export interface ContactInput {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  mobilePhone?: string
  workPhone?: string
  company?: string
  jobTitle?: string
  type: ContactType
  status?: ContactStatus
  source?: ContactSource
  sourceDetails?: string
  communicationPreference?: CommunicationPreference
  tags?: string[]
  assignedTo?: string
  notes?: string
  
  // Insurance
  insuranceCompany?: string
  insuranceClaimNumber?: string
  insuranceAdjuster?: string
  insuranceAdjusterPhone?: string
  
  // Subcontractor
  specialty?: string
  licenseNumber?: string
  insuranceExpiration?: string
  
  // Vendor
  vendorCategory?: string
  accountNumber?: string
  paymentTerms?: string
  
  // Primary property (optional on create)
  property?: Omit<Property, 'id' | 'isPrimary'>
}

/**
 * Contact list filters
 */
export interface ContactFilters {
  search?: string
  type?: ContactType[]
  status?: ContactStatus[]
  source?: ContactSource[]
  tags?: string[]
  assignedTo?: string
  hasJobs?: boolean
  hasOpenJobs?: boolean
  createdAfter?: string
  createdBefore?: string
  lastContactedAfter?: string
  lastContactedBefore?: string
}

/**
 * Contact list sort options
 */
export type ContactSortField = 'name' | 'company' | 'createdAt' | 'lastContactedAt' | 'lifetimeValue'
export type ContactSortOrder = 'asc' | 'desc'

export interface ContactSort {
  field: ContactSortField
  order: ContactSortOrder
}

/**
 * Paginated contact list response
 */
export interface ContactListResponse {
  items: Contact[]
  total: number
  page: number
  pageSize: number
  pages: number
}
