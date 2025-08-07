// ============================================================================
// UI COMPONENTS INDEX - Component Exports
// ============================================================================

// ============================================================================
// FORM COMPONENTS
// ============================================================================
export {
    Input,
    Textarea,
    Select,
    Checkbox,
    Radio,
    RadioGroup,
    type InputProps,
    type TextareaProps,
    type SelectProps,
    type CheckboxProps,
    type RadioProps,
    type RadioGroupProps
  } from './input';
  
  // ============================================================================
  // LAYOUT COMPONENTS
  // ============================================================================
  export {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    StatsCard,
    FeatureCard,
    CardSkeleton,
    type CardProps,
    type CardHeaderProps,
    type CardBodyProps,
    type CardFooterProps,
    type StatsCardProps,
    type FeatureCardProps
  } from './card';
  
  // ============================================================================
  // DATA DISPLAY COMPONENTS
  // ============================================================================
  export {
    Table,
    Pagination,
    type TableProps,
    type Column,
    type PaginationProps
  } from './table';
  
  export {
    Badge,
    type BadgeProps,
    type StatusBadgeProps,
    type PriorityBadgeProps
  } from './badge';
  
  // ============================================================================
  // FEEDBACK COMPONENTS
  // ============================================================================
  export {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ConfirmModal,
    Drawer,
    type ModalProps,
    type ModalHeaderProps,
    type ModalBodyProps,
    type ModalFooterProps,
    type ConfirmModalProps,
    type DrawerProps
  } from './modal';
  
  // ============================================================================
  // NAVIGATION COMPONENTS
  // ============================================================================
  export {
    Button,
    ButtonGroup,
    IconButton,
    type ButtonProps,
    type ButtonGroupProps,
    type IconButtonProps
  } from './button';
  
  // ============================================================================
  // UTILITY COMPONENTS
  // ============================================================================
  export {
    Spinner,
    LoadingSpinner,
    SkeletonLoader,
    type SpinnerProps,
    type LoadingSpinnerProps,
    type SkeletonLoaderProps
  } from './loading';
  
  export {
    Toast,
    ToastProvider,
    useToast,
    type ToastProps,
    type ToastContextType
  } from './toast';
  
  export {
    Tooltip,
    type TooltipProps
  } from './tooltip';
  
  export {
    Dropdown,
    DropdownMenu,
    DropdownItem,
    type DropdownProps,
    type DropdownMenuProps,
    type DropdownItemProps
  } from './dropdown';
  
  // ============================================================================
  // LAYOUT UTILITIES
  // ============================================================================
  export {
    Container,
    Grid,
    GridItem,
    Stack,
    Divider,
    type ContainerProps,
    type GridProps,
    type GridItemProps,
    type StackProps,
    type DividerProps
  } from './layout';
  
  // ============================================================================
  // FORM UTILITIES
  // ============================================================================
  export {
    FormGroup,
    FormLabel,
    FormError,
    FormHint,
    type FormGroupProps,
    type FormLabelProps,
    type FormErrorProps,
    type FormHintProps
  } from './form';
  
  // ============================================================================
  // RE-EXPORTS FOR CONVENIENCE
  // ============================================================================
  export type {
    // Common component props
    ComponentProps,
    ComponentPropsWithoutRef,
    ComponentPropsWithRef,
  } from 'react';
  
  // Size variants used across components
  export type Size = 'sm' | 'md' | 'lg';
  export type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  export type ColorScheme = 'neutral' | 'primary' | 'success' | 'warning' | 'error';
  
  // Common utility types
  export type Direction = 'horizontal' | 'vertical';
  export type Placement = 'top' | 'bottom' | 'left' | 'right';
  export type Alignment = 'start' | 'center' | 'end';
  export type Spacing = 'none' | 'sm' | 'md' | 'lg' | 'xl';