import * as React from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { MobileMenu } from './MobileMenu'
import { QuickActionSheet } from './QuickActionSheet'
import { useUIStore } from '@/stores/uiStore'

export interface AppLayoutProps {
  /** Page content */
  children: React.ReactNode
  /** Currently active route/page */
  activePage?: string
  /** Callback when navigation occurs */
  onNavigate?: (href: string) => void
  /** Callback when quick action is selected */
  onQuickAction?: (action: string) => void
  /** Current user info */
  user?: {
    name: string
    email: string
    avatarUrl?: string
    organizationName?: string
  }
  /** Callback when user clicks logout */
  onLogout?: () => void
  /** Callback when search is submitted */
  onSearch?: (query: string) => void
  /** Callback when notifications bell is clicked */
  onNotificationsClick?: () => void
  /** Optional drawer content (renders in overlay) */
  drawer?: React.ReactNode
  /** Whether drawer is open */
  drawerOpen?: boolean
  /** Callback to close drawer */
  onDrawerClose?: () => void
}

export function AppLayout({
  children,
  activePage = 'dashboard',
  onNavigate,
  onQuickAction,
  user,
  onLogout,
  onSearch,
  onNotificationsClick,
  drawer,
  drawerOpen,
  onDrawerClose,
}: AppLayoutProps) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          // Offset for sidebar on desktop
          'lg:ml-64',
          sidebarCollapsed && 'lg:ml-16'
        )}
      >
        {/* Header */}
        <Header
          onQuickAction={(action) => onQuickAction?.(action)}
          onSearch={onSearch}
          onNotificationsClick={onNotificationsClick}
        />

        {/* Page Content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activePage={activePage}
        onNavigate={onNavigate}
      />

      {/* Mobile Menu (slides in from left) */}
      <MobileMenu
        activePage={activePage}
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
      />

      {/* Quick Action Sheet (slides up from bottom) */}
      <QuickActionSheet onAction={onQuickAction} />

      {/* Drawer Overlay */}
      {drawer && drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onDrawerClose}
          />
          {/* Drawer Content */}
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl z-50 overflow-y-auto">
            {drawer}
          </div>
        </>
      )}
    </div>
  )
}
