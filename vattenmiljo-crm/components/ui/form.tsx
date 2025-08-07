// ============================================================================
// FORM COMPONENTS - Form Layout & Validation
// ============================================================================

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    error?: boolean;
    required?: boolean;
    disabled?: boolean;
  }
  
  export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
    disabled?: boolean;
  }
  
  export interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
  }
  
  export interface FormHintProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
  }
  
  export const FormGroup: React.FC<FormGroupProps> = ({
    error = false,
    required = false,
    disabled = false,
    className,
    children,
    ...props
  }) => (
    <div
      className={cn(
        'space-y-2',
        disabled && 'opacity-60',
        error && 'text-red-600',
        className
      )}
      data-required={required}
      {...props}
    >
      {children}
    </div>
  );
  
  export const FormLabel: React.FC<FormLabelProps> = ({
    required = false,
    disabled = false,
    className,
    children,
    ...props
  }) => (
    <label
      className={cn(
        'block text-sm font-medium text-neutral-700',
        disabled && 'text-neutral-400',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
  
  export const FormError: React.FC<FormErrorProps> = ({
    className,
    children,
    ...props
  }) => (
    <p
      className={cn('text-sm text-red-600', className)}
      {...props}
    >
      {children}
    </p>
  );
  
  export const FormHint: React.FC<FormHintProps> = ({
    className,
    children,
    ...props
  }) => (
    <p
      className={cn('text-sm text-neutral-500', className)}
      {...props}
    >
      {children}
    </p>
  );
  