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
    EmptyStateCard,
    CardSkeleton
  } from './card';
  
  export type {
    CardProps,
    CardHeaderProps,
    CardBodyProps,
    CardFooterProps,
    StatsCardProps,
    CustomerCardProps
  } from './card';
  
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
    ModalHeaderProps,
    ModalBodyProps,
    ModalFooterProps,
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
  
  // ============================================================================
  // COMPONENT COLLECTIONS FOR EASY IMPORTING
  // ============================================================================
  
  // All Badge related components
  export const Badges = {
    Badge,
    StatusBadge,
    PriorityBadge,
    NotificationBadge,
    BadgeGroup,
    ActivityBadge
  };
  
  // All Button related components
  export const Buttons = {
    Button,
    IconButton,
    ButtonGroup,
    CTAButton,
    LinkButton,
    LoadingButton,
    ButtonIcons
  };
  
  // All Card related components
  export const Cards = {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    StatsCard,
    CustomerCard,
    MetricCard,
    EmptyStateCard,
    CardSkeleton
  };
  
  // All Modal related components
  export const Modals = {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ConfirmModal,
    Drawer
  };
  
  // All Table related components
  export const Tables = {
    Table,
    Pagination
  };
  
  // ============================================================================
  // USAGE EXAMPLES & PATTERNS
  // ============================================================================
  
  /*
  // Individual imports (recommended)
  import { Button, Card, Modal } from '@/components/ui';
  import { StatusBadge, CustomerCard } from '@/components/ui';
  
  // Collection imports
  import { Buttons, Cards } from '@/components/ui';
  const { Button, IconButton } = Buttons;
  const { Card, CardHeader, CardBody } = Cards;
  
  // Type imports
  import type { ButtonProps, CardProps, ModalProps } from '@/components/ui';
  
  // All components (not recommended for bundle size)
  import * as UI from '@/components/ui';
  */
  
  // ============================================================================
  // COMPONENT CATEGORIES
  // ============================================================================
  
  // Data Display Components
  export const DataDisplay = {
    Badge,
    StatusBadge,
    PriorityBadge,
    NotificationBadge,
    Card,
    StatsCard,
    MetricCard,
    CustomerCard,
    Table,
    EmptyStateCard
  };
  
  // Interactive Components
  export const Interactive = {
    Button,
    IconButton,
    CTAButton,
    LinkButton,
    LoadingButton,
    Modal,
    ConfirmModal,
    Drawer
  };
  
  // Layout Components
  export const Layout = {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    ButtonGroup,
    BadgeGroup,
    Pagination
  };
  
  // Feedback Components
  export const Feedback = {
    ActivityBadge,
    NotificationBadge,
    Modal,
    ConfirmModal,
    LoadingButton,
    CardSkeleton
  };
  
  // ============================================================================
  // COMPONENT VARIANTS & SIZES
  // ============================================================================
  
  // Common variant types used across components
  export type CommonVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  export type CommonSize = 'sm' | 'md' | 'lg' | 'xl';
  export type CommonAlignment = 'left' | 'center' | 'right';
  
  // ============================================================================
  // DESIGN SYSTEM TOKENS
  // ============================================================================
  
  export const DesignTokens = {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#2563eb',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
      },
      accent: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
      }
    },
    spacing: {
      1: '0.125rem', // 2px
      2: '0.25rem',  // 4px
      4: '0.5rem',   // 8px
      6: '0.75rem',  // 12px
      8: '1rem',     // 16px
      12: '1.5rem',  // 24px
      16: '2rem',    // 32px
      20: '2.5rem',  // 40px
      24: '3rem',    // 48px
      32: '4rem',    // 64px
    },
    borderRadius: {
      soft: '0.5rem',   // 8px
      medium: '0.75rem', // 12px
      large: '1rem',     // 16px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
    },
    shadows: {
      soft: '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.03)',
      medium: '0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 8px 24px -4px rgba(0, 0, 0, 0.04)',
      large: '0 8px 24px -4px rgba(0, 0, 0, 0.1), 0 16px 48px -8px rgba(0, 0, 0, 0.06)',
      glow: '0 0 32px rgba(37, 99, 235, 0.15)',
    }
  };
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  // Common className utility (should be imported from @/lib/utils in real usage)
  export const cn = (...classes: (string | undefined | null | boolean)[]) => {
    return classes.filter(Boolean).join(' ');
  };
  
  // Component size mappings
  export const getSizeClasses = (component: string, size: CommonSize) => {
    const sizeMap = {
      button: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg'
      },
      badge: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
        xl: 'px-6 py-3 text-lg'
      },
      card: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
      }
    };
    
    return sizeMap[component as keyof typeof sizeMap]?.[size] || '';
  };
  
  // ============================================================================
  // VERSION & BUILD INFO
  // ============================================================================
  
  export const VERSION = '1.0.0';
  export const BUILD_DATE = new Date().toISOString();
  export const COMPONENT_COUNT = {
    total: 25,
    badges: 6,
    buttons: 7,
    cards: 8,
    modals: 6,
    tables: 2
  };
  
  // ============================================================================
  // DEFAULT EXPORT (Optional - for convenience)
  // ============================================================================
  
  const UIComponents = {
    // Core Components
    Badge,
    Button,
    Card,
    Modal,
    Table,
    
    // Specialized Components
    StatusBadge,
    PriorityBadge,
    CustomerCard,
    StatsCard,
    ConfirmModal,
    
    // Collections
    Badges,
    Buttons,
    Cards,
    Modals,
    Tables,
    
    // Categories
    DataDisplay,
    Interactive,
    Layout,
    Feedback,
    
    // Utilities
    DesignTokens,
    getSizeClasses,
    cn,
    
    // Meta
    VERSION,
    COMPONENT_COUNT
  };
  
  export default UIComponents;