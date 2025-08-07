// ============================================================================
// DROPDOWN COMPONENTS - Dropdown Menus & Context Menus
// ============================================================================

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DropdownItemProps {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    divider?: boolean;
    danger?: boolean;
  }
  
  export interface DropdownMenuProps {
    items: DropdownItemProps[];
    className?: string;
  }
  
  export interface DropdownProps {
    trigger: React.ReactNode;
    menu: DropdownMenuProps;
    placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
    className?: string;
  }
  
  export const DropdownItem: React.FC<DropdownItemProps> = ({
    label,
    icon,
    onClick,
    disabled = false,
    divider = false,
    danger = false
  }) => {
    if (divider) {
      return <div className="my-1 border-t border-neutral-200" />;
    }
  
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'w-full flex items-center px-4 py-2 text-sm text-left hover:bg-neutral-50 transition-colors',
          disabled && 'opacity-50 cursor-not-allowed',
          danger ? 'text-red-600 hover:bg-red-50' : 'text-neutral-700',
        )}
      >
        {icon && (
          <span className="w-4 h-4 mr-3 flex-shrink-0">
            {icon}
          </span>
        )}
        {label}
      </button>
    );
  };
  
  export const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, className }) => (
    <div className={cn('py-1 bg-white border border-neutral-200 rounded-lg shadow-lg', className)}>
      {items.map((item, index) => (
        <DropdownItem key={index} {...item} />
      ))}
    </div>
  );
  
  export const Dropdown: React.FC<DropdownProps> = ({
    trigger,
    menu,
    placement = 'bottom-start',
    className
  }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    const placementClasses = {
      'bottom-start': 'top-full left-0 mt-1',
      'bottom-end': 'top-full right-0 mt-1',
      'top-start': 'bottom-full left-0 mb-1',
      'top-end': 'bottom-full right-0 mb-1'
    };
  
    return (
      <div className={cn('relative', className)}>
        <div onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </div>
        
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className={cn('absolute z-20 min-w-48', placementClasses[placement])}>
              <DropdownMenu {...menu} />
            </div>
          </>
        )}
      </div>
    );
  };