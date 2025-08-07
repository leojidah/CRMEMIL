// ============================================================================
// CARD COMPONENT - Content Containers & Layouts
// ============================================================================

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  interactive?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  separator?: boolean;
  children?: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  separator?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between';
  children?: React.ReactNode;
}

export interface StatsCardProps extends Omit<CardProps, 'children'> {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  description?: string;
  loading?: boolean;
}

export interface CustomerCardProps extends Omit<CardProps, 'children'> {
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    status: string;
    priority?: 'low' | 'medium' | 'high';
    lastContact?: string;
    avatar?: string;
  };
  onEdit?: (customerId: string) => void;
  onDelete?: (customerId: string) => void;
  onView?: (customerId: string) => void;
}

// ============================================================================
// COMPONENT STYLES
// ============================================================================

const cardVariants = {
  default: [
    'bg-white border border-neutral-200',
    'shadow-soft'
  ],
  elevated: [
    'bg-white border-0',
    'shadow-medium'
  ],
  bordered: [
    'bg-white border-2 border-neutral-300',
    'shadow-none'
  ],
  outlined: [
    'bg-transparent border border-neutral-300',
    'shadow-none'
  ],
  flat: [
    'bg-neutral-50 border-0',
    'shadow-none'
  ]
};

const cardPadding = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10'
};

const cardBodyPadding = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

// ============================================================================
// LOADING SKELETON COMPONENT
// ============================================================================

const CardSkeleton: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className 
}) => (
  <div className={cn('animate-pulse space-y-3', className)}>
    <div className="h-4 bg-neutral-200 rounded w-3/4" />
    {Array.from({ length: lines - 1 }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'h-3 bg-neutral-200 rounded',
          i === lines - 2 ? 'w-1/2' : 'w-full'
        )}
      />
    ))}
  </div>
);

// ============================================================================
// CARD COMPONENT
// ============================================================================

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      interactive = false,
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
          'rounded-large overflow-hidden',
          'transition-all duration-200 ease-out',
          
          // Variant styles
          cardVariants[variant].join(' '),
          
          // Padding
          cardPadding[padding],
          
          // Interactive states
          hover && 'hover:shadow-large hover:-translate-y-1',
          interactive && [
            'cursor-pointer',
            'hover:shadow-large hover:-translate-y-1',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'active:translate-y-0'
          ],
          
          className
        )}
        {...(interactive && {
          tabIndex: 0,
          role: 'button'
        })}
        {...props}
      >
        {loading ? <CardSkeleton /> : children}
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
      action,
      icon,
      separator = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between',
          separator && 'border-b border-neutral-200 pb-4 mb-4',
          className
        )}
        {...props}
      >
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Icon */}
          {icon && (
            <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-neutral-500">
              {icon}
            </div>
          )}
          
          {/* Title and subtitle */}
          <div className="flex-1 min-w-0">
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
        
        {/* Action */}
        {action && (
          <div className="flex-shrink-0 ml-4">
            {action}
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
      padding = 'none',
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
      separator = false,
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
      between: 'justify-between'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          justifyClasses[justify],
          separator && 'border-t border-neutral-200 pt-4 mt-4',
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
  description,
  loading = false,
  className,
  ...props
}) => {
  const changeIcon = change && (
    change.type === 'increase' ? (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ) : change.type === 'decrease' ? (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ) : null
  );

  const changeColor = change && {
    increase: 'text-green-600 bg-green-50',
    decrease: 'text-red-600 bg-red-50',
    neutral: 'text-neutral-600 bg-neutral-50'
  }[change.type];

  return (
    <Card variant="default" padding="lg" className={className} loading={loading} {...props}>
      {!loading && (
        <>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">{title}</p>
              <p className="text-2xl font-bold text-neutral-900 mt-2">{value}</p>
              
              {change && (
                <div className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2',
                  changeColor
                )}>
                  {changeIcon}
                  <span className="ml-1">{change.value}</span>
                </div>
              )}
              
              {description && (
                <p className="text-sm text-neutral-500 mt-2">{description}</p>
              )}
            </div>
            
            {icon && (
              <div className="flex-shrink-0 w-8 h-8 text-neutral-400">
                {icon}
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

// ============================================================================
// CUSTOMER CARD COMPONENT
// ============================================================================

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onEdit,
  onDelete,
  onView,
  className,
  ...props
}) => {
  const priorityConfig = {
    high: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    medium: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    low: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
  };

  const priority = customer.priority && priorityConfig[customer.priority];

  return (
    <Card
      variant="default"
      padding="lg"
      hover
      className={cn('group', className)}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {customer.avatar ? (
              <img
                className="w-12 h-12 rounded-full object-cover"
                src={customer.avatar}
                alt={customer.name}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium text-lg">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Customer info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-neutral-900 truncate">
                {customer.name}
              </h3>
              {customer.priority && (
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium border',
                  priority?.color,
                  priority?.bg,
                  priority?.border
                )}>
                  {customer.priority}
                </span>
              )}
            </div>
            
            {customer.company && (
              <p className="text-sm text-neutral-600 mt-1">{customer.company}</p>
            )}
            
            <div className="flex flex-col space-y-1 mt-2">
              {customer.email && (
                <div className="flex items-center space-x-2 text-sm text-neutral-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate">{customer.email}</span>
                </div>
              )}
              
              {customer.phone && (
                <div className="flex items-center space-x-2 text-sm text-neutral-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>
            
            {customer.lastContact && (
              <p className="text-xs text-neutral-400 mt-2">
                Senaste kontakt: {customer.lastContact}
              </p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onView && (
            <button
              onClick={() => onView(customer.id)}
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors duration-150"
              title="Visa detaljer"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={() => onEdit(customer.id)}
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors duration-150"
              title="Redigera"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(customer.id)}
              className="p-2 rounded-full hover:bg-red-50 transition-colors duration-150 group/delete"
              title="Ta bort"
            >
              <svg className="w-4 h-4 text-neutral-500 group-hover/delete:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="mt-4 pt-4 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            customer.status === 'active' && 'bg-green-100 text-green-800',
            customer.status === 'inactive' && 'bg-gray-100 text-gray-800',
            customer.status === 'pending' && 'bg-yellow-100 text-yellow-800',
            customer.status === 'archived' && 'bg-red-100 text-red-800'
          )}>
            {customer.status}
          </span>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

interface MetricCardProps extends Omit<CardProps, 'children'> {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    label?: string;
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'blue',
  className,
  ...props
}) => {
  const colorConfig = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      icon: 'text-blue-500'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: 'text-green-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      icon: 'text-yellow-500'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      icon: 'text-red-500'
    },
    gray: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      icon: 'text-gray-500'
    }
  };

  const trendIcon = trend && {
    up: (
      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    neutral: (
      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    )
  }[trend.direction];

  const config = colorConfig[color];

  return (
    <Card variant="default" padding="lg" className={className} {...props}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-600">{title}</h3>
            {icon && (
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bg)}>
                <div className={cn('w-5 h-5', config.icon)}>
                  {icon}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-2">
            <p className={cn('text-3xl font-bold', config.text)}>{value}</p>
            {subtitle && (
              <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
            )}
          </div>
          
          {trend && (
            <div className="flex items-center mt-4">
              {trendIcon}
              <span className={cn(
                'text-sm font-medium ml-1',
                trend.direction === 'up' && 'text-green-600',
                trend.direction === 'down' && 'text-red-600',
                trend.direction === 'neutral' && 'text-gray-600'
              )}>
                {trend.value}
              </span>
              {trend.label && (
                <span className="text-sm text-neutral-500 ml-1">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// EMPTY STATE CARD
// ============================================================================

interface EmptyStateCardProps extends Omit<CardProps, 'children'> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title,
  description,
  icon,
  action,
  className,
  ...props
}) => {
  return (
    <Card variant="default" padding="xl" className={cn('text-center', className)} {...props}>
      {icon && (
        <div className="mx-auto w-12 h-12 text-neutral-400 mb-4">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      
      {description && (
        <p className="text-neutral-600 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        >
          {action.label}
        </button>
      )}
    </Card>
  );
};

// ============================================================================
// USAGE EXAMPLES (commented out for production)
// ============================================================================

/*
// Basic card
<Card variant="elevated" padding="lg">
  <CardHeader title="Kunder" subtitle="Hantera dina kunder" separator />
  <CardBody>
    Content here...
  </CardBody>
  <CardFooter separator justify="between">
    <Button variant="ghost">Avbryt</Button>
    <Button variant="primary">Spara</Button>
  </CardFooter>
</Card>

// Stats card
<StatsCard
  title="Totala kunder"
  value="1,234"
  change={{ value: "+12%", type: "increase" }}
  description="Sedan förra månaden"
  icon={<UsersIcon />}
/>

// Customer card
<CustomerCard
  customer={{
    id: "1",
    name: "Anna Andersson",
    email: "anna@exempel.se",
    company: "Exempel AB",
    status: "active",
    priority: "high"
  }}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onView={handleView}
/>

// Empty state
<EmptyStateCard
  title="Inga kunder ännu"
  description="Lägg till din första kund för att komma igång"
  icon={<UsersIcon />}
  action={{
    label: "Lägg till kund",
    onClick: () => setShowAddModal(true)
  }}
/>
*/

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default Card;