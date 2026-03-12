/**
 * Reports Store - Report state management
 *
 * Manages fetching and caching report data for the 4 MVP reports:
 * - Revenue Report
 * - Pipeline Report
 * - AR Aging Report
 * - Jobs Summary Report
 */

import { create } from 'zustand'
import { api } from '@/lib/api'
import { toCamelCase } from '@/lib/transforms'
import type {
  RevenueReport,
  PipelineReport,
  ARAgingReport,
  JobsSummaryReport,
  ReportType,
  DateRange,
  GroupByPeriod,
} from '@/types/report'
import { getDefaultDateRange } from '@/types/report'

export interface ReportsState {
  // Current report type
  activeReport: ReportType

  // Revenue Report
  revenueReport: RevenueReport | null
  revenueLoading: boolean
  revenueError: string | null

  // Pipeline Report
  pipelineReport: PipelineReport | null
  pipelineLoading: boolean
  pipelineError: string | null

  // AR Aging Report
  arAgingReport: ARAgingReport | null
  arAgingLoading: boolean
  arAgingError: string | null

  // Jobs Summary Report
  jobsSummaryReport: JobsSummaryReport | null
  jobsSummaryLoading: boolean
  jobsSummaryError: string | null

  // Filters
  dateRange: DateRange
  groupBy: GroupByPeriod

  // Legacy UI State (for backward compatibility)
  isLoading: boolean
  error: string | null

  // Actions
  setActiveReport: (report: ReportType) => void
  setDateRange: (startDate: string, endDate: string) => void
  setGroupBy: (groupBy: GroupByPeriod) => void

  // Fetch actions
  fetchRevenueReport: (startDate?: string, endDate?: string, groupBy?: GroupByPeriod) => Promise<void>
  fetchPipelineReport: () => Promise<void>
  fetchARAgingReport: () => Promise<void>
  fetchJobsSummaryReport: (startDate?: string, endDate?: string) => Promise<void>
  fetchActiveReport: () => Promise<void>
  fetchAllReports: () => Promise<void>

  // Utility
  clearReports: () => void
  clearErrors: () => void
  clearError: () => void // Legacy alias
}

/**
 * Transform AR aging report to handle snake_case field names.
 */
function transformARAgingReport(data: unknown): ARAgingReport {
  const raw = data as Record<string, unknown>
  return {
    current: toCamelCase(raw.current) as ARAgingReport['current'],
    days31_60: toCamelCase(raw.days_31_60) as ARAgingReport['days31_60'],
    days61_90: toCamelCase(raw.days_61_90) as ARAgingReport['days61_90'],
    days90Plus: toCamelCase(raw.days_90_plus) as ARAgingReport['days90Plus'],
    totalOutstanding: raw.total_outstanding as number,
  }
}

export const useReportsStore = create<ReportsState>()((set, get) => ({
  // Initial state
  activeReport: 'revenue',

  revenueReport: null,
  revenueLoading: false,
  revenueError: null,

  pipelineReport: null,
  pipelineLoading: false,
  pipelineError: null,

  arAgingReport: null,
  arAgingLoading: false,
  arAgingError: null,

  jobsSummaryReport: null,
  jobsSummaryLoading: false,
  jobsSummaryError: null,

  dateRange: getDefaultDateRange(),
  groupBy: 'month',

  // Legacy state
  isLoading: false,
  error: null,

  // Set active report
  setActiveReport: (report) => {
    set({ activeReport: report })
    get().fetchActiveReport()
  },

  // Set date range
  setDateRange: (startDate, endDate) => {
    set({ dateRange: { startDate, endDate } })
  },

  // Set group by
  setGroupBy: (groupBy) => {
    set({ groupBy })
  },

  // Fetch revenue report
  fetchRevenueReport: async (startDate?: string, endDate?: string, groupBy?: GroupByPeriod) => {
    set({ revenueLoading: true, revenueError: null, isLoading: true, error: null })
    try {
      const state = get()
      const params = new URLSearchParams({
        start_date: startDate || state.dateRange.startDate,
        end_date: endDate || state.dateRange.endDate,
        group_by: groupBy || state.groupBy,
      })

      const response = await api.get(`/reports/revenue?${params}`)
      const report = toCamelCase(response.data) as RevenueReport

      set({ revenueReport: report, revenueLoading: false, isLoading: false })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      const errorMessage = err.response?.data?.detail || 'Failed to fetch revenue report'
      set({
        revenueError: errorMessage,
        revenueLoading: false,
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  // Fetch pipeline report
  fetchPipelineReport: async () => {
    set({ pipelineLoading: true, pipelineError: null, isLoading: true, error: null })
    try {
      const response = await api.get('/reports/pipeline')
      const report = toCamelCase(response.data) as PipelineReport

      set({ pipelineReport: report, pipelineLoading: false, isLoading: false })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      const errorMessage = err.response?.data?.detail || 'Failed to fetch pipeline report'
      set({
        pipelineError: errorMessage,
        pipelineLoading: false,
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  // Fetch AR aging report
  fetchARAgingReport: async () => {
    set({ arAgingLoading: true, arAgingError: null, isLoading: true, error: null })
    try {
      const response = await api.get('/reports/ar-aging')
      const report = transformARAgingReport(response.data)

      set({ arAgingReport: report, arAgingLoading: false, isLoading: false })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      const errorMessage = err.response?.data?.detail || 'Failed to fetch AR aging report'
      set({
        arAgingError: errorMessage,
        arAgingLoading: false,
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  // Fetch jobs summary report
  fetchJobsSummaryReport: async (startDate?: string, endDate?: string) => {
    set({ jobsSummaryLoading: true, jobsSummaryError: null, isLoading: true, error: null })
    try {
      const state = get()
      const params = new URLSearchParams({
        start_date: startDate || state.dateRange.startDate,
        end_date: endDate || state.dateRange.endDate,
      })

      const response = await api.get(`/reports/jobs-summary?${params}`)
      const report = toCamelCase(response.data) as JobsSummaryReport

      set({ jobsSummaryReport: report, jobsSummaryLoading: false, isLoading: false })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      const errorMessage = err.response?.data?.detail || 'Failed to fetch jobs summary report'
      set({
        jobsSummaryError: errorMessage,
        jobsSummaryLoading: false,
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  // Fetch the currently active report
  fetchActiveReport: async () => {
    const { activeReport } = get()
    switch (activeReport) {
      case 'revenue':
        await get().fetchRevenueReport()
        break
      case 'pipeline':
        await get().fetchPipelineReport()
        break
      case 'ar-aging':
        await get().fetchARAgingReport()
        break
      case 'jobs-summary':
        await get().fetchJobsSummaryReport()
        break
    }
  },

  // Fetch all reports in parallel
  fetchAllReports: async () => {
    const state = get()
    await Promise.all([
      state.fetchRevenueReport(),
      state.fetchPipelineReport(),
      state.fetchARAgingReport(),
      state.fetchJobsSummaryReport(),
    ])
  },

  // Clear all report data
  clearReports: () => {
    set({
      revenueReport: null,
      revenueError: null,
      pipelineReport: null,
      pipelineError: null,
      arAgingReport: null,
      arAgingError: null,
      jobsSummaryReport: null,
      jobsSummaryError: null,
      error: null,
    })
  },

  // Clear all errors
  clearErrors: () => {
    set({
      revenueError: null,
      pipelineError: null,
      arAgingError: null,
      jobsSummaryError: null,
      error: null,
    })
  },

  // Legacy alias for clearErrors
  clearError: () => {
    set({
      revenueError: null,
      pipelineError: null,
      arAgingError: null,
      jobsSummaryError: null,
      error: null,
    })
  },
}))
