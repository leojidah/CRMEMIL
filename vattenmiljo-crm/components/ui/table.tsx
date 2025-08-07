// ============================================================================
// TABLE COMPONENT - Data Tables & Lists
// ============================================================================

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Column<T = unknown> {
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

export interface TableProps<T = unknown> {
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
  bordered?: boolean;
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
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  className?: string;
}

// ============================================================================
// TABLE SKELETON COMPONENT
// ============================================================================

const TableSkeleton: React.FC<{ columns: number; rows?: number }> = ({ 
  columns, 
  rows = 5 
}) => (
  <div className="animate-pulse">
    {/* Header skeleton */}
    <div className="flex border-b border-neutral-200 bg-neutral-50 p-4">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-1 px-2">
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
        </div>
      ))}
    </div>
    
    {/* Rows skeleton */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex border-b border-neutral-100 p-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="flex-1 px-2">
            <div className={cn(
              'h-4 bg-neutral-200 rounded',
              colIndex === 0 ? 'w-full' : colIndex === columns - 1 ? 'w-1/2' : 'w-3/4'
            )} />
          </div>
        ))}
      </div>
    ))}
  </div>
);

// ============================================================================
// TABLE EMPTY STATE
// ============================================================================

const TableEmpty: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ title, description, icon, action }) => (
  <div className="text-center py-12">
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
  </div>
);

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

export const Pagination: React.FC<PaginationProps> = ({
  current,
  pageSize,
  total,
  onChange,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal,
  className
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (current - 1) * pageSize + 1;
  const endIndex = Math.min(current * pageSize, total);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onChange(page, pageSize);
    }
  };

  const handleSizeChange = (newSize: number) => {
    onChange(1, newSize);
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(totalPages - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = totalPages > 1 ? getVisiblePages() : [];

  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-3 bg-white border-t border-neutral-200',
      className
    )}>
      <div className="flex items-center space-x-4">
        {showTotal && (
          <div className="text-sm text-neutral-700">
            {showTotal(total, [startIndex, endIndex])}
          </div>
        )}
        
        {showSizeChanger && (
          <div className="flex items-center space-x-2">
            <label className="text-sm text-neutral-700">Visa:</label>
            <select
              value={pageSize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="px-3 py-1 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-1">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(current - 1)}
          disabled={current <= 1}
          className={cn(
            'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            current <= 1
              ? 'text-neutral-400 cursor-not-allowed'
              : 'text-neutral-700 hover:bg-neutral-100'
          )}
        >
          Föregående
        </button>

        {/* Page numbers */}
        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-neutral-400">...</span>
            ) : (
              <button
                onClick={() => handlePageChange(page as number)}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
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

        {/* Next button */}
        <button
          onClick={() => handlePageChange(current + 1)}
          disabled={current >= totalPages}
          className={cn(
            'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            current >= totalPages
              ? 'text-neutral-400 cursor-not-allowed'
              : 'text-neutral-700 hover:bg-neutral-100'
          )}
        >
          Nästa
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN TABLE COMPONENT
// ============================================================================

export const Table = <T extends Record<string, unknown>>({
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
  bordered = false,
  compact = false,
  className,
  rowClassName,
  onRowClick,
  expandable
}: TableProps<T>) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>(
    expandable?.expandedRowKeys || []
  );

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index.toString();
  };

  const handleSort = (columnKey: string, currentDirection: 'asc' | 'desc' | null) => {
    if (!onSort) return;

    let newDirection: 'asc' | 'desc' | null = null;
    
    if (currentDirection === null) {
      newDirection = 'asc';
    } else if (currentDirection === 'asc') {
      newDirection = 'desc';
    } else {
      newDirection = null;
    }
    
    onSort(columnKey, newDirection);
  };

  const handleRowSelect = (key: string, checked: boolean, record: T) => {
    if (!rowSelection?.onChange) return;

    const newSelectedKeys = checked
      ? [...(rowSelection.selectedRowKeys || []), key]
      : (rowSelection.selectedRowKeys || []).filter(k => k !== key);

    const selectedRows = data.filter(item => 
      newSelectedKeys.includes(getRowKey(item, data.indexOf(item)))
    );

    rowSelection.onChange(newSelectedKeys, selectedRows);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!rowSelection?.onChange) return;

    const allKeys = data.map((record, index) => getRowKey(record, index));
    const enabledKeys = allKeys.filter(key => {
      const record = data.find((item, idx) => getRowKey(item, idx) === key);
      const checkboxProps = rowSelection.getCheckboxProps?.(record!);
      return !checkboxProps?.disabled;
    });

    rowSelection.onChange(checked ? enabledKeys : [], checked ? data : []);
  };

  const handleExpand = (key: string, record: T) => {
    const newExpandedKeys = expandedKeys.includes(key)
      ? expandedKeys.filter(k => k !== key)
      : [...expandedKeys, key];

    setExpandedKeys(newExpandedKeys);
    expandable?.onExpand?.(newExpandedKeys.includes(key), record);
  };

  const allSelectedKeys = rowSelection?.selectedRowKeys || [];
  const enabledDataKeys = useMemo(() => {
    return data.map((record, index) => {
      const key = getRowKey(record, index);
      const checkboxProps = rowSelection?.getCheckboxProps?.(record);
      return checkboxProps?.disabled ? null : key;
    }).filter(Boolean) as string[];
  }, [data, rowSelection, rowKey]);

  const isAllSelected = enabledDataKeys.length > 0 && 
    enabledDataKeys.every(key => allSelectedKeys.includes(key));
  const isIndeterminate = allSelectedKeys.some(key => enabledDataKeys.includes(key)) && 
    !isAllSelected;

  if (loading) {
    return (
      <div className={cn('bg-white border border-neutral-200 rounded-large overflow-hidden', className)}>
        <TableSkeleton columns={columns.length} />
      </div>
    );
  }

  if (data.length === 0 && empty) {
    return (
      <div className={cn('bg-white border border-neutral-200 rounded-large overflow-hidden', className)}>
        <TableEmpty {...empty} />
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white border border-neutral-200 rounded-large overflow-hidden',
      className
    )}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={cn(
            'bg-neutral-50 border-b border-neutral-200',
            compact ? 'h-10' : 'h-12'
          )}>
            <tr>
              {/* Row selection header */}
              {rowSelection && (
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}

              {/* Expand header */}
              {expandable && (
                <th className="w-12 px-4 py-3 text-left"></th>
              )}

              {/* Column headers */}
              {columns.map((column) => {
                const currentSort = sortConfig?.key === column.key ? sortConfig.direction : null;
                const isSortable = sortable && column.sortable !== false;

                return (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-left text-sm font-medium text-neutral-700',
                      'whitespace-nowrap',
                      column.headerClassName,
                      isSortable && 'cursor-pointer hover:bg-neutral-100 transition-colors',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                    style={{ width: column.width }}
                    onClick={() => isSortable && handleSort(column.key, currentSort)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.title}</span>
                      {isSortable && (
                        <div className="flex flex-col">
                          <svg 
                            className={cn(
                              'w-3 h-3 -mb-1',
                              currentSort === 'asc' ? 'text-primary-600' : 'text-neutral-400'
                            )} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                          <svg 
                            className={cn(
                              'w-3 h-3',
                              currentSort === 'desc' ? 'text-primary-600' : 'text-neutral-400'
                            )} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-neutral-100">
            {data.map((record, index) => {
              const key = getRowKey(record, index);
              const isSelected = allSelectedKeys.includes(key);
              const isExpanded = expandedKeys.includes(key);
              const checkboxProps = rowSelection?.getCheckboxProps?.(record);
              const computedRowClassName = typeof rowClassName === 'function' 
                ? rowClassName(record, index) 
                : rowClassName;

              return (
                <React.Fragment key={key}>
                  <tr
                    className={cn(
                      'transition-colors duration-150',
                      hoverable && 'hover:bg-neutral-50',
                      striped && index % 2 === 1 && 'bg-neutral-25',
                      isSelected && 'bg-primary-50',
                      onRowClick && 'cursor-pointer',
                      computedRowClassName
                    )}
                    onClick={() => onRowClick?.(record, index)}
                  >
                    {/* Row selection cell */}
                    {rowSelection && (
                      <td className="w-12 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={checkboxProps?.disabled}
                          onChange={(e) => handleRowSelect(key, e.target.checked, record)}
                          className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                    )}

                    {/* Expand cell */}
                    {expandable && (
                      <td className="w-12 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleExpand(key, record)}
                          className="p-1 rounded-full hover:bg-neutral-200 transition-colors"
                        >
                          <svg 
                            className={cn(
                              'w-4 h-4 transition-transform',
                              isExpanded && 'rotate-90'
                            )} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    )}

                    {/* Data cells */}
                    {columns.map((column) => {
                      const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
                      const content = column.render ? column.render(value, record, index) : value;

                      return (
                        <td
                          key={column.key}
                          className={cn(
                            'px-4 py-3 text-sm text-neutral-900',
                            column.className,
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            compact ? 'py-2' : 'py-3'
                          )}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Expanded row */}
                  {expandable && isExpanded && (
                    <tr>
                      <td 
                        colSpan={
                          columns.length + 
                          (rowSelection ? 1 : 0) + 
                          (expandable ? 1 : 0)
                        }
                        className="px-4 py-4 bg-neutral-25"
                      >
                        {expandable.expandedRowRender?.(record)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination {...pagination} />
      )}
    </div>
  );
};

// ============================================================================
// USAGE EXAMPLES (commented out for production)
// ============================================================================

/*
// Basic table
const columns = [
  {
    key: 'name',
    title: 'Namn',
    dataIndex: 'name',
    sortable: true
  },
  {
    key: 'email',
    title: 'E-post',
    dataIndex: 'email'
  },
  {
    key: 'status',
    title: 'Status',
    render: (value, record) => (
      <StatusBadge status={value} />
    )
  },
  {
    key: 'actions',
    title: 'Åtgärder',
    align: 'right',
    render: (_, record) => (
      <div className="flex space-x-2">
        <Button size="sm" variant="ghost">Redigera</Button>
        <Button size="sm" variant="ghost">Ta bort</Button>
      </div>
    )
  }
];

<Table
  columns={columns}
  data={customers}
  loading={loading}
  rowSelection={{
    selectedRowKeys: selectedKeys,
    onChange: setSelectedKeys
  }}
  pagination={{
    current: currentPage,
    pageSize: 20,
    total: totalCustomers,
    onChange: handlePageChange
  }}
  sortable
  onSort={handleSort}
  empty={{
    title: 'Inga kunder hittades',
    description: 'Lägg till din första kund för att komma igång',
    icon: <UsersIcon />,
    action: {
      label: 'Lägg till kund',
      onClick: () => setShowAddModal(true)
    }
  }}
/>
*/

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default Table;