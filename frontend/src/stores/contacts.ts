/**
 * Contacts Store - Contact/Customer state management
 *
 * Manages contacts list, filtering, and selection.
 */

import { create } from 'zustand'
import { api } from '@/lib/api'

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  mobilePhone?: string
  company?: string
  type: 'residential' | 'commercial' | 'insurance'
  source?: string
  tags: string[]
  notes?: string
  properties: Property[]
  createdAt: string
  updatedAt: string
}

export interface Property {
  id: string
  street: string
  city: string
  state: string
  zip: string
  isPrimary: boolean
  propertyType?: 'residential' | 'commercial' | 'multi_family'
  roofType?: string
  lastInspectionDate?: string
}

export interface ContactsFilters {
  type?: Contact['type'][]
  tags?: string[]
  search?: string
  hasJobs?: boolean
}

export interface ContactsState {
  // Data
  contacts: Contact[]
  selectedContact: Contact | null

  // UI State
  isLoading: boolean
  error: string | null
  filters: ContactsFilters

  // Pagination
  page: number
  pageSize: number
  totalCount: number
  totalPages: number

  // Actions
  fetchContacts: () => Promise<void>
  fetchContact: (id: string) => Promise<void>
  createContact: (data: Partial<Contact>) => Promise<Contact>
  updateContact: (id: string, data: Partial<Contact>) => Promise<void>
  deleteContact: (id: string) => Promise<void>

  // Property actions
  addProperty: (contactId: string, property: Partial<Property>) => Promise<void>
  updateProperty: (contactId: string, propertyId: string, data: Partial<Property>) => Promise<void>
  deleteProperty: (contactId: string, propertyId: string) => Promise<void>

  // Filter actions
  setFilters: (filters: Partial<ContactsFilters>) => void
  clearFilters: () => void
  setPage: (page: number) => void

  // Selection
  setSelectedContact: (contact: Contact | null) => void
  clearError: () => void
}

const defaultFilters: ContactsFilters = {
  type: undefined,
  tags: undefined,
  search: undefined,
  hasJobs: undefined,
}

export const useContactsStore = create<ContactsState>()((set, get) => ({
  // Initial state
  contacts: [],
  selectedContact: null,
  isLoading: false,
  error: null,
  filters: defaultFilters,
  page: 1,
  pageSize: 50,
  totalCount: 0,
  totalPages: 0,

  // Fetch contacts list
  fetchContacts: async () => {
    set({ isLoading: true, error: null })
    try {
      const { filters, page, pageSize } = get()
      const params = new URLSearchParams()

      params.append('page', page.toString())
      params.append('page_size', pageSize.toString())

      if (filters.type?.length) {
        filters.type.forEach((t) => params.append('type', t))
      }
      if (filters.search) {
        params.append('search', filters.search)
      }
      if (filters.tags?.length) {
        filters.tags.forEach((t) => params.append('tags', t))
      }

      const response = await api.get(`/contacts?${params.toString()}`)
      const { items, total, pages } = response.data

      set({
        contacts: items,
        totalCount: total,
        totalPages: pages,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch contacts',
        isLoading: false,
      })
    }
  },

  // Fetch single contact
  fetchContact: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get(`/contacts/${id}`)
      set({ selectedContact: response.data, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch contact',
        isLoading: false,
      })
    }
  },

  // Create contact
  createContact: async (data: Partial<Contact>) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post('/contacts', data)
      const newContact = response.data

      set((state) => ({
        contacts: [newContact, ...state.contacts],
        isLoading: false,
      }))

      return newContact
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to create contact',
        isLoading: false,
      })
      throw error
    }
  },

  // Update contact
  updateContact: async (id: string, data: Partial<Contact>) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.patch(`/contacts/${id}`, data)

      set((state) => ({
        contacts: state.contacts.map((c) =>
          c.id === id ? { ...c, ...response.data } : c
        ),
        selectedContact:
          state.selectedContact?.id === id
            ? { ...state.selectedContact, ...response.data }
            : state.selectedContact,
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update contact',
        isLoading: false,
      })
      throw error
    }
  },

  // Delete contact
  deleteContact: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.delete(`/contacts/${id}`)

      set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== id),
        selectedContact: state.selectedContact?.id === id ? null : state.selectedContact,
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to delete contact',
        isLoading: false,
      })
      throw error
    }
  },

  // Add property to contact
  addProperty: async (contactId: string, property: Partial<Property>) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post(`/contacts/${contactId}/properties`, property)

      set((state) => {
        if (state.selectedContact?.id === contactId) {
          return {
            selectedContact: {
              ...state.selectedContact,
              properties: [...state.selectedContact.properties, response.data],
            },
            isLoading: false,
          }
        }
        return { isLoading: false }
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to add property',
        isLoading: false,
      })
      throw error
    }
  },

  // Update property
  updateProperty: async (
    contactId: string,
    propertyId: string,
    data: Partial<Property>
  ) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.patch(
        `/contacts/${contactId}/properties/${propertyId}`,
        data
      )

      set((state) => {
        if (state.selectedContact?.id === contactId) {
          return {
            selectedContact: {
              ...state.selectedContact,
              properties: state.selectedContact.properties.map((p) =>
                p.id === propertyId ? { ...p, ...response.data } : p
              ),
            },
            isLoading: false,
          }
        }
        return { isLoading: false }
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update property',
        isLoading: false,
      })
      throw error
    }
  },

  // Delete property
  deleteProperty: async (contactId: string, propertyId: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.delete(`/contacts/${contactId}/properties/${propertyId}`)

      set((state) => {
        if (state.selectedContact?.id === contactId) {
          return {
            selectedContact: {
              ...state.selectedContact,
              properties: state.selectedContact.properties.filter(
                (p) => p.id !== propertyId
              ),
            },
            isLoading: false,
          }
        }
        return { isLoading: false }
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to delete property',
        isLoading: false,
      })
      throw error
    }
  },

  // Filter actions
  setFilters: (filters: Partial<ContactsFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1,
    }))
    get().fetchContacts()
  },

  clearFilters: () => {
    set({ filters: defaultFilters, page: 1 })
    get().fetchContacts()
  },

  setPage: (page) => {
    set({ page })
    get().fetchContacts()
  },

  setSelectedContact: (contact) => set({ selectedContact: contact }),

  clearError: () => set({ error: null }),
}))
