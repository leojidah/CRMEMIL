// ============================================================================
// TABLE COMPONENT - Data Tables & Lists
// ============================================================================

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Column<T = Record<string, unknown>> {
  key: string;
  title: string;
  dataIndex?: string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  empty?: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  rowKey?: string | ((record: T) => string);
  rowSelection?: {
    selectedRowKeys?: string[];
    onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => string;
  };
  sortable?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc' | null) => void;
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
  } | null;
  hoverable?: boolean;
  striped?: boolean;
  compact?: boolean;
  className?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  onRowClick?: (record: T, index: number) => void;
  expandable?: {
    expandedRowKeys?: string[];
    onExpand?: (expanded: boolean, record: T) => void;
    expandedRowRender?: (record: T) => React.ReactNode;
  };
}

export interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  className?: string;
}

// ============================================================================
// TABLE SKELETON COMPONENT
// ============================================================================

const TableSkeleton: React.FC<{ columns: number; rows?: number }> = ({ 
  columns, 
  rows = 5 
}) => {
  return (
    <div className="w-full">
      <div className="overflow-hidden border border-neutral-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <div className="h-4 bg-neutral-100 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

const EmptyState: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ title, description, icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="w-12 h-12 text-neutral-400 mb-4">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-neutral-900 mb-1">
        {title}
      </h3>
      
      {description && (
        <p className="text-neutral-500 mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

export const Pagination: React.FC<PaginationProps> = ({
  current,
  pageSize,
  total,
  onChange,
  showSizeChanger = false,
  showTotal,
  className
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startRecord = (current - 1) * pageSize + 1;
  const endRecord = Math.min(current * pageSize, total);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== current) {
      onChange(page, pageSize);
    }
  };

  const handleSizeChange = (newSize: number) => {
    const newPage = Math.ceil((startRecord - 1) / newSize) + 1;
    onChange(newPage, newSize);
  };

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    pages.push(1);
    
    if (current <= 4) {
      pages.push(2, 3, 4, 5);
      pages.push('...');
      pages.push(totalPages);
    } else if (current >= totalPages - 3) {
      pages.push('...');
      pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push('...');
      pages.push(current - 1, current, current + 1);
      pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center space-x-4">
        {showTotal && (
          <span className="text-sm text-neutral-600">
            {showTotal(total, [startRecord, endRecord])}
          </span>
        )}
        
        {showSizeChanger && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-600">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="px-3 py-1 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handlePageChange(current - 1)}
          disabled={current === 1}
          className="p-2 text-neutral-500 hover:text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-neutral-500">...</span>
            ) : (
              <button
                onClick={() => handlePageChange(page as number)}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  page === current
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                )}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
        
        <button
          onClick={() => handlePageChange(current + 1)}
          disabled={current === totalPages}
          className="p-2 text-neutral-500 hover:text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// TABLE COMPONENT
// ============================================================================

export function Table<T = Record<string, unknown>>({
  columns,
  data,
  loading = false,
  empty,
  rowKey = 'id',
  rowSelection,
  pagination,
  sortable = false,
  onSort,
  sortConfig,
  hoverable = true,
  striped = false,
  compact = false,
  className,
  rowClassName,
  onRowClick,
  expandable
}: TableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    new Set(expandable?.expandedRowKeys || [])
  );

  // Memoize row key function
  const getRowKey = useMemo(() => {
    if (typeof rowKey === 'function') {
      return rowKey;
    }
    return (record: T) => {
      const key = (record as Record<string, unknown>)[rowKey];
      return key != null ? String(key) : '';
    };
  }, [rowKey]);

  // Memoize processed data
  const processedData = useMemo(() => {
    return data.map((record, index) => ({
      record,
      key: getRowKey(record),
      index
    }));
  }, [data, getRowKey]);

  const handleSort = (columnKey: string) => {
    if (!sortable || !onSort) return;
    
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig?.key === columnKey) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 
                 sortConfig.direction === 'desc' ? null : 'asc';
    }
    
    onSort(columnKey, direction);
  };

  const handleExpand = (rowKey: string, record: T) => {
    const newExpandedRows = new Set(expandedRows);
    const isExpanded = expandedRows.has(rowKey);
    
    if (isExpanded) {
      newExpandedRows.delete(rowKey);
    } else {
      newExpandedRows.add(rowKey);
    }
    
    setExpandedRows(newExpandedRows);
    expandable?.onExpand?.(!isExpanded, record);
  };

  const handleRowSelection = (rowKey: string, selected: boolean) => {
    if (!rowSelection?.onChange) return;
    
    const currentKeys = rowSelection.selectedRowKeys || [];
    const newKeys = selected
      ? [...currentKeys, rowKey]
      : currentKeys.filter(key => key !== rowKey);
    
    const selectedRecords = processedData
      .filter(item => newKeys.includes(item.key))
      .map(item => item.record);
    
    rowSelection.onChange(newKeys, selectedRecords);
  };

  const handleSelectAll = (selected: boolean) => {
    if (!rowSelection?.onChange) return;
    
    const selectableRows = processedData.filter(item => {
      const checkboxProps = rowSelection.getCheckboxProps?.(item.record) || {};
      return !checkboxProps.disabled;
    });
    
    const newKeys = selected ? selectableRows.map(item => item.key) : [];
    const selectedRecords = selected ? selectableRows.map(item => item.record) : [];
    
    rowSelection.onChange(newKeys, selectedRecords);
  };

  const isAllSelected = () => {
    if (!rowSelection?.selectedRowKeys?.length) return false;
    
    const selectableRows = processedData.filter(item => {
      const checkboxProps = rowSelection.getCheckboxProps?.(item.record) || {};
      return !checkboxProps.disabled;
    });
    
    return selectableRows.length > 0 && 
           selectableRows.every(item => rowSelection.selectedRowKeys?.includes(item.key));
  };

  const isIndeterminate = () => {
    const selectedCount = rowSelection?.selectedRowKeys?.length || 0;
    const selectableCount = processedData.filter(item => {
    const checkboxProps = rowSelection?.getCheckboxProps?.(item.record) || {};
      return !checkboxProps.disabled;
    }).length;
    
    return selectedCount > 0 && selectedCount < selectableCount;
  };

  if (loading) {
    return <TableSkeleton columns={columns.length} />;
  }

  if (!data.length && empty) {
    return <EmptyState {...empty} />;
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-hidden border border-neutral-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                {rowSelection && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isAllSelected()}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate();
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
                    />
                  </th>
                )}
                
                {expandable && (
                  <th className="w-12 px-4 py-3"></th>
                )}
                
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && sortable && 'cursor-pointer hover:bg-neutral-100',
                      column.headerClassName
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.title}</span>
                      
                      {column.sortable && sortable && (
                        <div className="flex flex-col">
                          <svg
                            className={cn(
                              'w-3 h-3',
                              sortConfig?.key === column.key && sortConfig.direction === 'asc'
                                ? 'text-primary-500'
                                : 'text-neutral-300'
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414 6.707 9.707a1 1 0 01-1.414 0z" />
                          </svg>
                          <svg
                            className={cn(
                              'w-3 h-3 -mt-1',
                              sortConfig?.key === column.key && sortConfig.direction === 'desc'
                                ? 'text-primary-500'
                                : 'text-neutral-300'
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className={cn(
              'bg-white divide-y divide-neutral-200',
              striped && 'divide-y-0'
            )}>
              {processedData.map((item, rowIndex) => {
                const isSelected = rowSelection?.selectedRowKeys?.includes(item.key) || false;
                const isExpanded = expandedRows.has(item.key);
                const checkboxProps = rowSelection?.getCheckboxProps?.(item.record) || {};
                
                const baseRowClasses = cn(
                  'transition-colors',
                  hoverable && 'hover:bg-neutral-50',
                  striped && rowIndex % 2 === 1 && 'bg-neutral-50',
                  isSelected && 'bg-primary-50',
                  onRowClick && 'cursor-pointer',
                  compact ? 'py-2' : 'py-4'
                );
                
                const computedRowClassName = typeof rowClassName === 'function'
                  ? rowClassName(item.record, rowIndex)
                  : rowClassName || '';
                
                return (
                  <React.Fragment key={item.key}>
                    <tr
                      className={cn(baseRowClasses, computedRowClassName)}
                      onClick={() => onRowClick?.(item.record, rowIndex)}
                    >
                      {rowSelection && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={checkboxProps.disabled}
                            onChange={(e) => handleRowSelection(item.key, e.target.checked)}
                            className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500 disabled:opacity-50"
                          />
                        </td>
                      )}
                      
                      {expandable && (
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExpand(item.key, item.record);
                            }}
                            className="p-1 text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                          >
                            <svg
                              className={cn(
                                'w-4 h-4 transition-transform',
                                isExpanded && 'rotate-90'
                              )}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                      )}
                      
                      {columns.map((column) => {
                        const value = column.dataIndex 
                          ? (item.record as Record<string, unknown>)[column.dataIndex]
                          : item.record;
                        
                        const cellContent = column.render
                          ? column.render(value, item.record, rowIndex)
                          : String(value || '');

                        return (
                          <td
                            key={column.key}
                            className={cn(
                              'px-4 py-3 text-sm text-neutral-900',
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right',
                              column.className
                            )}
                          >
                            {cellContent}
                          </td>
                        );
                      })}
                    </tr>
                    
                    {expandable && isExpanded && expandable.expandedRowRender && (
                      <tr>
                        <td
                          colSpan={
                            columns.length + 
                            (rowSelection ? 1 : 0) + 
                            (expandable ? 1 : 0)
                          }
                          className="px-4 py-4 bg-neutral-50"
                        >
                          {expandable.expandedRowRender(item.record)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {pagination && (
        <div className="mt-4">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}