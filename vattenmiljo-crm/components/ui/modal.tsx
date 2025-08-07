// ============================================================================
// MODAL COMPONENT - Dialogs & Overlays
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscapeKey?: boolean;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

export interface ModalHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface ModalBodyProps {
  className?: string;
  children: React.ReactNode;
}

export interface ModalFooterProps {
  className?: string;
  justify?: 'start' | 'center' | 'end' | 'between';
  children: React.ReactNode;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export interface DrawerProps extends Omit<ModalProps, 'size'> {
  position?: 'left' | 'right' | 'top' | 'bottom';
  width?: string;
  height?: string;
}

// ============================================================================
// COMPONENT STYLES
// ============================================================================

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl mx-4'
};

const modalVariants = {
  default: {
    header: 'bg-white border-b border-neutral-200',
    body: 'bg-white',
    icon: 'text-primary-500'
  },
  success: {
    header: 'bg-green-50 border-b border-green-200',
    body: 'bg-white',
    icon: 'text-green-500'
  },
  warning: {
    header: 'bg-yellow-50 border-b border-yellow-200',
    body: 'bg-white',
    icon: 'text-yellow-500'
  },
  error: {
    header: 'bg-red-50 border-b border-red-200',
    body: 'bg-white',
    icon: 'text-red-500'
  }
};

// ============================================================================
// PORTAL COMPONENT
// ============================================================================

const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return typeof window !== 'undefined' 
    ? ReactDOM.createPortal(children, document.body)
    : null;
};

// Note: In a real implementation, you'd import ReactDOM from 'react-dom'
// For this example, we'll assume it's available or use a fallback
const ReactDOM = (globalThis as typeof globalThis & { ReactDOM?: typeof import('react-dom') }).ReactDOM || {
  createPortal: (children: React.ReactNode) => children
};

// ============================================================================
// FOCUS TRAP HOOK
// ============================================================================

const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusableElement = focusableElements[0] as HTMLElement;
    const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstFocusableElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive, containerRef]);
};

// ============================================================================
// MODAL COMPONENT
// ============================================================================

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscapeKey = true,
  children,
  className,
  overlayClassName
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Focus trap
  useFocusTrap(isOpen, modalRef);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscapeKey) return;

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, closeOnEscapeKey, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const variantConfig = modalVariants[variant];

  return (
    <Portal>
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          'bg-black/50 backdrop-blur-sm',
          'animate-fade-in',
          overlayClassName
        )}
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          className={cn(
            'relative w-full bg-white rounded-large shadow-large',
            'animate-scale-in',
            'max-h-[90vh] overflow-hidden',
            modalSizes[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          {(title || subtitle || showCloseButton) && (
            <ModalHeader
              title={title}
              subtitle={subtitle}
              onClose={onClose}
              showCloseButton={showCloseButton}
              className={variantConfig.header}
            />
          )}

          {/* Modal Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
};

// ============================================================================
// MODAL HEADER COMPONENT
// ============================================================================

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  showCloseButton = true,
  className,
  children
}) => {
  return (
    <div className={cn('px-6 py-4 flex items-start justify-between', className)}>
      <div className="flex items-start space-x-3 flex-1 min-w-0">
        {icon && (
          <div className="flex-shrink-0 w-6 h-6 mt-0.5">
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <h2 className="text-xl font-semibold text-neutral-900 truncate">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-neutral-600 mt-1">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>

      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className={cn(
            'flex-shrink-0 ml-4 p-1 rounded-full',
            'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500'
          )}
          aria-label="Stäng"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ============================================================================
// MODAL BODY COMPONENT
// ============================================================================

export const ModalBody: React.FC<ModalBodyProps> = ({
  className,
  children
}) => {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
};

// ============================================================================
// MODAL FOOTER COMPONENT
// ============================================================================

export const ModalFooter: React.FC<ModalFooterProps> = ({
  className,
  justify = 'end',
  children
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={cn(
      'px-6 py-4 bg-neutral-50 border-t border-neutral-200',
      'flex items-center space-x-3',
      justifyClasses[justify],
      className
    )}>
      {children}
    </div>
  );
};

// ============================================================================
// CONFIRMATION MODAL
// ============================================================================

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Bekräfta',
  cancelText = 'Avbryt',
  variant = 'default',
  loading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const variantConfig = {
    default: {
      variant: 'default' as const,
      confirmButtonClass: 'bg-primary-500 text-white hover:bg-primary-600',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    danger: {
      variant: 'error' as const,
      confirmButtonClass: 'bg-red-500 text-white hover:bg-red-600',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    }
  };

  const config = variantConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      variant={config.variant}
      title={title}
    >
      <ModalBody>
        <div className="flex items-start space-x-4">
          <div className={cn('flex-shrink-0', modalVariants[config.variant].icon)}>
            {config.icon}
          </div>
          <div className="flex-1">
            <p className="text-neutral-700">{message}</p>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <button
          onClick={onClose}
          className={cn(
            'px-4 py-2 border border-neutral-300 rounded-md text-neutral-700',
            'bg-white hover:bg-neutral-50',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'transition-colors duration-150'
          )}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={cn(
            'px-4 py-2 rounded-md font-medium',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'transition-colors duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            config.confirmButtonClass,
            variant === 'danger' ? 'focus:ring-red-500' : 'focus:ring-primary-500'
          )}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Bearbetar...</span>
            </div>
          ) : confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
};

// ============================================================================
// DRAWER COMPONENT
// ============================================================================

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  position = 'right',
  width = '400px',
  height = '100%',
  title,
  subtitle,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscapeKey = true,
  children,
  className,
  overlayClassName
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // Focus trap and escape key handling (same as modal)
  useFocusTrap(isOpen, drawerRef);

  useEffect(() => {
    if (!isOpen || !closeOnEscapeKey) return;

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, closeOnEscapeKey, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const positionClasses = {
    right: 'right-0 top-0 h-full animate-slide-in-right',
    left: 'left-0 top-0 h-full animate-slide-in-left',
    top: 'top-0 left-0 w-full animate-slide-in-down',
    bottom: 'bottom-0 left-0 w-full animate-slide-in-up'
  };

  const dimensionStyle = {
    width: ['left', 'right'].includes(position) ? width : '100%',
    height: ['top', 'bottom'].includes(position) ? height : '100%'
  };

  return (
    <Portal>
      <div
        className={cn(
          'fixed inset-0 z-50',
          'bg-black/50 backdrop-blur-sm',
          'animate-fade-in',
          overlayClassName
        )}
        onClick={handleOverlayClick}
      >
        <div
          ref={drawerRef}
          className={cn(
            'absolute bg-white shadow-large',
            'overflow-hidden flex flex-col',
            positionClasses[position],
            className
          )}
          style={dimensionStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          {(title || subtitle || showCloseButton) && (
            <div className="px-6 py-4 border-b border-neutral-200 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {title && (
                    <h2 className="text-xl font-semibold text-neutral-900 truncate">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-sm text-neutral-600 mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={cn(
                      'ml-4 p-1 rounded-full',
                      'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
                      'transition-colors duration-150',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500'
                    )}
                    aria-label="Stäng"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
};

// ============================================================================
// USAGE EXAMPLES (commented out for production)
// ============================================================================

/*
// Basic modal
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Lägg till ny kund"
  subtitle="Fyll i kunduppgifterna nedan"
>
  <ModalBody>
    <form>
      // Form content here
    </form>
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={() => setShowModal(false)}>
      Avbryt
    </Button>
    <Button variant="primary" onClick={handleSave}>
      Spara kund
    </Button>
  </ModalFooter>
</Modal>

// Confirmation modal
<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Ta bort kund"
  message="Är du säker på att du vill ta bort denna kund? Detta kan inte ångras."
  confirmText="Ta bort"
  cancelText="Avbryt"
  variant="danger"
  loading={deleting}
/>

// Drawer
<Drawer
  isOpen={showDrawer}
  onClose={() => setShowDrawer(false)}
  title="Kundinformation"
  position="right"
  width="500px"
>
  <ModalBody>
    // Customer details here
  </ModalBody>
</Drawer>
*/

// ============================================================================
// EXPORTS
// DEFAULT EXPORT
// ============================================================================

export default Modal;