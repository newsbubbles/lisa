// React import not needed with new JSX transform
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import {
  LayoutDashboard,
  Briefcase,
  Plus,
  Calendar,
  MoreHorizontal,
} from 'lucide-react'

// Navigation items for mobile bottom nav
const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard, href: '/' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, href: '/jobs' },
  { id: 'add', label: 'Add', icon: Plus, href: null, isAction: true },
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
  { id: 'more', label: 'More', icon: MoreHorizontal, href: null, isMenu: true },
]

export interface MobileNavProps {
  /** Currently active route/page */
  activePage?: string
  /** Callback when nav item is clicked */
  onNavigate?: (href: string) => void
  /** Callback when "More" is clicked */
  onMoreClick?: () => void
}

export function MobileNav({
  activePage = 'dashboard',
  onNavigate,
  onMoreClick,
}: MobileNavProps) {
  const { toggleQuickActionSheet, toggleMobileMenu } = useUIStore()

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.isAction) {
      toggleQuickActionSheet()
    } else if (item.isMenu) {
      onMoreClick?.()
      toggleMobileMenu()
    } else if (item.href) {
      onNavigate?.(item.href)
    }
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          const isAddButton = item.isAction

          if (isAddButton) {
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center shadow-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
              </button>
            )
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-primary-600' : 'text-gray-500'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary-600')} />
              <span className={cn('text-xs mt-1', isActive ? 'font-medium' : 'font-normal')}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-0.5 bg-primary-600 rounded-t-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
