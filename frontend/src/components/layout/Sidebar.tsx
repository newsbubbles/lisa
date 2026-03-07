import * as React from 'react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Receipt,
  Users,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  ChevronDown,
  HelpCircle,
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

export interface SidebarProps {
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

export function Sidebar({
  activePage = 'dashboard',
  onNavigate,
  user,
  onLogout,
}: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const userMenuRef = React.useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavClick = (href: string) => {
    onNavigate?.(href)
  }

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Lisa</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors',
            sidebarCollapsed && 'mx-auto'
          )}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.href)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                sidebarCollapsed && 'justify-center px-2'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary-600')} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="py-2 px-2 border-t border-gray-200">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.href)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
                sidebarCollapsed && 'justify-center px-2'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
            </button>
          )
        })}
      </div>

      {/* User Profile */}
      <div className="relative p-2 border-t border-gray-200" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={cn(
            'w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors',
            sidebarCollapsed && 'justify-center'
          )}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-primary-600" />
            )}
          </div>
          
          {!sidebarCollapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.organizationName || user?.email || ''}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-400 transition-transform',
                  userMenuOpen && 'rotate-180'
                )}
              />
            </>
          )}
        </button>

        {/* User Menu Dropdown */}
        {userMenuOpen && (
          <div
            className={cn(
              'absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50',
              sidebarCollapsed ? 'left-full ml-2 w-48' : 'left-2 right-2'
            )}
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email || ''}</p>
            </div>
            <button
              onClick={() => {
                handleNavClick('/profile')
                setUserMenuOpen(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <User className="h-4 w-4" />
              My Profile
            </button>
            <button
              onClick={() => {
                handleNavClick('/settings')
                setUserMenuOpen(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => {
                  onLogout?.()
                  setUserMenuOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
