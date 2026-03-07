/**
 * Estimates Store - Estimate state management
 *
 * Manages estimates list, filtering, and CRUD operations.
 */

import { create } from 'zustand'
import { api } from '@/lib/api'

export type EstimateStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired'

export interface EstimateLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  unitCost: number
  total: number
  totalCost: number
  option: 'good' | 'better' | 'best' | null
  isSelected: boolean
  sortOrder: number
}

export interface Estimate {
  id: string
  estimateNumber: string
  jobId: string | null
  contactId: string | null
  
  // Details
  name: string
  description: string | null
  
  // Status
  status: EstimateStatus
  sentAt: string | null
  viewedAt: string | null
  acceptedAt: string | null
  declinedAt: string | null
  expiresAt: string | null
  
  // Financial
  subtotal: number
  discountPercent: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  total: number
  cost: number
  profitMargin: number
  
  // Line items
  lineItems: EstimateLineItem[]
  
  // Sharing
  shareToken: string | null
  shareUrl: string | null
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface EstimateTemplate {
  id: string
  name: string
  description: string | null
  lineItems: Omit<EstimateLineItem, 'id'>[]
  isDefault: boolean
  createdAt: string
}

export interface EstimatesFilters {
  status?: EstimateStatus[]
  search?: string
  jobId?: string
  contactId?: string
}

export interface EstimatesState {
  // Data
  estimates: Estimate[]
  selectedEstimate: Estimate | null
  templates: EstimateTemplate[]

  // UI State
  isLoading: boolean
  error: string | null
  filters: EstimatesFilters

  // Pagination
  page: number
  pageSize: number
  totalCount: number
  totalPages: number

  // Actions
  fetchEstimates: () => Promise<void>
  fetchEstimate: (id: string) => Promise<void>
  fetchTemplates: () => Promise<void>
  createEstimate: (data: Partial<Estimate>) => Promise<Estimate>
  updateEstimate: (id: string, data: Partial<Estimate>) => Promise<void>
  deleteEstimate: (id: string) => Promise<void>
  sendEstimate: (id: string) => Promise<void>

  // Line item actions
  addLineItem: (estimateId: string, item: Partial<EstimateLineItem>) => Promise<void>
  updateLineItem: (estimateId: string, itemId: string, data: Partial<EstimateLineItem>) => Promise<void>
  deleteLineItem: (estimateId: string, itemId: string) => Promise<void>

  // Filter actions
  setFilters: (filters: Partial<EstimatesFilters>) => void
  clearFilters: () => void
  setPage: (page: number) => void

  // Selection
  setSelectedEstimate: (estimate: Estimate | null) => void
  clearError: () => void
}

const defaultFilters: EstimatesFilters = {
  status: undefined,
  search: undefined,
  jobId: undefined,
  contactId: undefined,
}

// Transform backend response to frontend format
function transformEstimate(data: any): Estimate {
  return {
    id: data.id,
    estimateNumber: data.estimate_number,
    jobId: data.job_id,
    contactId: data.contact_id,
    name: data.name,
    description: data.description,
    status: data.status,
    sentAt: data.sent_at,
    viewedAt: data.viewed_at,
    acceptedAt: data.accepted_at,
    declinedAt: data.declined_at,
    expiresAt: data.expires_at,
    subtotal: data.subtotal,
    discountPercent: data.discount_percent,
    discountAmount: data.discount_amount,
    taxRate: data.tax_rate,
    taxAmount: data.tax_amount,
    total: data.total,
    cost: data.cost,
    profitMargin: data.profit_margin,
    lineItems: (data.line_items || []).map(transformLineItem),
    shareToken: data.share_token,
    shareUrl: data.share_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function transformLineItem(data: any): EstimateLineItem {
  return {
    id: data.id,
    description: data.description,
    quantity: data.quantity,
    unitPrice: data.unit_price,
    unitCost: data.unit_cost,
    total: data.total,
    totalCost: data.total_cost,
    option: data.option,
    isSelected: data.is_selected,
    sortOrder: data.sort_order,
  }
}

function transformTemplate(data: any): EstimateTemplate {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    lineItems: (data.line_items || []).map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      unitCost: item.unit_cost,
      total: item.total,
      totalCost: item.total_cost,
      option: item.option,
      isSelected: item.is_selected,
      sortOrder: item.sort_order,
    })),
    isDefault: data.is_default,
    createdAt: data.created_at,
  }
}

export const useEstimatesStore = create<EstimatesState>()((set, get) => ({
  // Initial state
  estimates: [],
  selectedEstimate: null,
  templates: [],
  isLoading: false,
  error: null,
  filters: defaultFilters,
  page: 1,
  pageSize: 50,
  totalCount: 0,
  totalPages: 0,

  // Fetch estimates list
  fetchEstimates: async () => {
    set({ isLoading: true, error: null })
    try {
      const { filters, page, pageSize } = get()
      const params = new URLSearchParams()

      params.append('page', page.toString())
      params.append('page_size', pageSize.toString())

      if (filters.status?.length) {
        filters.status.forEach((s) => params.append('status', s))
      }
      if (filters.search) {
        params.append('search', filters.search)
      }
      if (filters.jobId) {
        params.append('job_id', filters.jobId)
      }
      if (filters.contactId) {
        params.append('contact_id', filters.contactId)
      }

      const response = await api.get(`/estimates?${params.toString()}`)
      const { items, total, pages } = response.data

      set({
        estimates: items.map(transformEstimate),
        totalCount: total,
        totalPages: pages,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch estimates',
        isLoading: false,
      })
    }
  },

  // Fetch single estimate
  fetchEstimate: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get(`/estimates/${id}`)
      set({ selectedEstimate: transformEstimate(response.data), isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch estimate',
        isLoading: false,
      })
    }
  },

  // Fetch templates
  fetchTemplates: async () => {
    try {
      const response = await api.get('/estimates/templates')
      set({ templates: response.data.map(transformTemplate) })
    } catch (error: any) {
      console.error('Failed to fetch templates:', error)
    }
  },

  // Create estimate
  createEstimate: async (data: Partial<Estimate>) => {
    set({ isLoading: true, error: null })
    try {
      const payload = {
        name: data.name,
        description: data.description,
        job_id: data.jobId,
        contact_id: data.contactId,
      }
      const response = await api.post('/estimates', payload)
      const newEstimate = transformEstimate(response.data)

      set((state) => ({
        estimates: [newEstimate, ...state.estimates],
        isLoading: false,
      }))

      return newEstimate
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to create estimate',
        isLoading: false,
      })
      throw error
    }
  },

  // Update estimate
  updateEstimate: async (id: string, data: Partial<Estimate>) => {
    set({ isLoading: true, error: null })
    try {
      const payload: Record<string, any> = {}
      if (data.name !== undefined) payload.name = data.name
      if (data.description !== undefined) payload.description = data.description
      if (data.discountPercent !== undefined) payload.discount_percent = data.discountPercent
      if (data.discountAmount !== undefined) payload.discount_amount = data.discountAmount
      if (data.taxRate !== undefined) payload.tax_rate = data.taxRate

      const response = await api.patch(`/estimates/${id}`, payload)
      const updated = transformEstimate(response.data)

      set((state) => ({
        estimates: state.estimates.map((e) => (e.id === id ? updated : e)),
        selectedEstimate: state.selectedEstimate?.id === id ? updated : state.selectedEstimate,
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update estimate',
        isLoading: false,
      })
      throw error
    }
  },

  // Delete estimate
  deleteEstimate: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.delete(`/estimates/${id}`)

      set((state) => ({
        estimates: state.estimates.filter((e) => e.id !== id),
        selectedEstimate: state.selectedEstimate?.id === id ? null : state.selectedEstimate,
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to delete estimate',
        isLoading: false,
      })
      throw error
    }
  },

  // Send estimate
  sendEstimate: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post(`/estimates/${id}/send`)
      const updated = transformEstimate(response.data)

      set((state) => ({
        estimates: state.estimates.map((e) => (e.id === id ? updated : e)),
        selectedEstimate: state.selectedEstimate?.id === id ? updated : state.selectedEstimate,
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to send estimate',
        isLoading: false,
      })
      throw error
    }
  },

  // Add line item
  addLineItem: async (estimateId: string, item: Partial<EstimateLineItem>) => {
    try {
      const payload = {
        description: item.description,
        quantity: item.quantity || 1,
        unit_price: item.unitPrice || 0,
        unit_cost: item.unitCost || 0,
        option: item.option,
        is_selected: item.isSelected ?? true,
      }
      await api.post(`/estimates/${estimateId}/items`, payload)
      // Refresh the estimate to get updated totals
      await get().fetchEstimate(estimateId)
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Failed to add line item' })
      throw error
    }
  },

  // Update line item
  updateLineItem: async (estimateId: string, itemId: string, data: Partial<EstimateLineItem>) => {
    try {
      const payload: Record<string, any> = {}
      if (data.description !== undefined) payload.description = data.description
      if (data.quantity !== undefined) payload.quantity = data.quantity
      if (data.unitPrice !== undefined) payload.unit_price = data.unitPrice
      if (data.unitCost !== undefined) payload.unit_cost = data.unitCost
      if (data.option !== undefined) payload.option = data.option
      if (data.isSelected !== undefined) payload.is_selected = data.isSelected

      await api.patch(`/estimates/${estimateId}/items/${itemId}`, payload)
      // Refresh the estimate to get updated totals
      await get().fetchEstimate(estimateId)
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Failed to update line item' })
      throw error
    }
  },

  // Delete line item
  deleteLineItem: async (estimateId: string, itemId: string) => {
    try {
      await api.delete(`/estimates/${estimateId}/items/${itemId}`)
      // Refresh the estimate to get updated totals
      await get().fetchEstimate(estimateId)
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Failed to delete line item' })
      throw error
    }
  },

  // Filter actions
  setFilters: (filters: Partial<EstimatesFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1,
    }))
    get().fetchEstimates()
  },

  clearFilters: () => {
    set({ filters: defaultFilters, page: 1 })
    get().fetchEstimates()
  },

  setPage: (page) => {
    set({ page })
    get().fetchEstimates()
  },

  setSelectedEstimate: (estimate) => set({ selectedEstimate: estimate }),

  clearError: () => set({ error: null }),
}))
