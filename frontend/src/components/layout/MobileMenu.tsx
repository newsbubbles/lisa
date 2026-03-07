import * as React from 'react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import {
  X,
  LayoutDashboard,
  Briefcase,
  FileText,
  Receipt,
  Users,
  Calendar,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  User,
  ChevronRight,
  Building2,
} from 'lucide-react'

// Navigation items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, href: '/jobs' },
  { id: 'estimates', label: 'Estimates', icon: FileText, href: '/estimates' },
  { id: 'invoices', label: 'Invoices', icon: Receipt, href: '/invoices' },
  { id: 'contacts', label: 'Contacts', icon: Users, href: '/contacts' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
  { id: 'reports', label: 'Reports', icon: BarChart3, href: '/reports' },
]

const bottomNavItems = [
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '/help' },
]

export interface MobileMenuProps {
  /** Currently active route/page */
  activePage?: string
  /** Callback when nav item is clicked */
  onNavigate?: (href: string) => void
  /** Current user info */
  user?: {
    name: string
    email: string
    avatarUrl?: string
    organizationName?: string
  }
  /** Callback when user clicks logout */
  onLogout?: () => void
}

export function MobileMenu({
  activePage = 'dashboard',
  onNavigate,
  user,
  onLogout,
}: MobileMenuProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore()

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileMenuOpen, setMobileMenuOpen])

  // Prevent body scroll when menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false)
    onNavigate?.(href)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setMobileMenuOpen(false)
    }
  }

  if (!mobileMenuOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={handleBackdropClick}
      />

      {/* Menu Panel */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden',
          'transform transition-transform duration-300 ease-out',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Lisa</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-primary-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {user?.organizationName || user?.email || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('h-5 w-5', isActive && 'text-primary-600')} />
                  <span className={cn('font-medium', isActive && 'text-primary-700')}>
                    {item.label}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            )
          })}

          {/* Divider */}
          <div className="my-4 border-t border-gray-200" />

          {/* Bottom nav items */}
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:bg-gray-100'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              onLogout?.()
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
}
