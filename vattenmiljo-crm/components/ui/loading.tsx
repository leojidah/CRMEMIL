// ============================================================================
// LOADING COMPONENTS - Spinners & Skeletons
// ============================================================================

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'neutral';
  className?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  overlay?: boolean;
  className?: string;
}

export interface SkeletonLoaderProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
  animate?: boolean;
}

// ============================================================================
// COMPONENT STYLES
// ============================================================================

const spinnerSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const spinnerColors = {
  primary: 'text-primary-500',
  white: 'text-white',
  neutral: 'text-neutral-500'
};


// ============================================================================
// SPINNER COMPONENT
// ============================================================================

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className
}) => {
  return (
    <svg
      className={cn(
        'animate-spin',
        spinnerSizes[size],
        spinnerColors[color],
        className
      )}
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
};

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Laddar...',
  overlay = false,
  className
}) => {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-3',
      overlay && 'bg-white/80 backdrop-blur-sm',
      className
    )}>
      <Spinner size={size} color={overlay ? 'primary' : 'primary'} />
      
      {text && (
        <p className={cn(
          'font-medium text-neutral-600',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
          size === 'xl' && 'text-lg'
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// ============================================================================
// SKELETON LOADER COMPONENT
// ============================================================================

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width = '100%',
  height,
  lines = 1,
  className,
  animate = true
}) => {
  const baseClasses = cn(
    'bg-neutral-200',
    animate && 'animate-pulse',
    className
  );

  if (variant === 'circular') {
    const size = width || height || '3rem';
    return (
      <div
        className={cn(baseClasses, 'rounded-full')}
        style={{ width: size, height: size }}
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={cn(baseClasses, 'rounded')}
        style={{ 
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height || '2rem'
        }}
      />
    );
  }

  // Text variant
  if (lines === 1) {
    return (
      <div
        className={cn(baseClasses, 'h-4 rounded')}
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
      />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => {
        const isLast = index === lines - 1;
        const lineWidth = isLast ? '75%' : '100%';
        
        return (
          <div
            key={index}
            className={cn(baseClasses, 'h-4 rounded')}
            style={{ 
              width: typeof width === 'number' ? `${width}px` : 
                     width !== '100%' ? width : lineWidth
            }}
          />
        );
      })}
    </div>
  );
};

// ============================================================================
// SKELETON COMPONENTS FOR COMMON PATTERNS
// ============================================================================

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white border border-neutral-200 rounded-lg p-6 animate-pulse', className)}>
    <div className="flex items-start space-x-4">
      <SkeletonLoader variant="circular" width="3rem" height="3rem" />
      <div className="flex-1 space-y-2">
        <SkeletonLoader width="60%" />
        <SkeletonLoader width="40%" />
      </div>
    </div>
    
    <div className="mt-4 space-y-2">
      <SkeletonLoader lines={3} />
    </div>
    
    <div className="mt-6 flex space-x-3">
      <SkeletonLoader variant="rectangular" width="5rem" height="2.5rem" />
      <SkeletonLoader variant="rectangular" width="4rem" height="2.5rem" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string 
}> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => (
  <div className={cn('bg-white border border-neutral-200 rounded-lg overflow-hidden animate-pulse', className)}>
    {/* Header */}
    <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200">
      <div className="flex space-x-6">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="flex-1">
            <SkeletonLoader width="60%" />
          </div>
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-neutral-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="flex space-x-6">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1">
                <SkeletonLoader width={colIndex === 0 ? '80%' : '60%'} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonList: React.FC<{ 
  items?: number; 
  showAvatar?: boolean;
  className?: string;
}> = ({ 
  items = 5, 
  showAvatar = true,
  className 
}) => (
  <div className={cn('space-y-4 animate-pulse', className)}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4">
        {showAvatar && (
          <SkeletonLoader variant="circular" width="2.5rem" height="2.5rem" />
        )}
        <div className="flex-1 space-y-2">
          <SkeletonLoader width="75%" />
          <SkeletonLoader width="50%" />
        </div>
        <SkeletonLoader variant="rectangular" width="4rem" height="2rem" />
      </div>
    ))}
  </div>
);

// ============================================================================
// LOADING STATES FOR FORMS
// ============================================================================

export const SkeletonForm: React.FC<{ 
  fields?: number;
  className?: string;
}> = ({ 
  fields = 4,
  className 
}) => (
  <div className={cn('space-y-6 animate-pulse', className)}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <SkeletonLoader width="25%" />
        <SkeletonLoader variant="rectangular" height="2.5rem" />
      </div>
    ))}
    
    <div className="flex space-x-3 pt-4">
      <SkeletonLoader variant="rectangular" width="6rem" height="2.5rem" />
      <SkeletonLoader variant="rectangular" width="5rem" height="2.5rem" />
    </div>
  </div>
);

// ============================================================================
// LOADING OVERLAY
// ============================================================================

export const LoadingOverlay: React.FC<{
  loading: boolean;
  text?: string;
  children: React.ReactNode;
}> = ({ loading, text = 'Laddar...', children }) => {
  return (
    <div className="relative">
      {children}
      
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <LoadingSpinner text={text} />
        </div>
      )}
    </div>
  );
};