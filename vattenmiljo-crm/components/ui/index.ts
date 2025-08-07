// ============================================================================
// UI COMPONENTS INDEX - Export All Components
// ============================================================================

// Badge Components
export {
  default as Badge,
  StatusBadge,
  PriorityBadge,
  NotificationBadge,
  BadgeGroup,
  ActivityBadge
} from './badge';

export type {
  BadgeProps,
  StatusBadgeProps,
  PriorityBadgeProps
} from './badge';

// Button Components
export {
  default as Button,
  IconButton,
  ButtonGroup,
  CTAButton,
  LinkButton,
  LoadingButton,
  ButtonIcons
} from './button';

export type {
  ButtonProps,
  IconButtonProps,
  ButtonGroupProps
} from './button';

// Card Components
export {
  default as Card,
  CardHeader,
  CardBody,
  CardFooter,
  StatsCard,
  CustomerCard,
  MetricCard,
  EmptyStateCard
} from './card';

export type {
  CardProps,
  StatsCardProps,
  CustomerCardProps
} from './card';

// Input Components
export {
  default as Input,
  Textarea,
  Select,
  PhoneInput,
  SearchInput
} from './input';

export type {
  InputProps,
  TextareaProps,
  SelectProps
} from './input';

// Modal Components
export {
  default as Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ConfirmModal,
  Drawer
} from './modal';

export type {
  ModalProps,
  ConfirmModalProps,
  DrawerProps
} from './modal';

// Table Components
export {
  default as Table,
  Pagination
} from './table';

export type {
  TableProps,
  Column,
  PaginationProps
} from './table';

// All components are available via direct imports or re-exports

// Re-export everything for backward compatibility
export * from './badge';
export * from './button';
export * from './card';
export * from './input';
export * from './modal';
export * from './table';