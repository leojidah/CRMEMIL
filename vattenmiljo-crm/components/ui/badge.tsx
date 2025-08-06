// ============================================================================
// BADGE COMPONENT - Status Indicators & Labels
// ============================================================================

import React from 'react';
import { cn } from '@/lib/utils';
import type { CustomerStatus } from '@/lib/types';
import { CUSTOMER_STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  pulse?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  children?: React.ReactNode;
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  status: CustomerStatus;
  showIcon?: boolean;
}

export interface PriorityBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  priority: 'low' | 'medium' | 'high';
  showIcon?: boolean;
}

// ============================================================================
// COMPONENT STYLES
// ============================================================================

const badgeVariants = {
  default: [
    'bg-neutral-100 text-neutral-800 border border-neutral-200',
    'hover:bg-neutral-200'
  ],
  success: [
    'bg-green-50 text-green-700 border border-green-200',
    'hover:bg-green-100'
  ],
  warning: [
    'bg-yellow-50 text-yellow-700 border border-yellow-200',
    'hover:bg-yellow-100'
  ],
  error: [
    'bg-red-50 text-red-700 border border-red-200',
    'hover:bg-red-100'
  ],
  info: [
    'bg-blue-50 text-blue-700 border border-blue-200',
    'hover:bg-blue-100'
  ],
  neutral: [
    'bg-gray-50 text-gray-700 border border-gray-200',
    'hover:bg-gray-100'
  ]
};

const badgeSizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
};

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      icon,
      pulse = false,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center gap-1.5 font-medium rounded-full',
          'transition-all duration-200 ease-out',
          'relative overflow-hidden',
          
          // Size styles
          badgeSizes[size],
          
          // Variant styles
          badgeVariants[variant],
          
          // Pulse animation
          pulse && 'animate-pulse',
          
          // Interactive styles if removable
          removable && 'pr-1.5',
          
          className
        )}
        {...props}
      >
        {/* Pulse dot for animated badges */}
        {pulse && (
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <span className="block w-2 h-2 bg-current rounded-full animate-ping opacity-75" />
            <span className="absolute inset-0 block w-2 h-2 bg-current rounded-full" />
          </span>
        )}
        
        {/* Icon */}
        {icon && !pulse && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        
        {/* Content */}
        <span className={cn(pulse && 'ml-3')}>{children}</span>
        
        {/* Remove button */}
        {removable && onRemove && (
          <button
            onClick={onRemove}
            className={cn(
              'flex-shrink-0 ml-1 p-0.5 rounded-full',
              'hover:bg-black/10 focus:outline-none focus:bg-black/10',
              'transition-colors duration-150'
            )}
            type="button"
            aria-label="Ta bort"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  className,
  ...props
}) => {
  // Default status config if CUSTOMER_STATUS_CONFIG is not available
  const defaultStatusConfig = {
    not_handled: { label: 'Ej hanterad', bgColor: 'bg-yellow-50', color: 'text-yellow-700', borderColor: 'border-yellow-200' },
    meeting: { label: 'Möte', bgColor: 'bg-blue-50', color: 'text-blue-700', borderColor: 'border-blue-200' },
    sales: { label: 'Försäljning', bgColor: 'bg-green-50', color: 'text-green-700', borderColor: 'border-green-200' },
    done: { label: 'Klar', bgColor: 'bg-green-50', color: 'text-green-700', borderColor: 'border-green-200' },
    archived: { label: 'Arkiverad', bgColor: 'bg-gray-50', color: 'text-gray-700', borderColor: 'border-gray-200' }
  };
  
  const config = CUSTOMER_STATUS_CONFIG?.[status] || defaultStatusConfig[status];
  
  const getStatusIcon = (status: CustomerStatus) => {
    const iconClass = "w-4 h-4";
    
    switch (status) {
      case 'not_handled':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'meeting':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'sales':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'done':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'archived':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
        'transition-all duration-200',
        config?.bgColor || 'bg-gray-50',
        config?.color || 'text-gray-700',
        config?.borderColor || 'border-gray-200',
        'border',
        className
      )}
      {...props}
    >
      {showIcon && getStatusIcon(status)}
      <span>{config?.label || status}</span>
    </span>
  );
};

// ============================================================================
// PRIORITY BADGE COMPONENT
// ============================================================================

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  showIcon = true,
  className,
  ...props
}) => {
  // Default priority config if PRIORITY_CONFIG is not available
  const defaultPriorityConfig = {
    low: { label: 'Låg', bgColor: 'bg-green-50', color: 'text-green-700' },
    medium: { label: 'Medium', bgColor: 'bg-yellow-50', color: 'text-yellow-700' },
    high: { label: 'Hög', bgColor: 'bg-red-50', color: 'text-red-700' }
  };
  
  const config = PRIORITY_CONFIG?.[priority] || defaultPriorityConfig[priority];
  
  const getPriorityIcon = (priority: 'low' | 'medium' | 'high') => {
    const iconClass = "w-4 h-4";
    
    switch (priority) {
      case 'high':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'medium':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      case 'low':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        'transition-all duration-200 border',
        config?.bgColor || 'bg-gray-50',
        config?.color || 'text-gray-700',
        className
      )}
      {...props}
    >
      {showIcon && getPriorityIcon(priority)}
      <span>{config?.label || priority}</span>
    </span>
  );
};

// ============================================================================
// NOTIFICATION BADGE (for counts, etc.)
// ============================================================================

interface NotificationBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number;
  max?: number;
  showZero?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  showZero = false,
  position = 'top-right',
  className,
  ...props
}) => {
  if (!showZero && count === 0) return null;
  
  const displayCount = count > max ? `${max}+` : count.toString();
  
  const positionClasses = {
    'top-right': '-top-2 -right-2',
    'top-left': '-top-2 -left-2', 
    'bottom-right': '-bottom-2 -right-2',
    'bottom-left': '-bottom-2 -left-2'
  };

  return (
    <span
      className={cn(
        'absolute z-10 inline-flex items-center justify-center',
        'min-w-[1.25rem] h-5 px-1 text-xs font-bold text-white',
        'bg-red-500 rounded-full border-2 border-white',
        'transition-all duration-200',
        positionClasses[position],
        className
      )}
      {...props}
    >
      {displayCount}
    </span>
  );
};

// ============================================================================
// BADGE GROUP COMPONENT
// ============================================================================

interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
  maxVisible?: number;
  spacing?: 'sm' | 'md' | 'lg';
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  children,
  className,
  maxVisible,
  spacing = 'sm'
}) => {
  const spacingClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  };

  const childrenArray = React.Children.toArray(children);
  const visibleChildren = maxVisible ? childrenArray.slice(0, maxVisible) : childrenArray;
  const hiddenCount = maxVisible ? childrenArray.length - maxVisible : 0;

  return (
    <div className={cn('flex flex-wrap items-center', spacingClasses[spacing], className)}>
      {visibleChildren}
      {hiddenCount > 0 && (
        <Badge variant="neutral" size="sm">
          +{hiddenCount}
        </Badge>
      )}
    </div>
  );
};

// ============================================================================
// ACTIVITY BADGE (for recent activity indicators)
// ============================================================================

interface ActivityBadgeProps extends Omit<BadgeProps, 'children'> {
  type: 'new' | 'updated' | 'urgent' | 'deadline';
  message: string;
}

export const ActivityBadge: React.FC<ActivityBadgeProps> = ({
  type,
  message,
  className,
  ...props
}) => {
  const typeConfig = {
    new: {
      variant: 'success' as const,
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      pulse: false
    },
    updated: {
      variant: 'info' as const,
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      pulse: false
    },
    urgent: {
      variant: 'error' as const,
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      pulse: true
    },
    deadline: {
      variant: 'warning' as const,
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      pulse: false
    }
  };

  const config = typeConfig[type];

  return (
    <Badge
      variant={config.variant}
      size="sm"
      icon={config.icon}
      pulse={config.pulse}
      className={className}
      {...props}
    >
      {message}
    </Badge>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  Badge as default,
  StatusBadge,
  PriorityBadge,
  NotificationBadge,
  BadgeGroup,
  ActivityBadge
};