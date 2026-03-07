import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface PaginationProps {
  /** Current page (1-indexed) */
  page: number
  /** Total number of pages */
  totalPages: number
  /** Callback when page changes */
  onPageChange: (page: number) => void
  /** Number of pages to show around current */
  siblingCount?: number
  /** Show first/last page buttons */
  showEdges?: boolean
  /** Size variant */
  size?: 'sm' | 'md'
  /** Additional class names */
  className?: string
}

function generatePagination(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'ellipsis')[] {
  const totalNumbers = siblingCount * 2 + 3 // siblings + current + 2 edges
  const totalBlocks = totalNumbers + 2 // + 2 ellipsis

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

  const showLeftEllipsis = leftSiblingIndex > 2
  const showRightEllipsis = rightSiblingIndex < totalPages - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
    return [...leftRange, 'ellipsis', totalPages]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    )
    return [1, 'ellipsis', ...rightRange]
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  )
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages]
}

const Pagination = ({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showEdges = true,
  size = 'md',
  className,
}: PaginationProps) => {
  const pages = generatePagination(page, totalPages, siblingCount)

  const buttonSize = size === 'sm' ? 'sm' : 'md'
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center gap-1', className)}
    >
      {showEdges && (
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Go to previous page"
        >
          <ChevronLeft className={iconSize} />
        </Button>
      )}

      {pages.map((pageNum, idx) =>
        pageNum === 'ellipsis' ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex h-9 w-9 items-center justify-center"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </span>
        ) : (
          <Button
            key={pageNum}
            variant={pageNum === page ? 'primary' : 'ghost'}
            size={buttonSize}
            onClick={() => onPageChange(pageNum)}
            aria-label={`Go to page ${pageNum}`}
            aria-current={pageNum === page ? 'page' : undefined}
          >
            {pageNum}
          </Button>
        )
      )}

      {showEdges && (
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Go to next page"
        >
          <ChevronRight className={iconSize} />
        </Button>
      )}
    </nav>
  )
}
Pagination.displayName = 'Pagination'

export interface PaginationInfoProps {
  page: number
  pageSize: number
  totalItems: number
  className?: string
}

const PaginationInfo = ({
  page,
  pageSize,
  totalItems,
  className,
}: PaginationInfoProps) => {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <p className={cn('text-sm text-gray-500', className)}>
      Showing <span className="font-medium text-gray-900">{start}</span> to{' '}
      <span className="font-medium text-gray-900">{end}</span> of{' '}
      <span className="font-medium text-gray-900">{totalItems}</span> results
    </p>
  )
}
PaginationInfo.displayName = 'PaginationInfo'

export { Pagination, PaginationInfo }
