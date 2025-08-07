// ============================================================================
// INPUT COMPONENTS - Form Inputs & Controls
// ============================================================================

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  error?: string;
  label?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  error?: string;
  label?: string;
  hint?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  error?: string;
  label?: string;
  hint?: string;
  placeholder?: string;
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
}

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  error?: string;
  inputSize?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  error?: string;
  inputSize?: 'sm' | 'md' | 'lg';
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>;
  orientation?: 'horizontal' | 'vertical';
  error?: string;
  label?: string;
  hint?: string;
  className?: string;
}

// ============================================================================
// COMPONENT STYLES
// ============================================================================

const inputVariants = {
  default: {
    base: 'border border-neutral-300 bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500'
  },
  filled: {
    base: 'border-0 bg-neutral-100 focus:bg-white focus:ring-2 focus:ring-primary-500',
    error: 'bg-red-50 focus:bg-red-50 focus:ring-red-500'
  },
  outlined: {
    base: 'border-2 border-neutral-300 bg-transparent focus:border-primary-500',
    error: 'border-red-500 focus:border-red-500'
  }
};

const inputSizes = {
  sm: {
    input: 'h-8 px-3 text-sm',
    textarea: 'px-3 py-2 text-sm',
    icon: 'w-4 h-4',
    iconContainer: 'px-2'
  },
  md: {
    input: 'h-10 px-3 text-sm',
    textarea: 'px-3 py-2 text-sm',
    icon: 'w-5 h-5',
    iconContainer: 'px-3'
  },
  lg: {
    input: 'h-12 px-4 text-base',
    textarea: 'px-4 py-3 text-base',
    icon: 'w-6 h-6',
    iconContainer: 'px-4'
  }
};

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      inputSize = 'md',
      type = 'text',
      error,
      label,
      hint,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const hasLeftElement = Boolean(leftIcon || leftAddon);
    const hasRightElement = Boolean(rightIcon || rightAddon);

    const inputClasses = cn(
      // Base styles
      'w-full rounded-lg transition-colors duration-200 placeholder:text-neutral-500',
      'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
      'focus:outline-none',
      
      // Variant styles
      hasError ? inputVariants[variant].error : inputVariants[variant].base,
      
      // Size styles
      inputSizes[inputSize].input,
      
      // Padding adjustments for icons/addons
      hasLeftElement && 'pl-10',
      hasRightElement && 'pr-10',
      
      className
    );

    const WrapperComponent = leftAddon || rightAddon ? 'div' : React.Fragment;
    const wrapperProps = leftAddon || rightAddon ? {
      className: 'relative flex items-stretch'
    } : {};

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
          </label>
        )}
        
        <WrapperComponent {...wrapperProps}>
          {leftAddon && (
            <div className="flex items-center px-3 bg-neutral-50 border border-r-0 border-neutral-300 rounded-l-lg text-neutral-500 text-sm">
              {leftAddon}
            </div>
          )}
          
          <div className="relative flex-1">
            <input
              ref={ref}
              type={type}
              disabled={disabled}
              className={cn(
                inputClasses,
                leftAddon ? 'rounded-l-none' : undefined,
                rightAddon ? 'rounded-r-none' : undefined
              )}
              {...props}
            />
            
            {leftIcon && !leftAddon && (
              <div className={cn(
                'absolute left-0 top-0 h-full flex items-center text-neutral-500',
                inputSizes[inputSize].iconContainer
              )}>
                <div className={inputSizes[inputSize].icon}>
                  {leftIcon}
                </div>
              </div>
            )}
            
            {rightIcon && !rightAddon && (
              <div className={cn(
                'absolute right-0 top-0 h-full flex items-center text-neutral-500',
                inputSizes[inputSize].iconContainer
              )}>
                <div className={inputSizes[inputSize].icon}>
                  {rightIcon}
                </div>
              </div>
            )}
          </div>
          
          {rightAddon && (
            <div className="flex items-center px-3 bg-neutral-50 border border-l-0 border-neutral-300 rounded-r-lg text-neutral-500 text-sm">
              {rightAddon}
            </div>
          )}
        </WrapperComponent>
        
        {(error || hint) && (
          <div className="mt-1">
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {hint && !error && (
              <p className="text-sm text-neutral-500">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant = 'default',
      inputSize = 'md',
      error,
      label,
      hint,
      resize = 'vertical',
      rows = 4,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    };

    const textareaClasses = cn(
      // Base styles
      'w-full rounded-lg transition-colors duration-200 placeholder:text-neutral-500',
      'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
      'focus:outline-none',
      
      // Variant styles
      hasError ? inputVariants[variant].error : inputVariants[variant].base,
      
      // Size styles
      inputSizes[inputSize].textarea,
      
      // Resize styles
      resizeClasses[resize],
      
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          rows={rows}
          disabled={disabled}
          className={textareaClasses}
          {...props}
        />
        
        {(error || hint) && (
          <div className="mt-1">
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {hint && !error && (
              <p className="text-sm text-neutral-500">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================================================
// SELECT COMPONENT
// ============================================================================

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant = 'default',
      inputSize = 'md',
      error,
      label,
      hint,
      placeholder,
      options = [],
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);

    const selectClasses = cn(
      // Base styles
      'w-full rounded-lg transition-colors duration-200 appearance-none cursor-pointer',
      'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
      'focus:outline-none bg-white',
      
      // Variant styles
      hasError ? inputVariants[variant].error : inputVariants[variant].base,
      
      // Size styles
      inputSizes[inputSize].input,
      
      // Arrow padding
      'pr-10',
      
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={selectClasses}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
            
            {children}
          </select>
          
          {/* Custom arrow */}
          <div className="absolute right-3 top-0 h-full flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 10l5 5 5-5"
              />
            </svg>
          </div>
        </div>
        
        {(error || hint) && (
          <div className="mt-1">
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {hint && !error && (
              <p className="text-sm text-neutral-500">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      description,
      error,
      inputSize = 'md',
      indeterminate = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);
    
    React.useEffect(() => {
      const checkbox = checkboxRef.current || (ref as React.RefObject<HTMLInputElement>)?.current;
      if (checkbox) {
        checkbox.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    const checkboxClasses = cn(
      'rounded border-neutral-300 text-primary-500 focus:ring-primary-500 focus:ring-2 focus:ring-offset-2',
      'disabled:bg-neutral-50 disabled:border-neutral-200 disabled:cursor-not-allowed',
      'cursor-pointer',
      sizeClasses[inputSize],
      className
    );

    return (
      <div className="w-full">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={ref || checkboxRef}
              type="checkbox"
              disabled={disabled}
              className={checkboxClasses}
              {...props}
            />
          </div>
          
          {(label || description) && (
            <div className="ml-3">
              {label && (
                <label
                  htmlFor={props.id}
                  className={cn(
                    'block font-medium text-neutral-900 cursor-pointer',
                    inputSize === 'sm' && 'text-sm',
                    inputSize === 'md' && 'text-sm',
                    inputSize === 'lg' && 'text-base',
                    disabled && 'text-neutral-500 cursor-not-allowed'
                  )}
                >
                  {label}
                </label>
              )}
              
              {description && (
                <p className={cn(
                  'text-neutral-600',
                  inputSize === 'sm' && 'text-xs',
                  inputSize === 'md' && 'text-sm',
                  inputSize === 'lg' && 'text-sm',
                  disabled && 'text-neutral-400'
                )}>
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ============================================================================
// RADIO COMPONENT
// ============================================================================

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      label,
      description,
      error,
      inputSize = 'md',
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    const radioClasses = cn(
      'border-neutral-300 text-primary-500 focus:ring-primary-500 focus:ring-2 focus:ring-offset-2',
      'disabled:bg-neutral-50 disabled:border-neutral-200 disabled:cursor-not-allowed',
      'cursor-pointer',
      sizeClasses[inputSize],
      className
    );

    return (
      <div className="w-full">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              type="radio"
              disabled={disabled}
              className={radioClasses}
              {...props}
            />
          </div>
          
          {(label || description) && (
            <div className="ml-3">
              {label && (
                <label
                  htmlFor={props.id}
                  className={cn(
                    'block font-medium text-neutral-900 cursor-pointer',
                    inputSize === 'sm' && 'text-sm',
                    inputSize === 'md' && 'text-sm',
                    inputSize === 'lg' && 'text-base',
                    disabled && 'text-neutral-500 cursor-not-allowed'
                  )}
                >
                  {label}
                </label>
              )}
              
              {description && (
                <p className={cn(
                  'text-neutral-600',
                  inputSize === 'sm' && 'text-xs',
                  inputSize === 'md' && 'text-sm',
                  inputSize === 'lg' && 'text-sm',
                  disabled && 'text-neutral-400'
                )}>
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

// ============================================================================
// RADIO GROUP COMPONENT
// ============================================================================

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  orientation = 'vertical',
  error,
  label,
  hint,
  className
}) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-neutral-700">
            {label}
          </label>
          {hint && (
            <p className="mt-1 text-sm text-neutral-500">{hint}</p>
          )}
        </div>
      )}
      
      <div className={cn(
        'space-y-3',
        orientation === 'horizontal' && 'flex space-y-0 space-x-6'
      )}>
        {options.map((option, index) => (
          <Radio
            key={option.value}
            id={`${name}-${index}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            label={option.label}
            description={option.description}
            disabled={option.disabled}
          />
        ))}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};