/**
 * Jobs Store - Job/Project state management
 *
 * Manages jobs list, filtering, and board state.
 */

import { create } from 'zustand'
import { api } from '@/lib/api'
import { transformBoardResponse, toBackendStatus, toBackendJobUpdate } from '@/lib/transforms'
import type { Job, JobStatus, JobSummary, PipelineColumn } from '@/types/job'

export interface JobsFilters {
  status?: JobStatus[]
  assignedTo?: string
  dateRange?: { start: Date; end: Date }
  search?: string
  tags?: string[]
}

export interface JobsState {
  // Data
  jobs: JobSummary[]
  selectedJob: Job | null
  boardColumns: PipelineColumn[]

  // UI State
  isLoading: boolean
  error: string | null
  filters: JobsFilters
  viewMode: 'board' | 'list' | 'calendar'

  // Pagination
  page: number
  pageSize: number
  totalCount: number
  totalPages: number

  // Actions
  fetchJobs: () => Promise<void>
  fetchJob: (id: string) => Promise<void>
  fetchBoardData: () => Promise<void>
  createJob: (data: Partial<Job>) => Promise<Job>
  updateJob: (id: string, data: Partial<Job>) => Promise<void>
  deleteJob: (id: string) => Promise<void>
  moveJobToStage: (jobId: string, newStatus: JobStatus, newStageId?: string) => Promise<void>

  // Filter actions
  setFilters: (filters: Partial<JobsFilters>) => void
  clearFilters: () => void
  setViewMode: (mode: 'board' | 'list' | 'calendar') => void
  setPage: (page: number) => void

  // Selection
  setSelectedJob: (job: Job | null) => void
  clearError: () => void
}

const defaultFilters: JobsFilters = {
  status: undefined,
  assignedTo: undefined,
  dateRange: undefined,
  search: undefined,
  tags: undefined,
}

export const useJobsStore = create<JobsState>()((set, get) => ({
  // Initial state
  jobs: [],
  selectedJob: null,
  boardColumns: [],
  isLoading: false,
  error: null,
  filters: defaultFilters,
  viewMode: 'board',
  page: 1,
  pageSize: 50,
  totalCount: 0,
  totalPages: 0,

  // Fetch jobs list
  fetchJobs: async () => {
    set({ isLoading: true, error: null })
    try {
      const { filters, page, pageSize } = get()
      const params = new URLSearchParams()

      params.append('page', page.toString())
      params.append('page_size', pageSize.toString())

      if (filters.status?.length) {
        filters.status.forEach((s) => params.append('status', toBackendStatus(s)))
      }
      if (filters.search) {
        params.append('search', filters.search)
      }
      if (filters.assignedTo) {
        params.append('assigned_to', filters.assignedTo)
      }

      const response = await api.get(`/jobs?${params.toString()}`)
      const { items, total, pages } = response.data

      set({
        jobs: items,
        totalCount: total,
        totalPages: pages,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch jobs',
        isLoading: false,
      })
    }
  },

  // Fetch single job
  fetchJob: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get(`/jobs/${id}`)
      set({ selectedJob: response.data, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch job',
        isLoading: false,
      })
    }
  },

  // Fetch board data (grouped by stage)
  fetchBoardData: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/jobs/board')
      const columns = transformBoardResponse(response.data)
      set({ boardColumns: columns, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch board data',
        isLoading: false,
      })
    }
  },

  // Create job
  createJob: async (data: Partial<Job>) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post('/jobs', data)
      const newJob = response.data

      // Refresh board data
      get().fetchBoardData()

      set({ isLoading: false })
      return newJob
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to create job',
        isLoading: false,
      })
      throw error
    }
  },

  // Update job
  updateJob: async (id: string, data: Partial<Job>) => {
    set({ isLoading: true, error: null })
    try {
      const payload = toBackendJobUpdate(data as any)
      await api.patch(`/jobs/${id}`, payload)

      // Refresh board data
      get().fetchBoardData()

      set({ isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update job',
        isLoading: false,
      })
      throw error
    }
  },

  // Delete job
  deleteJob: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.delete(`/jobs/${id}`)

      // Refresh board data
      get().fetchBoardData()

      set({ isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to delete job',
        isLoading: false,
      })
      throw error
    }
  },

  // Move job to new stage (for drag-drop on board)
  moveJobToStage: async (jobId: string, newStatus: JobStatus, newStageId?: string) => {
    // Optimistic update
    const previousColumns = get().boardColumns

    set((state) => {
      const newColumns = state.boardColumns.map(col => ({ ...col, jobs: [...col.jobs] }))
      let movedJob: JobSummary | undefined

      // Find and remove job from current column
      for (const column of newColumns) {
        const index = column.jobs.findIndex((j) => j.id === jobId)
        if (index > -1) {
          [movedJob] = column.jobs.splice(index, 1)
          break
        }
      }

      // Add to new column
      if (movedJob) {
        const targetColumn = newColumns.find(col => col.status === newStatus)
        if (targetColumn) {
          targetColumn.jobs.push({ ...movedJob, status: newStatus })
        }
      }

      return { boardColumns: newColumns }
    })

    try {
      const payload: Record<string, unknown> = { status: toBackendStatus(newStatus) }
      if (newStageId) {
        payload.stage_id = newStageId
      }
      await api.patch(`/jobs/${jobId}`, payload)
    } catch (error) {
      // Rollback on error
      set({ boardColumns: previousColumns })
      throw error
    }
  },

  // Filter actions
  setFilters: (filters: Partial<JobsFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1, // Reset to first page on filter change
    }))
    get().fetchJobs()
  },

  clearFilters: () => {
    set({ filters: defaultFilters, page: 1 })
    get().fetchJobs()
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setPage: (page) => {
    set({ page })
    get().fetchJobs()
  },

  setSelectedJob: (job) => set({ selectedJob: job }),

  clearError: () => set({ error: null }),
}))
