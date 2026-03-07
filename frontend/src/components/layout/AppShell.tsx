/**
 * AppShell - Legacy layout component
 * 
 * NOTE: This is kept for backward compatibility.
 * New code should use AppLayout instead.
 */
import * as React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { useUIStore } from '@/stores/uiStore'

export interface AppShellProps {
  /** Children to render in main content area */
  children?: React.ReactNode
  /** Additional class names for main content */
  className?: string
  /** Callback when navigation occurs */
  onNavigate?: (href: string) => void
}

export const AppShell = ({ children, className, onNavigate }: AppShellProps) => {
  const location = useLocation()
  const { sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useUIStore()

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname, setMobileMenuOpen])

  // Determine active page from pathname
  const activePage = React.useMemo(() => {
    const path = location.pathname
    if (path === '/') return 'dashboard'
    return path.split('/')[1] || 'dashboard'
  }, [location.pathname])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          activePage={activePage}
          onNavigate={onNavigate}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar activePage={activePage} onNavigate={onNavigate} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        <Header
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <main
          className={cn(
            'flex-1 overflow-y-auto p-4 lg:p-6',
            // Add bottom padding for mobile nav
            'pb-20 lg:pb-6',
            className
          )}
        >
          {children || <Outlet />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  )
}

AppShell.displayName = 'AppShell'
