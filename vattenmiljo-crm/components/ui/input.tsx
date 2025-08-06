// ============================================================================
// INPUT COMPONENTS - Modern Form Elements
// ============================================================================

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  fullWidth?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  fullWidth?: boolean;
}

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      loading = false,
      disabled = false,
      fullWidth = true,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isDisabled = disabled || loading;

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium transition-colors',
              error ? 'text-red-600' : 'text-neutral-700',
              isDisabled && 'text-neutral-400'
            )}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none">
              {loading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                leftIcon
              )}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={type}
            id={inputId}
            disabled={isDisabled}
            className={cn(
              // Base styles
              'block w-full px-4 py-3 text-base placeholder-neutral-400',
              'bg-white border border-neutral-200 rounded-xl',
              'transition-all duration-200 ease-out',
              
              // Focus styles
              'focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500',
              
              // Hover styles
              'hover:border-neutral-300',
              
              // Icon padding
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              
              // Error styles
              error && [
                'border-red-300 focus:border-red-500 focus:ring-red-100',
                'hover:border-red-400'
              ],
              
              // Disabled styles
              isDisabled && [
                'bg-neutral-50 text-neutral-400 cursor-not-allowed',
                'border-neutral-200 hover:border-neutral-200'
              ],
              
              // Loading styles
              loading && 'cursor-wait',
              
              className
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none">
              {rightIcon}
            </div>
          )}

          {/* Focus Ring Effect */}
          {isFocused && (
            <div className="absolute inset-0 rounded-xl border-2 border-primary-500 pointer-events-none opacity-20" />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}

        {/* Hint Text */}
        {hint && !error && (
          <p className="text-sm text-neutral-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      resize = 'vertical',
      disabled = false,
      fullWidth = true,
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    };

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium transition-colors',
              error ? 'text-red-600' : 'text-neutral-700',
              disabled && 'text-neutral-400'
            )}
          >
            {label}
          </label>
        )}

        {/* Textarea Container */}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            disabled={disabled}
            className={cn(
              // Base styles
              'block w-full px-4 py-3 text-base placeholder-neutral-400',
              'bg-white border border-neutral-200 rounded-xl',
              'transition-all duration-200 ease-out',
              
              // Focus styles
              'focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500',
              
              // Hover styles
              'hover:border-neutral-300',
              
              // Resize styles
              resizeClasses[resize],
              
              // Error styles
              error && [
                'border-red-300 focus:border-red-500 focus:ring-red-100',
                'hover:border-red-400'
              ],
              
              // Disabled styles
              disabled && [
                'bg-neutral-50 text-neutral-400 cursor-not-allowed',
                'border-neutral-200 hover:border-neutral-200'
              ],
              
              className
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Focus Ring Effect */}
          {isFocused && (
            <div className="absolute inset-0 rounded-xl border-2 border-primary-500 pointer-events-none opacity-20" />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}

        {/* Hint Text */}
        {hint && !error && (
          <p className="text-sm text-neutral-500">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================================================
// SELECT COMPONENT
// ============================================================================

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      placeholder,
      options,
      disabled = false,
      fullWidth = true,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={selectId}
            className={cn(
              'block text-sm font-medium transition-colors',
              error ? 'text-red-600' : 'text-neutral-700',
              disabled && 'text-neutral-400'
            )}
          >
            {label}
          </label>
        )}

        {/* Select Container */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              // Base styles
              'block w-full px-4 py-3 text-base bg-white border border-neutral-200 rounded-xl',
              'transition-all duration-200 ease-out appearance-none cursor-pointer',
              
              // Focus styles
              'focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500',
              
              // Hover styles
              'hover:border-neutral-300',
              
              // Error styles
              error && [
                'border-red-300 focus:border-red-500 focus:ring-red-100',
                'hover:border-red-400'
              ],
              
              // Disabled styles
              disabled && [
                'bg-neutral-50 text-neutral-400 cursor-not-allowed',
                'border-neutral-200 hover:border-neutral-200'
              ],
              
              className
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          >
            {/* Placeholder option */}
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            
            {/* Options */}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value} 
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown Arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Focus Ring Effect */}
          {isFocused && (
            <div className="absolute inset-0 rounded-xl border-2 border-primary-500 pointer-events-none opacity-20" />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}

        {/* Hint Text */}
        {hint && !error && (
          <p className="text-sm text-neutral-500">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ============================================================================
// PHONE INPUT COMPONENT (Swedish focused)
// ============================================================================

interface PhoneInputProps extends Omit<InputProps, 'type'> {
  formatOnBlur?: boolean;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ formatOnBlur = true, ...props }, ref) => {
    const [value, setValue] = useState(props.value || '');

    const formatPhoneNumber = (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      
      // Swedish mobile format 07X-XXX XX XX
      if (cleaned.startsWith('07') && cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
      }
      
      // Stockholm area format 08-XXX XX XX
      if (cleaned.startsWith('08') && cleaned.length === 10) {
        return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
      }
      
      return phone;
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (formatOnBlur && e.target.value) {
        const formatted = formatPhoneNumber(e.target.value);
        setValue(formatted);
        props.onChange?.({ ...e, target: { ...e.target, value: formatted } } as any);
      }
      props.onBlur?.(e);
    };

    return (
      <Input
        ref={ref}
        type="tel"
        leftIcon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        }
        placeholder="07X-XXX XX XX"
        {...props}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          props.onChange?.(e);
        }}
        onBlur={handleBlur}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

// ============================================================================
// SEARCH INPUT COMPONENT
// ============================================================================

interface SearchInputProps extends Omit<InputProps, 'type' | 'leftIcon'> {
  onClear?: () => void;
  showClearButton?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, showClearButton = true, ...props }, ref) => {
    const hasValue = props.value && props.value.toString().length > 0;

    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        rightIcon={
          showClearButton && hasValue && (
            <button
              type="button"
              onClick={onClear}
              className="hover:text-neutral-600 transition-colors pointer-events-auto"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )
        }
        placeholder="Sök kunder..."
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

// ============================================================================
// FORM GROUP COMPONENT
// ============================================================================

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'column';
  gap?: 'sm' | 'md' | 'lg';
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  className,
  direction = 'column',
  gap = 'md'
}) => {
  const gapClasses = {
    sm: direction === 'row' ? 'gap-2' : 'space-y-2',
    md: direction === 'row' ? 'gap-4' : 'space-y-4',
    lg: direction === 'row' ? 'gap-6' : 'space-y-6'
  };

  return (
    <div
      className={cn(
        direction === 'row' ? 'flex flex-wrap items-end' : 'block',
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Input;