// ============================================================================
// INPUT COMPONENT - Form Input Fields
// ============================================================================

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  variant?: 'default' | 'filled' | 'outlined';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  fullWidth?: boolean;
}

// ============================================================================
// COMPONENT STYLES
// ============================================================================

const inputVariants = {
  default: [
    'border border-gray-300',
    'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    'bg-white'
  ],
  filled: [
    'border-0',
    'bg-gray-50 focus:bg-white',
    'focus:ring-2 focus:ring-blue-500'
  ],
  outlined: [
    'border-2 border-gray-300',
    'focus:border-blue-500',
    'bg-transparent'
  ]
};

const inputSizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-4 py-3 text-lg'
};

const baseInputClasses = [
  'block w-full rounded-md',
  'placeholder-gray-400',
  'transition-all duration-200',
  'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
  'focus:outline-none'
];

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      variant = 'default',
      inputSize = 'md',
      fullWidth = true,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    return (
      <div className={cn(!fullWidth && 'inline-block')}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <div className="w-5 h-5 text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseInputClasses,
              inputVariants[variant],
              inputSizes[inputSize],
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              hasError && [
                'border-red-300 text-red-900 placeholder-red-300',
                'focus:border-red-500 focus:ring-red-500'
              ],
              !fullWidth && 'w-auto',
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="w-5 h-5 text-gray-400">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {(error || helper) && (
          <div className="mt-1">
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {helper && !error && (
              <p className="text-sm text-gray-500">
                {helper}
              </p>
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

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helper,
      variant = 'default',
      resize = 'vertical',
      fullWidth = true,
      id,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    };

    return (
      <div className={cn(!fullWidth && 'inline-block')}>
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            baseInputClasses,
            inputVariants[variant],
            inputSizes.md,
            resizeClasses[resize],
            hasError && [
              'border-red-300 text-red-900 placeholder-red-300',
              'focus:border-red-500 focus:ring-red-500'
            ],
            !fullWidth && 'w-auto',
            className
          )}
          {...props}
        />
        
        {(error || helper) && (
          <div className="mt-1">
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {helper && !error && (
              <p className="text-sm text-gray-500">
                {helper}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================================================
// PASSWORD INPUT COMPONENT
// ============================================================================

interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showStrength?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState(0);

    const calculateStrength = (password: string): number => {
      let score = 0;
      if (password.length >= 8) score += 1;
      if (/[a-z]/.test(password)) score += 1;
      if (/[A-Z]/.test(password)) score += 1;
      if (/[0-9]/.test(password)) score += 1;
      if (/[^A-Za-z0-9]/.test(password)) score += 1;
      return score;
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const password = e.target.value;
      if (showStrength) {
        setStrength(calculateStrength(password));
      }
      props.onChange?.(e);
    };

    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const strengthLabels = ['Mycket svag', 'Svag', 'Okej', 'Stark', 'Mycket stark'];

    return (
      <div>
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12.756m0 0l3.122-3.122M15 3m.122 9.878a10.05 10.05 0 01-4.122 7.825" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          }
          onChange={handlePasswordChange}
          {...props}
        />
        
        {showStrength && props.value && (
          <div className="mt-2">
            <div className="flex space-x-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 h-1 rounded-full',
                    i < strength ? strengthColors[strength - 1] : 'bg-gray-200'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600">
              Lösenordsstyrka: {strengthLabels[strength - 1] || 'Ange lösenord'}
            </p>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

// ============================================================================
// PHONE INPUT COMPONENT
// ============================================================================

interface PhoneInputProps extends Omit<InputProps, 'type'> {
  format?: 'swedish' | 'international';
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ format = 'swedish', onChange, ...props }, ref) => {
    const formatSwedishPhone = (value: string): string => {
      // Remove all non-digits
      const digits = value.replace(/\D/g, '');
      
      // Apply Swedish phone number formatting
      if (digits.startsWith('46')) {
        // International format starting with 46
        const national = digits.slice(2);
        if (national.length <= 2) return `+46 ${national}`;
        if (national.length <= 5) return `+46 ${national.slice(0, 2)} ${national.slice(2)}`;
        return `+46 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5, 7)} ${national.slice(7, 9)}`;
      } else if (digits.startsWith('0')) {
        // National format starting with 0
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
      }
      
      return digits;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (format === 'swedish') {
        const formatted = formatSwedishPhone(e.target.value);
        e.target.value = formatted;
      }
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (format === 'swedish') {
        const formatted = formatSwedishPhone(e.target.value);
        e.target.value = formatted;
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
        placeholder={format === 'swedish' ? '070-123 45 67' : '+46 70 123 45 67'}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
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