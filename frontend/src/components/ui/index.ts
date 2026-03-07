/**
 * Lisa UI Components
 *
 * Core UI component library built with:
 * - shadcn/ui patterns
 * - Tailwind CSS
 * - Radix UI primitives
 * - Mobile-first responsive design
 */

// Button
export { Button, buttonVariants } from './Button'
export type { ButtonProps } from './Button'

// Card
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './Card'
export type { CardProps, CardHeaderProps, CardFooterProps } from './Card'

// Input
export { Input, inputVariants } from './Input'
export type { InputProps } from './Input'

// Badge
export { Badge, StatusBadge, badgeVariants, statusLabels } from './Badge'
export type { BadgeProps, StatusBadgeProps, JobStatus } from './Badge'

// Drawer
export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerSection,
  DrawerField,
} from './Drawer'
export type {
  DrawerProps,
  DrawerSectionProps,
  DrawerFieldProps,
} from './Drawer'

// Select
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './Select'

// Checkbox
export { Checkbox, CheckboxWithLabel } from './Checkbox'
export type { CheckboxProps, CheckboxWithLabelProps } from './Checkbox'

// Textarea
export { Textarea, textareaVariants } from './Textarea'
export type { TextareaProps } from './Textarea'

// Dialog/Modal
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './Dialog'
export type { DialogContentProps } from './Dialog'

// Dropdown Menu
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './DropdownMenu'

// Tabs
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'

// Table
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './Table'

// Avatar
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  UserAvatar,
  getInitials,
  avatarVariants,
} from './Avatar'
export type { AvatarProps, UserAvatarProps } from './Avatar'

// Toast
export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
  toastVariants,
} from './Toast'
export type { ToastProps, ToastActionElement, ToastIconProps } from './Toast'

// Spinner/Loading
export { Spinner, LoadingOverlay, PageLoader, spinnerVariants } from './Spinner'
export type { SpinnerProps, LoadingOverlayProps } from './Spinner'

// Empty State
export { EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'

// Pagination
export { Pagination, PaginationInfo } from './Pagination'
export type { PaginationProps, PaginationInfoProps } from './Pagination'

// DatePicker
export { DatePicker } from './DatePicker'
export type { DatePickerProps } from './DatePicker'

// Label
export { Label, labelVariants } from './Label'
export type { LabelProps } from './Label'

// Form components
export { FormField, FormSection, FormActions } from './FormField'
export type { FormFieldProps, FormSectionProps, FormActionsProps } from './FormField'
