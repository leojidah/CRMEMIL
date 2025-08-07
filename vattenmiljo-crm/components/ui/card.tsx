// ============================================================================
// CARD COMPONENTS - Layout Cards & Containers
// ============================================================================

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  clickable?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  divider?: boolean;
  children?: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  children: React.ReactNode;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period?: string;
  };
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
  className?: string;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: {
    src: string;
    alt: string;
  };
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
      loading?: boolean;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
  badge?: {
    label: string;
    variant?: 'default' | 'success' | 'warning' | 'error';
  };
  className?: string;
}

// ============================================================================
// COMPONENT STYLES
// ============================================================================

const cardVariants = {
  default: 'bg-white border border-neutral-200 shadow-sm',
  outlined: 'bg-white border-2 border-neutral-300',
  elevated: 'bg-white border border-neutral-200 shadow-lg',
  filled: 'bg-neutral-50 border border-neutral-200'
};

const cardPadding = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
};

const cardHeaderPadding = {
  none: '',
  sm: 'p-3',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
  xl: 'px-8 py-5'
};

const cardBodyPadding = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
};

const cardFooterPadding = {
  none: '',
  sm: 'p-3',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
  xl: 'px-8 py-5'
};

// ============================================================================
// CARD COMPONENT
// ============================================================================

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      clickable = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-lg transition-all duration-200 relative overflow-hidden',
          
          // Variant styles
          cardVariants[variant],
          
          // Padding
          cardPadding[padding],
          
          // Interactive states
          hoverable && 'hover:shadow-md hover:translate-y-[-1px]',
          clickable && 'cursor-pointer hover:shadow-md',
          
          // Loading state
          loading && 'opacity-70 pointer-events-none',
          
          className
        )}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================================================
// CARD HEADER COMPONENT
// ============================================================================

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    {
      className,
      title,
      subtitle,
      icon,
      actions,
      divider = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'flex items-start justify-between',
          cardHeaderPadding.md,
          
          // Divider
          divider && 'border-b border-neutral-200',
          
          className
        )}
        {...props}
      >
        <div className="flex items-start space-x-3 min-w-0 flex-1">
          {icon && (
            <div className="flex-shrink-0 w-6 h-6 text-neutral-600 mt-0.5">
              {icon}
            </div>
          )}
          
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-neutral-900 truncate">
                {title}
              </h3>
            )}
            
            {subtitle && (
              <p className="text-sm text-neutral-600 mt-1">
                {subtitle}
              </p>
            )}
            
            {children}
          </div>
        </div>
        
        {actions && (
          <div className="flex-shrink-0 ml-3">
            {actions}
          </div>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// ============================================================================
// CARD BODY COMPONENT
// ============================================================================

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  (
    {
      className,
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardBodyPadding[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// ============================================================================
// CARD FOOTER COMPONENT
// ============================================================================

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  (
    {
      className,
      divider = false,
      justify = 'end',
      children,
      ...props
    },
    ref
  ) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around'
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'flex items-center',
          cardFooterPadding.md,
          
          // Justify content
          justifyClasses[justify],
          
          // Divider
          divider && 'border-t border-neutral-200',
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'from-blue-500 to-blue-600',
  loading = false,
  className
}) => {
  const changeIcon = change?.direction === 'up' ? '↗' : change?.direction === 'down' ? '↘' : '→';
  const changeColor = change?.direction === 'up' ? 'text-green-600' : change?.direction === 'down' ? 'text-red-600' : 'text-neutral-600';

  return (
    <Card
      variant="elevated"
      hoverable
      loading={loading}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Background gradient */}
      <div className={cn('absolute top-0 right-0 w-24 h-24 opacity-10 bg-gradient-to-br rounded-full -mr-12 -mt-12', color)} />
      
      <CardBody padding="lg">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-600 truncate">
              {title}
            </p>
            
            <div className="mt-2">
              <p className="text-2xl font-bold text-neutral-900">
                {loading ? '--' : value}
              </p>
              
              {change && !loading && (
                <div className="flex items-center mt-2 text-sm">
                  <span className={cn('flex items-center font-medium', changeColor)}>
                    <span className="mr-1">{changeIcon}</span>
                    {Math.abs(change.value)}%
                  </span>
                  {change.period && (
                    <span className="text-neutral-500 ml-1">
                      {change.period}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {icon && (
            <div className={cn('flex-shrink-0 w-8 h-8 bg-gradient-to-br text-white rounded-lg flex items-center justify-center', color)}>
              {icon}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// ============================================================================
// FEATURE CARD COMPONENT
// ============================================================================

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  image,
  actions,
  badge,
  className
}) => {
  return (
    <Card 
      variant="outlined" 
      padding="none"
      hoverable
      className={className}
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden bg-neutral-100 relative">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <CardBody padding="lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 min-w-0 flex-1">
            {icon && !image && (
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                {icon}
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {title}
              </h3>
              
              <p className="text-neutral-600 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          
          {badge && (
            <div className={cn(
              'flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full ml-3',
              badge.variant === 'success' && 'bg-green-100 text-green-700',
              badge.variant === 'warning' && 'bg-yellow-100 text-yellow-700',
              badge.variant === 'error' && 'bg-red-100 text-red-700',
              (!badge.variant || badge.variant === 'default') && 'bg-neutral-100 text-neutral-700'
            )}>
              {badge.label}
            </div>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-neutral-200">
            {actions.primary && (
              <button
                onClick={actions.primary.onClick}
                disabled={actions.primary.loading}
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actions.primary.loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                )}
                {actions.primary.label}
              </button>
            )}
            
            {actions.secondary && (
              <button
                onClick={actions.secondary.onClick}
                className="inline-flex items-center px-4 py-2 text-neutral-700 text-sm font-medium rounded-lg border border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 transition-colors"
              >
                {actions.secondary.label}
              </button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// ============================================================================
// SKELETON CARD COMPONENT
// ============================================================================

export const CardSkeleton: React.FC<{ 
  variant?: 'default' | 'stats' | 'feature';
  className?: string;
}> = ({ 
  variant = 'default',
  className 
}) => {
  if (variant === 'stats') {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardBody padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-3" />
              <div className="h-8 bg-neutral-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-neutral-200 rounded w-1/3" />
            </div>
            <div className="w-8 h-8 bg-neutral-200 rounded-lg" />
          </div>
        </CardBody>
      </Card>
    );
  }
  
  if (variant === 'feature') {
    return (
      <Card variant="outlined" padding="none" className={cn('animate-pulse', className)}>
        <div className="aspect-video bg-neutral-200" />
        <CardBody padding="lg">
          <div className="h-5 bg-neutral-200 rounded w-3/4 mb-3" />
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-neutral-200 rounded" />
            <div className="h-4 bg-neutral-200 rounded w-5/6" />
          </div>
          <div className="flex space-x-3 pt-4 border-t border-neutral-200">
            <div className="h-9 bg-neutral-200 rounded-lg w-20" />
            <div className="h-9 bg-neutral-200 rounded-lg w-16" />
          </div>
        </CardBody>
      </Card>
    );
  }
  
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader divider>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-neutral-200 rounded" />
          <div>
            <div className="h-5 bg-neutral-200 rounded w-32 mb-2" />
            <div className="h-4 bg-neutral-200 rounded w-24" />
          </div>
        </div>
      </CardHeader>
      
      <CardBody>
        <div className="space-y-3">
          <div className="h-4 bg-neutral-200 rounded" />
          <div className="h-4 bg-neutral-200 rounded w-5/6" />
          <div className="h-4 bg-neutral-200 rounded w-4/6" />
        </div>
      </CardBody>
      
      <CardFooter divider>
        <div className="flex space-x-3">
          <div className="h-9 bg-neutral-200 rounded-lg w-20" />
          <div className="h-9 bg-neutral-200 rounded-lg w-16" />
        </div>
      </CardFooter>
    </Card>
  );
};