// ============================================================================
// BUTTON COMPONENTS - Interactive Elements
// ============================================================================

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  attached?: boolean;
  children: React.ReactNode;
}

// ============================================================================
// COMPONENT STYLES
// ============================================================================

const buttonVariants = {
  default: {
    base: 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400',
    active: 'bg-neutral-100 border-neutral-400',
    disabled: 'bg-neutral-50 text-neutral-400 border-neutral-200 cursor-not-allowed'
  },
  primary: {
    base: 'bg-primary-500 text-white border border-primary-500 hover:bg-primary-600 hover:border-primary-600',
    active: 'bg-primary-700 border-primary-700',
    disabled: 'bg-primary-300 text-primary-100 border-primary-300 cursor-not-allowed'
  },
  secondary: {
    base: 'bg-neutral-100 text-neutral-900 border border-neutral-300 hover:bg-neutral-200 hover:border-neutral-400',
    active: 'bg-neutral-300 border-neutral-400',
    disabled: 'bg-neutral-50 text-neutral-400 border-neutral-200 cursor-not-allowed'
  },
  success: {
    base: 'bg-green-500 text-white border border-green-500 hover:bg-green-600 hover:border-green-600',
    active: 'bg-green-700 border-green-700',
    disabled: 'bg-green-300 text-green-100 border-green-300 cursor-not-allowed'
  },
  warning: {
    base: 'bg-yellow-500 text-white border border-yellow-500 hover:bg-yellow-600 hover:border-yellow-600',
    active: 'bg-yellow-700 border-yellow-700',
    disabled: 'bg-yellow-300 text-yellow-100 border-yellow-300 cursor-not-allowed'
  },
  error: {
    base: 'bg-red-500 text-white border border-red-500 hover:bg-red-600 hover:border-red-600',
    active: 'bg-red-700 border-red-700',
    disabled: 'bg-red-300 text-red-100 border-red-300 cursor-not-allowed'
  },
  ghost: {
    base: 'bg-transparent text-neutral-700 border border-transparent hover:bg-neutral-100 hover:text-neutral-900',
    active: 'bg-neutral-200 text-neutral-900',
    disabled: 'text-neutral-400 cursor-not-allowed'
  },
  link: {
    base: 'bg-transparent text-primary-500 border border-transparent hover:text-primary-600 underline-offset-4 hover:underline',
    active: 'text-primary-700',
    disabled: 'text-neutral-400 cursor-not-allowed no-underline'
  }
};

const buttonSizes = {
  sm: {
    button: 'h-8 px-3 text-sm',
    icon: 'h-8 w-8 p-1.5',
    iconSize: 'w-4 h-4'
  },
  md: {
    button: 'h-10 px-4 text-sm',
    icon: 'h-10 w-10 p-2',
    iconSize: 'w-5 h-5'
  },
  lg: {
    button: 'h-12 px-6 text-base',
    icon: 'h-12 w-12 p-2.5',
    iconSize: 'w-6 h-6'
  },
  xl: {
    button: 'h-14 px-8 text-lg',
    icon: 'h-14 w-14 p-3',
    iconSize: 'w-7 h-7'
  }
};

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

const LoadingSpinner: React.FC<{ size: string }> = ({ size }) => (
  <svg
    className={cn('animate-spin', size)}
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
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    
    const buttonClasses = cn(
      // Base styles
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      
      // Size styles
      buttonSizes[size].button,
      
      // Variant styles
      isDisabled 
        ? buttonVariants[variant].disabled
        : buttonVariants[variant].base,
      
      // Focus ring color
      variant === 'primary' && 'focus:ring-primary-500',
      variant === 'success' && 'focus:ring-green-500',
      variant === 'warning' && 'focus:ring-yellow-500',
      variant === 'error' && 'focus:ring-red-500',
      (variant === 'default' || variant === 'secondary' || variant === 'ghost') && 'focus:ring-neutral-500',
      variant === 'link' && 'focus:ring-primary-500',
      
      // Full width
      fullWidth && 'w-full',
      
      className
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <LoadingSpinner size={buttonSizes[size].iconSize} />
        )}
        
        {!loading && leftIcon && (
          <span className={cn(buttonSizes[size].iconSize, children ? 'mr-2' : undefined)}>
            {leftIcon}
          </span>
        )}
        
        {loading && loadingText ? loadingText : children}
        
        {!loading && rightIcon && (
          <span className={cn(buttonSizes[size].iconSize, children ? 'ml-2' : undefined)}>
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// ICON BUTTON COMPONENT
// ============================================================================

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      loading = false,
      icon,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    
    const buttonClasses = cn(
      // Base styles
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      
      // Size styles
      buttonSizes[size].icon,
      
      // Variant styles
      isDisabled 
        ? buttonVariants[variant].disabled
        : buttonVariants[variant].base,
      
      // Focus ring color
      variant === 'primary' && 'focus:ring-primary-500',
      variant === 'success' && 'focus:ring-green-500',
      variant === 'warning' && 'focus:ring-yellow-500',
      variant === 'error' && 'focus:ring-red-500',
      (variant === 'default' || variant === 'secondary' || variant === 'ghost') && 'focus:ring-neutral-500',
      variant === 'link' && 'focus:ring-primary-500',
      
      className
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <LoadingSpinner size={buttonSizes[size].iconSize} />
        ) : (
          <span className={buttonSizes[size].iconSize}>
            {icon}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

// ============================================================================
// BUTTON GROUP COMPONENT
// ============================================================================

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      className,
      orientation = 'horizontal',
      size = 'md',
      variant,
      attached = false,
      children,
      ...props
    },
    ref
  ) => {
    const groupClasses = cn(
      // Base styles
      'inline-flex',
      
      // Orientation
      orientation === 'horizontal' ? 'flex-row' : 'flex-col',
      
      // Attached styles
      attached && orientation === 'horizontal' && 'divide-x divide-neutral-300',
      attached && orientation === 'vertical' && 'divide-y divide-neutral-300',
      
      // Spacing for non-attached groups
      !attached && orientation === 'horizontal' && 'space-x-2',
      !attached && orientation === 'vertical' && 'space-y-2',
      
      className
    );

    const processedChildren = React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;
      
      // Clone child with group props
      const childProps: Record<string, unknown> = {
        size,
        ...(variant && { variant })
      };
      
      // Add attached styling
      if (attached) {
        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;
        
        if (orientation === 'horizontal') {
          childProps.className = cn(
            child.props.className,
            isFirst && 'rounded-r-none',
            isLast && 'rounded-l-none',
            !isFirst && !isLast && 'rounded-none'
          );
        } else {
          childProps.className = cn(
            child.props.className,
            isFirst && 'rounded-b-none',
            isLast && 'rounded-t-none',
            !isFirst && !isLast && 'rounded-none'
          );
        }
      }
      
      return React.cloneElement(child, childProps);
    });

    return (
      <div
        ref={ref}
        className={groupClasses}
        role="group"
        {...props}
      >
        {processedChildren}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';