/**
 * Job Types for Lisa Roofing CRM
 * 
 * Core data models for the jobs/projects pipeline
 */

import type { JobStatus } from '@/components/ui/Badge'
export type { JobStatus }

/**
 * Customer contact information
 */
export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  secondaryPhone?: string
}

/**
 * Property address
 */
export interface Address {
  street: string
  city: string
  state: string
  zip: string
  lat?: number
  lng?: number
}

/**
 * Task/checklist item for a job
 */
export interface JobTask {
  id: string
  title: string
  completed: boolean
  completedAt?: string
  completedBy?: string
  dueDate?: string
  assignedTo?: string
}

/**
 * Note/comment on a job
 */
export interface JobNote {
  id: string
  content: string
  createdAt: string
  createdBy: string
  isPinned?: boolean
}

/**
 * Document attached to a job
 */
export interface JobDocument {
  id: string
  name: string
  type: 'contract' | 'estimate' | 'invoice' | 'permit' | 'insurance' | 'other'
  url: string
  uploadedAt: string
  uploadedBy: string
  size: number // bytes
}

/**
 * Photo attached to a job
 */
export interface JobPhoto {
  id: string
  url: string
  thumbnailUrl: string
  caption?: string
  category: 'before' | 'during' | 'after' | 'damage' | 'materials' | 'other'
  uploadedAt: string
  uploadedBy: string
}

/**
 * Status change history entry
 */
export interface StatusHistoryEntry {
  id: string
  fromStatus: JobStatus | null
  toStatus: JobStatus
  changedAt: string
  changedBy: string
  note?: string
}

/**
 * Job/Project - Core entity
 */
export interface Job {
  id: string
  
  // Basic info
  title: string
  description?: string
  jobNumber: string // e.g., "J-2024-0042"
  
  // Status & pipeline
  status: JobStatus
  statusChangedAt: string // When status last changed
  statusHistory: StatusHistoryEntry[]
  
  // Customer & location
  customer: Customer
  address: Address
  
  // Financials
  estimateAmount?: number
  contractAmount?: number
  invoicedAmount?: number
  paidAmount?: number
  
  // Scheduling
  scheduledDate?: string
  scheduledTime?: string
  estimatedDuration?: number // hours
  
  // Related data
  tasks: JobTask[]
  notes: JobNote[]
  documents: JobDocument[]
  photos: JobPhoto[]
  
  // Metadata
  source?: 'referral' | 'website' | 'phone' | 'door-knock' | 'storm-chase' | 'other'
  tags: string[]
  assignedTo?: string // crew/salesperson ID
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Job summary for list/board views (lighter payload)
 */
export interface JobSummary {
  id: string
  title: string
  jobNumber: string
  status: JobStatus
  statusChangedAt: string
  customerName: string
  address: string // Formatted single line
  addressLat?: number
  addressLng?: number
  estimateAmount?: number
  scheduledDate?: string
  taskCount: number
  completedTaskCount: number
  photoCount: number
  tags: string[]
}

/**
 * Pipeline column definition
 */
export interface PipelineColumn {
  id: string
  title: string
  status: JobStatus
  color: string
  jobs: JobSummary[]
  totalValue: number
}

/**
 * Calculate days since status change
 */
export function getDaysInStatus(statusChangedAt: string): number {
  const changed = new Date(statusChangedAt)
  const now = new Date()
  const diffMs = now.getTime() - changed.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Format address as single line
 */
export function formatAddress(address: Address): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`
}

/**
 * Get Google Maps directions URL
 */
export function getDirectionsUrl(address: Address): string {
  const query = encodeURIComponent(formatAddress(address))
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`
}

/**
 * Get Google Maps URL for coordinates
 */
export function getMapsUrl(address: Address): string {
  if (address.lat && address.lng) {
    return `https://www.google.com/maps?q=${address.lat},${address.lng}`
  }
  const query = encodeURIComponent(formatAddress(address))
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}
