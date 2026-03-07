/**
 * Store Exports
 *
 * Zustand stores for global state management
 */

export { useUIStore } from './uiStore'
export type { UIState } from './uiStore'

export { useAuthStore } from './auth'
export type { AuthState, User, RegisterData } from './auth'

export { useJobsStore } from './jobs'
export type { JobsState, JobsFilters } from './jobs'

export { useContactsStore } from './contacts'
export type { ContactsState, ContactsFilters, Contact, Property } from './contacts'

export { useEstimatesStore } from './estimates'
export type { EstimatesState, EstimatesFilters, Estimate, EstimateLineItem, EstimateTemplate, EstimateStatus } from './estimates'
