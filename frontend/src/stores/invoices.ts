/**
 * Invoices Store - Invoice state management
 *
 * Manages invoices list, filtering, and CRUD operations.
 */

import { create } from 'zustand'
import { api } from '@/lib/api'
import { toCamelCase, toSnakeCase } from '@/lib/transforms'
import type {
  Invoice,
  InvoiceStatus,
  CreateInvoiceData,
  UpdateInvoiceData,
  CreateLineItemData,
  CreatePaymentData,
  Payment,
} from '@/types/invoice'

export interface InvoicesFilters {
  status?: InvoiceStatus
  jobId?: string
  search?: string
}

export interface InvoicesState {
  // Data
  invoices: Invoice[]
  selectedInvoice: Invoice | null

  // UI State
  isLoading: boolean
  error: string | null
  filters: InvoicesFilters

  // Actions
  fetchInvoices: (filters?: InvoicesFilters) => Promise<void>
  fetchInvoice: (id: string) => Promise<void>
  fetchInvoicesByJob: (jobId: string) => Promise<void>
  createInvoice: (data: CreateInvoiceData, lineItems?: CreateLineItemData[]) => Promise<Invoice>
  updateInvoice: (id: string, data: UpdateInvoiceData) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
  sendInvoice: (id: string) => Promise<void>

  // Payments
  recordPayment: (invoiceId: string, data: CreatePaymentData) => Promise<Payment>
  fetchPayments: (invoiceId: string) => Promise<Payment[]>

  // Filter actions
  setFilters: (filters: Partial<InvoicesFilters>) => void
  clearFilters: () => void

  // Selection
  setSelectedInvoice: (invoice: Invoice | null) => void
  clearError: () => void
}

const defaultFilters: InvoicesFilters = {
  status: undefined,
  jobId: undefined,
  search: undefined,
}

/**
 * Transform backend invoice response to frontend format.
 */
function transformInvoice(data: unknown): Invoice {
  return toCamelCase(data) as Invoice
}

/**
 * Transform frontend invoice data to backend format.
 */
function toBackendInvoiceData(data: CreateInvoiceData | UpdateInvoiceData): Record<string, unknown> {
  return toSnakeCase(data) as Record<string, unknown>
}

/**
 * Transform frontend line item data to backend format.
 */
function toBackendLineItemData(data: CreateLineItemData): Record<string, unknown> {
  return toSnakeCase(data as unknown) as Record<string, unknown>
}

/**
 * Transform frontend payment data to backend format.
 */
function toBackendPaymentData(data: CreatePaymentData): Record<string, unknown> {
  return toSnakeCase(data as unknown) as Record<string, unknown>
}

export const useInvoicesStore = create<InvoicesState>()((set, get) => ({
  // Initial state
  invoices: [],
  selectedInvoice: null,
  isLoading: false,
  error: null,
  filters: defaultFilters,

  // Fetch invoices list
  fetchInvoices: async (filters?: InvoicesFilters) => {
    set({ isLoading: true, error: null })
    try {
      const activeFilters = filters || get().filters
      const params = new URLSearchParams()

      if (activeFilters.status) {
        params.append('status', activeFilters.status)
      }
      if (activeFilters.jobId) {
        params.append('job_id', activeFilters.jobId)
      }

      const queryString = params.toString()
      const url = queryString ? `/invoices?${queryString}` : '/invoices'
      const response = await api.get(url)
      const invoices = (response.data as unknown[]).map(transformInvoice)

      set({
        invoices,
        isLoading: false,
      })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      set({
        error: err.response?.data?.detail || 'Failed to fetch invoices',
        isLoading: false,
      })
    }
  },

  // Fetch invoices for a specific job
  fetchInvoicesByJob: async (jobId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get(`/invoices?job_id=${jobId}`)
      const invoices = (response.data as unknown[]).map(transformInvoice)

      set({
        invoices,
        isLoading: false,
      })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      set({
        error: err.response?.data?.detail || 'Failed to fetch invoices',
        isLoading: false,
      })
    }
  },

  // Fetch single invoice
  fetchInvoice: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get(`/invoices/${id}`)
      const invoice = transformInvoice(response.data)
      set({ selectedInvoice: invoice, isLoading: false })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      set({
        error: err.response?.data?.detail || 'Failed to fetch invoice',
        isLoading: false,
      })
    }
  },

  // Create invoice
  createInvoice: async (data: CreateInvoiceData, lineItems?: CreateLineItemData[]) => {
    set({ isLoading: true, error: null })
    try {
      const payload: Record<string, unknown> = toBackendInvoiceData(data)
      
      if (lineItems && lineItems.length > 0) {
        payload.line_items = lineItems.map(toBackendLineItemData)
      }

      const response = await api.post('/invoices', payload)
      const newInvoice = transformInvoice(response.data)

      // Add to list
      set((state) => ({
        invoices: [newInvoice, ...state.invoices],
        isLoading: false,
      }))

      return newInvoice
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      set({
        error: err.response?.data?.detail || 'Failed to create invoice',
        isLoading: false,
      })
      throw error
    }
  },

  // Update invoice
  updateInvoice: async (id: string, data: UpdateInvoiceData) => {
    set({ isLoading: true, error: null })
    try {
      const payload = toBackendInvoiceData(data)
      const response = await api.patch(`/invoices/${id}`, payload)
      const updatedInvoice = transformInvoice(response.data)

      // Update in list
      set((state) => ({
        invoices: state.invoices.map((inv) =>
          inv.id === id ? updatedInvoice : inv
        ),
        selectedInvoice:
          state.selectedInvoice?.id === id ? updatedInvoice : state.selectedInvoice,
        isLoading: false,
      }))
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      set({
        error: err.response?.data?.detail || 'Failed to update invoice',
        isLoading: false,
      })
      throw error
    }
  },

  // Delete invoice
  deleteInvoice: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.delete(`/invoices/${id}`)

      // Remove from list
      set((state) => ({
        invoices: state.invoices.filter((inv) => inv.id !== id),
        selectedInvoice:
          state.selectedInvoice?.id === id ? null : state.selectedInvoice,
        isLoading: false,
      }))
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      set({
        error: err.response?.data?.detail || 'Failed to delete invoice',
        isLoading: false,
      })
      throw error
    }
  },

  // Send invoice
  sendInvoice: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post(`/invoices/${id}/send`)
      const updatedInvoice = transformInvoice(response.data)

      // Update in list
      set((state) => ({
        invoices: state.invoices.map((inv) =>
          inv.id === id ? updatedInvoice : inv
        ),
        selectedInvoice:
          state.selectedInvoice?.id === id ? updatedInvoice : state.selectedInvoice,
        isLoading: false,
      }))
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      set({
        error: err.response?.data?.detail || 'Failed to send invoice',
        isLoading: false,
      })
      throw error
    }
  },

  // Record payment
  recordPayment: async (invoiceId: string, data: CreatePaymentData) => {
    set({ isLoading: true, error: null })
    try {
      const payload = toBackendPaymentData(data)
      const response = await api.post(`/invoices/${invoiceId}/payments`, payload)
      const payment = toCamelCase(response.data) as Payment

      // Refresh the invoice to get updated totals
      await get().fetchInvoice(invoiceId)

      set({ isLoading: false })
      return payment
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      set({
        error: err.response?.data?.detail || 'Failed to record payment',
        isLoading: false,
      })
      throw error
    }
  },

  // Fetch payments for an invoice
  fetchPayments: async (invoiceId: string) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/payments`)
      return (response.data as unknown[]).map((p) => toCamelCase(p) as Payment)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      set({
        error: err.response?.data?.detail || 'Failed to fetch payments',
      })
      throw error
    }
  },

  // Filter actions
  setFilters: (filters: Partial<InvoicesFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
    get().fetchInvoices()
  },

  clearFilters: () => {
    set({ filters: defaultFilters })
    get().fetchInvoices()
  },

  setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),

  clearError: () => set({ error: null }),
}))
