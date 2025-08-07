// ============================================================================
// BUTTON COMPONENT - Modern UI Component
// ============================================================================

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'icon'> {
  icon: React.ReactNode;
  'aria-label': string;
  tooltip?: string;
}

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  orientation?: 'horizontal' | 'vertical';
}

// ============================================================================
// COMPONENT STYLES
// ============================================================================

const buttonVariants = {
  primary: [
    'bg-gradient-to-r from-primary-500 to-primary-600 text-white',
    'hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:scale-105',
    'focus:ring-primary-500 focus:ring-4 focus:ring-opacity-20',
    'active:from-primary-700 active:to-primary-800',
    'disabled:from-primary-300 disabled:to-primary-400 disabled:cursor-not-allowed',
    'shadow-[0_4px_15px_rgba(37,99,235,0.25)]'
  ],
  secondary: [
    'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700',
    'hover:from-neutral-200 hover:to-neutral-300 hover:shadow-md hover:scale-105',
    'focus:ring-neutral-500 focus:ring-4 focus:ring-opacity-20',
    'active:from-neutral-300 active:to-neutral-400',
    'disabled:from-neutral-50 disabled:to-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed',
    'border border-neutral-200'
  ],
  outline: [
    'bg-transparent text-neutral-600 border-2 border-neutral-300',
    'hover:bg-neutral-50 hover:border-neutral-400 hover:text-neutral-800 hover:scale-105',
    'focus:ring-neutral-500 focus:ring-4 focus:ring-opacity-20',
    'active:bg-neutral-100',
    'disabled:text-neutral-300 disabled:border-neutral-200 disabled:cursor-not-allowed'
  ],
  ghost: [
    'bg-transparent text-neutral-600',
    'hover:bg-neutral-100 hover:text-neutral-800 hover:scale-105',
    'focus:ring-neutral-500 focus:ring-4 focus:ring-opacity-20',
    'active:bg-neutral-200',
    'disabled:text-neutral-300 disabled:cursor-not-allowed'
  ],
  danger: [
    'bg-gradient-to-r from-red-500 to-red-600 text-white',
    'hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:scale-105',
    'focus:ring-red-500 focus:ring-4 focus:ring-opacity-20',
    'active:from-red-700 active:to-red-800',
    'disabled:from-red-300 disabled:to-red-400 disabled:cursor-not-allowed',
    'shadow-[0_4px_15px_rgba(239,68,68,0.25)]'
  ],
  success: [
    'bg-gradient-to-r from-accent-500 to-accent-600 text-white',
    'hover:from-accent-600 hover:to-accent-700 hover:shadow-lg hover:scale-105',
    'focus:ring-accent-500 focus:ring-4 focus:ring-opacity-20',
    'active:from-accent-700 active:to-accent-800',
    'disabled:from-accent-300 disabled:to-accent-400 disabled:cursor-not-allowed',
    'shadow-[0_4px_15px_rgba(16,185,129,0.25)]'
  ]
};

const buttonSizes = {
  sm: ['px-4 py-2 text-sm rounded-lg', 'min-h-[2rem]'],
  md: ['px-6 py-3 text-base rounded-xl', 'min-h-[2.75rem]'],
  lg: ['px-8 py-4 text-lg rounded-xl', 'min-h-[3.25rem]'],
  xl: ['px-10 py-5 text-xl rounded-2xl', 'min-h-[3.75rem]']
};

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

const LoadingSpinner: React.FC<{ size: ButtonProps['size'] }> = ({ size = 'md' }) => {
  const spinnerSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  }[size];

  return (
    <svg
      className={cn('animate-spin', spinnerSize)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus-visible:outline-none',
          'relative overflow-hidden',
          'select-none touch-manipulation',
          
          // Size styles
          buttonSizes[size].join(' '),
          
          // Variant styles
          buttonVariants[variant].join(' '),
          
          // Full width
          fullWidth && 'w-full',
          
          // Loading state
          loading && 'pointer-events-none',
          
          // Disabled state
          isDisabled && 'transform-none shadow-none',
          
          // Custom hover effect overlay
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
          'before:transform before:-translate-x-full before:transition-transform before:duration-500',
          'hover:before:translate-x-full',
          
          className
        )}
        {...props}
      >
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size={size} />
          </div>
        )}
        
        {/* Button Content */}
        <span className={cn(
          'flex items-center gap-2',
          loading && 'opacity-0'
        )}>
          {/* Left Icon */}
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          
          {/* Button Text */}
          {children && (
            <span className="truncate">{children}</span>
          )}
          
          {/* Right Icon */}
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// BUTTON GROUP COMPONENT
// ============================================================================

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
  orientation = 'horizontal',
  size,
  variant
}) => {
  return (
    <div
      className={cn(
        'inline-flex',
        orientation === 'horizontal' 
          ? 'flex-row -space-x-px' 
          : 'flex-col -space-y-px',
        '[&>button:first-child]:rounded-r-none [&>button:last-child]:rounded-l-none',
        '[&>button:not(:first-child):not(:last-child)]:rounded-none',
        orientation === 'vertical' && [
          '[&>button:first-child]:rounded-b-none [&>button:last-child]:rounded-t-none',
          '[&>button:not(:first-child):not(:last-child)]:rounded-none'
        ].join(' '),
        className
      )}
      role="group"
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === Button) {
          return React.cloneElement(child as React.ReactElement<ButtonProps>, {
            size: size || (child.props as ButtonProps).size,
            variant: variant || (child.props as ButtonProps).variant,
          });
        }
        return child;
      })}
    </div>
  );
};

// ============================================================================
// ICON BUTTON COMPONENT
// ============================================================================

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'md', ...props }, ref) => {
    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5', 
      lg: 'w-6 h-6',
      xl: 'w-7 h-7'
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          'aspect-square p-0',
          buttonSizes[size][0].replace(/px-\d+/, 'px-0'),
          className
        )}
        {...props}
      >
        <span className={iconSizes[size]}>{icon}</span>
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// ============================================================================
// FLOATING ACTION BUTTON
// ============================================================================

interface FABProps extends Omit<ButtonProps, 'size' | 'variant'> {
  icon: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  extended?: boolean;
}

export const FAB: React.FC<FABProps> = ({
  icon,
  position = 'bottom-right',
  extended = false,
  children,
  className,
  ...props
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <Button
      variant="primary"
      size={extended ? 'lg' : 'md'}
      className={cn(
        'fixed z-40 shadow-xl',
        !extended && 'aspect-square p-0 rounded-full min-h-14 min-w-14',
        extended && 'rounded-full px-6',
        'hover:scale-110 hover:shadow-2xl',
        'transition-all duration-300',
        positionClasses[position],
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-3">
        {icon}
        {extended && children && (
          <span className="font-semibold">{children}</span>
        )}
      </span>
    </Button>
  );
};

// ============================================================================
// ADDITIONAL BUTTON COMPONENTS
// ============================================================================

// CTA Button Component
export const CTAButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <Button 
      ref={ref}
      variant="primary" 
      size="lg"
      {...props}
    >
      {children}
    </Button>
  )
);
CTAButton.displayName = 'CTAButton';

// Link Button Component  
export const LinkButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <Button 
      ref={ref}
      variant="ghost" 
      {...props}
    >
      {children}
    </Button>
  )
);
LinkButton.displayName = 'LinkButton';

// Loading Button Component
export const LoadingButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, loading, ...props }, ref) => (
    <Button 
      ref={ref}
      loading={loading}
      {...props}
    >
      {children}
    </Button>
  )
);
LoadingButton.displayName = 'LoadingButton';

// Button Icons Component
export const ButtonIcons = {
  loading: <span className="animate-spin">⟳</span>,
  success: <span>✓</span>,
  error: <span>✗</span>,
  warning: <span>⚠</span>,
  info: <span>ℹ</span>
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Button;