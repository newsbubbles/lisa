/**
 * UI Store - Global UI state management
 * 
 * Manages layout state like sidebar collapse, mobile menus, modals, etc.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UIState {
  // Sidebar
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  
  // Mobile menu
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  
  // Quick action sheet (mobile)
  quickActionSheetOpen: boolean
  setQuickActionSheetOpen: (open: boolean) => void
  toggleQuickActionSheet: () => void
  
  // Search
  searchOpen: boolean
  searchQuery: string
  setSearchOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  
  // Notifications
  notificationsPanelOpen: boolean
  setNotificationsPanelOpen: (open: boolean) => void
  unreadNotificationsCount: number
  setUnreadNotificationsCount: (count: number) => void
  
  // Active drawer (for job details, contact details, etc.)
  activeDrawer: {
    type: 'job' | 'contact' | 'estimate' | 'invoice' | null
    id: string | null
  }
  openDrawer: (type: 'job' | 'contact' | 'estimate' | 'invoice', id: string) => void
  closeDrawer: () => void
  
  // Page title (for header)
  pageTitle: string
  setPageTitle: (title: string) => void
  
  // Theme (future use)
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      // Mobile menu
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
      
      // Quick action sheet
      quickActionSheetOpen: false,
      setQuickActionSheetOpen: (open) => set({ quickActionSheetOpen: open }),
      toggleQuickActionSheet: () => set((state) => ({ quickActionSheetOpen: !state.quickActionSheetOpen })),
      
      // Search
      searchOpen: false,
      searchQuery: '',
      setSearchOpen: (open) => set({ searchOpen: open }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // Notifications
      notificationsPanelOpen: false,
      setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }),
      unreadNotificationsCount: 0,
      setUnreadNotificationsCount: (count) => set({ unreadNotificationsCount: count }),
      
      // Active drawer
      activeDrawer: { type: null, id: null },
      openDrawer: (type, id) => set({ activeDrawer: { type, id } }),
      closeDrawer: () => set({ activeDrawer: { type: null, id: null } }),
      
      // Page title
      pageTitle: 'Dashboard',
      setPageTitle: (title) => set({ pageTitle: title }),
      
      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'lisa-ui-store',
      // Only persist certain values
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
)
