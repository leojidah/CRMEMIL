// ============================================================================
// LAYOUT COMPONENTS - Container, Grid, Stack & Layout Utilities
// ============================================================================

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
}

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  colEnd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

// ============================================================================
// COMPONENT STYLES
// ============================================================================

const containerSizes = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  full: 'max-w-full'
};

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12'
};

const gridGaps = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
};

const colSpans = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12'
};

const colStarts = {
  1: 'col-start-1',
  2: 'col-start-2',
  3: 'col-start-3',
  4: 'col-start-4',
  5: 'col-start-5',
  6: 'col-start-6',
  7: 'col-start-7',
  8: 'col-start-8',
  9: 'col-start-9',
  10: 'col-start-10',
  11: 'col-start-11',
  12: 'col-start-12'
};

const colEnds = {
  1: 'col-end-1',
  2: 'col-end-2',
  3: 'col-end-3',
  4: 'col-end-4',
  5: 'col-end-5',
  6: 'col-end-6',
  7: 'col-end-7',
  8: 'col-end-8',
  9: 'col-end-9',
  10: 'col-end-10',
  11: 'col-end-11',
  12: 'col-end-12'
};

const stackSpacing = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
};

const stackAlign = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
};

const stackJustify = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly'
};

const dividerSpacing = {
  none: '',
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-6',
  xl: 'my-8'
};

// ============================================================================
// CONTAINER COMPONENT
// ============================================================================

export const Container: React.FC<ContainerProps> = ({
  size = 'lg',
  centered = true,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'w-full px-4 sm:px-6 lg:px-8',
        containerSizes[size],
        centered && 'mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================================
// GRID COMPONENTS
// ============================================================================

export const Grid: React.FC<GridProps> = ({
  cols = 1,
  gap = 'md',
  responsive = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'grid',
        !responsive && gridCols[cols],
        gridGaps[gap],
        responsive && cols === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        responsive && cols === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        responsive && cols === 6 && 'grid-cols-2 lg:grid-cols-6',
        responsive && ![3, 4, 6].includes(cols) && gridCols[cols],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const GridItem: React.FC<GridItemProps> = ({
  colSpan,
  colStart,
  colEnd,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        colSpan && colSpans[colSpan],
        colStart && colStarts[colStart],
        colEnd && colEnds[colEnd],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================================
// STACK COMPONENT
// ============================================================================

export const Stack: React.FC<StackProps> = ({
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex',
        direction === 'horizontal' ? 'flex-row' : 'flex-col',
        stackSpacing[spacing],
        stackAlign[align],
        stackJustify[justify],
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================================
// DIVIDER COMPONENT
// ============================================================================

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  spacing = 'md',
  className,
  ...props
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          'w-px bg-neutral-200 h-full',
          variant === 'dashed' && 'border-l border-dashed border-neutral-200 bg-transparent',
          variant === 'dotted' && 'border-l border-dotted border-neutral-200 bg-transparent',
          className
        )}
        {...props}
      />
    );
  }

  return (
    <hr
      className={cn(
        'border-0 h-px bg-neutral-200 w-full',
        variant === 'dashed' && 'border-t border-dashed border-neutral-200 bg-transparent h-0',
        variant === 'dotted' && 'border-t border-dotted border-neutral-200 bg-transparent h-0',
        dividerSpacing[spacing],
        className
      )}
      {...props}
    />
  );
};