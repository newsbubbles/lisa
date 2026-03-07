import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUIStore } from '@/stores/uiStore'
import {
  Search,
  Bell,
  Plus,
  Menu,
  X,
  Briefcase,
  FileText,
  Users,
  ChevronDown,
} from 'lucide-react'

export interface HeaderProps {
  /** Callback when menu button is clicked (mobile) */
  onMenuClick?: () => void
  /** Callback when quick action is selected */
  onQuickAction?: (action: 'job' | 'estimate' | 'contact') => void
  /** Callback when search is submitted */
  onSearch?: (query: string) => void
  /** Callback when notification bell is clicked */
  onNotificationsClick?: () => void
}

export function Header({
  onMenuClick,
  onQuickAction,
  onSearch,
  onNotificationsClick,
}: HeaderProps) {
  const {
    pageTitle,
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    unreadNotificationsCount,
    toggleMobileMenu,
  } = useUIStore()
  
  const [quickActionsOpen, setQuickActionsOpen] = React.useState(false)
  const quickActionsRef = React.useRef<HTMLDivElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Close quick actions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setQuickActionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when opened
  React.useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim())
    }
  }

  const handleQuickAction = (action: 'job' | 'estimate' | 'contact') => {
    setQuickActionsOpen(false)
    onQuickAction?.(action)
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={() => {
            onMenuClick?.()
            toggleMobileMenu()
          }}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page title */}
        <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search (Desktop) */}
        <div className="hidden md:block relative">
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search jobs, contacts, estimates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputSize="sm"
                className="w-64"
                leftIcon={<Search className="h-4 w-4" />}
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false)
                  setSearchQuery('')
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              leftIcon={<Search className="h-4 w-4" />}
            >
              Search
            </Button>
          )}
        </div>

        {/* Search (Mobile) */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Quick Actions */}
        <div className="relative hidden sm:block" ref={quickActionsRef}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setQuickActionsOpen(!quickActionsOpen)}
            leftIcon={<Plus className="h-4 w-4" />}
            rightIcon={<ChevronDown className={cn('h-4 w-4 transition-transform', quickActionsOpen && 'rotate-180')} />}
          >
            New
          </Button>

          {/* Quick Actions Dropdown */}
          {quickActionsOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => handleQuickAction('job')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Briefcase className="h-4 w-4 text-gray-400" />
                New Job
              </button>
              <button
                onClick={() => handleQuickAction('estimate')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4 text-gray-400" />
                New Estimate
              </button>
              <button
                onClick={() => handleQuickAction('contact')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Users className="h-4 w-4 text-gray-400" />
                New Contact
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          onClick={onNotificationsClick}
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Bell className="h-5 w-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4 z-40">
          <form onSubmit={handleSearchSubmit}>
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search jobs, contacts, estimates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false)
                    setSearchQuery('')
                  }}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              }
            />
          </form>
        </div>
      )}
    </header>
  )
}
