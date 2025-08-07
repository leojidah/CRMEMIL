// ============================================================================
// UTILITY FUNCTIONS & HELPERS - Vattenmiljö CRM
// ============================================================================

import type { 
    Customer, 
    CustomerStatus, 
    UserRole, 
    User,
    Permission,
    CustomerActivity,
    FilterState,
    SortState,
    NotificationType
  } from './types';
  import { CUSTOMER_STATUS_CONFIG, USER_ROLE_CONFIG, ROLE_PERMISSIONS } from './constants';
  
  // ============================================================================
  // CLASS NAME UTILITIES
  // ============================================================================
  
  /**
   * Combines CSS class names, filtering out falsy values
   */
  export function cn(...classes: (string | undefined | null | boolean)[]): string {
    return classes.filter(Boolean).join(' ');
  }
  
  /**
   * Creates conditional class names
   */
  export function clsx(...classes: (string | Record<string, boolean> | undefined | null | boolean)[]): string {
    return classes
      .map((cls) => {
        if (typeof cls === 'string') return cls;
        if (typeof cls === 'object' && cls !== null) {
          return Object.entries(cls)
            .filter(([, value]) => Boolean(value))
            .map(([key]) => key)
            .join(' ');
        }
        return '';
      })
      .filter(Boolean)
      .join(' ');
  }
  
  // ============================================================================
  // DATE UTILITIES
  // ============================================================================
  
  /**
   * Formats a date string to Swedish locale
   */
  export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = {}): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    try {
      return new Date(dateString).toLocaleDateString('sv-SE', defaultOptions);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }
  
  /**
   * Formats a date string to relative time (e.g., "2 dagar sedan")
   */
  export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const intervals = [
      { label: 'år', seconds: 31536000 },
      { label: 'månad', seconds: 2592000 },
      { label: 'dag', seconds: 86400 },
      { label: 'timme', seconds: 3600 },
      { label: 'minut', seconds: 60 }
    ];
    
    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count > 0) {
        return `${count} ${interval.label}${count > 1 ? (interval.label === 'månad' ? 'er' : interval.label === 'timme' ? 'ar' : 'ar') : ''} sedan`;
      }
    }
    
    return 'Just nu';
  }
  
  /**
   * Formats date for form inputs (YYYY-MM-DD)
   */
  export function formatDateForInput(dateString: string): string {
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  }
  
  // ============================================================================
  // STRING UTILITIES
  // ============================================================================
  
  /**
   * Capitalizes first letter of each word
   */
  export function capitalize(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
  }
  
  /**
   * Truncates text with ellipsis
   */
  export function truncate(text: string, length: number): string {
    return text.length <= length ? text : `${text.substring(0, length)}...`;
  }
  
  /**
   * Generates a random ID
   */
  export function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  /**
   * Formats phone number
   */
  export function formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format Swedish phone numbers
    if (cleaned.startsWith('46')) {
      // International format
      return `+${cleaned}`;
    } else if (cleaned.startsWith('07') || cleaned.startsWith('08')) {
      // Mobile or Stockholm landline
      return cleaned.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1-$2 $3 $4');
    }
    
    return phone;
  }
  
  // ============================================================================
  // CUSTOMER UTILITIES
  // ============================================================================
  
  /**
   * Gets customer status configuration
   */
  export function getCustomerStatusConfig(status: CustomerStatus) {
    return CUSTOMER_STATUS_CONFIG[status];
  }
  
  /**
   * Filters customers based on filter state
   */
  export function filterCustomers(customers: Customer[], filters: FilterState): Customer[] {
    return customers.filter(customer => {
      // Search filter
      if (filters.search && filters.search.trim()) {
        const searchLower = filters.search.toLowerCase();
        const searchableFields = [
          customer.name,
          customer.address || '',
          customer.phone,
          customer.email || ''
        ];
        
        const matchesSearch = searchableFields.some(field => 
          field.toLowerCase().includes(searchLower)
        );
        
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(customer.status)) return false;
      }
      
      // Assigned to filter
      if (filters.assignedTo && filters.assignedTo.length > 0) {
        if (!customer.assignedTo || !filters.assignedTo.includes(customer.assignedTo)) {
          return false;
        }
      }
      
      // Priority filter
      if (filters.priority && filters.priority.length > 0) {
        if (!filters.priority.includes(customer.priority)) return false;
      }
      
      // Date range filter
      if (filters.dateRange) {
        const customerDate = new Date(customer.createdAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        if (customerDate < startDate || customerDate > endDate) {
          return false;
        }
      }
      
      // Address filter (check if address exists before filtering)
      if (customer.address && filters.search) {
        const searchLower = filters.search.toLowerCase();
        return customer.address.toLowerCase().includes(searchLower);
      }
      
      // Phone filter (check if phone exists before filtering)
      if (customer.phone && filters.search) {
        return customer.phone.includes(filters.search);
      }
      
      return true;
    });
  }
  
  /**
   * Sorts customers based on sort state
   */
  export function sortCustomers(customers: Customer[], sort: SortState): Customer[] {
    return [...customers].sort((a, b) => {
      let aValue: unknown;
      let bValue: unknown;
      
      if (sort.field === 'createdAt' || sort.field === 'updatedAt') {
        aValue = new Date(a[sort.field]).getTime();
        bValue = new Date(b[sort.field]).getTime();
      } else {
        aValue = a[sort.field as keyof Customer];
        bValue = b[sort.field as keyof Customer];
      }
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      // String comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.toLowerCase().localeCompare(bValue.toLowerCase(), 'sv-SE');
        return sort.direction === 'asc' ? result : -result;
      }
      
      // Numeric comparison
      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sort.direction === 'asc' ? result : -result;
    });
  }
  
  /**
   * Gets customer activity summary
   */
  export function getCustomerActivitySummary(customer: Customer): {
    totalActivities: number;
    recentActivity?: CustomerActivity;
    daysSinceLastActivity: number;
  } {
    const activities = customer.activities || [];
    const recentActivity = activities.sort((a, b) => 
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    )[0];
    
    const daysSinceLastActivity = recentActivity 
      ? Math.floor((Date.now() - new Date(recentActivity.performedAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
      
    return {
      totalActivities: activities.length,
      recentActivity,
      daysSinceLastActivity
    };
  }
  
  // ============================================================================
  // USER & PERMISSION UTILITIES
  // ============================================================================
  
  /**
   * Gets user role configuration
   */
  export function getUserRoleInfo(role: UserRole) {
    return USER_ROLE_CONFIG[role];
  }
  
  /**
   * Checks if user has specific permission
   */
  export function hasPermission(userRole: UserRole, permission: string): boolean {
    return ROLE_PERMISSIONS[userRole]?.includes(permission as Permission) ?? false;
  }
  
  /**
   * Gets user display name with role
   */
  export function getUserDisplayName(user: User): string {
    const roleInfo = getUserRoleInfo(user.role);
    return `${user.name} (${roleInfo.label})`;
  }
  
  // ============================================================================
  // FILE UTILITIES
  // ============================================================================
  
  /**
   * Formats file size in human readable format
   */
  export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
  
  /**
   * Gets file extension from filename
   */
  export function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }
  
  /**
   * Checks if file type is allowed
   */
  export function isAllowedFileType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
  }
  
  // ============================================================================
  // FORM UTILITIES
  // ============================================================================
  
  /**
   * Validates required fields in an object
   */
  export function validateRequiredFields<T>(obj: T, requiredFields: (keyof T)[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    requiredFields.forEach(field => {
      const value = obj[field];
      if (value === null || value === undefined || value === '') {
        errors.push(`${String(field)} är obligatoriskt`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // ============================================================================
  // NOTIFICATION UTILITIES
  // ============================================================================
  
  /**
   * Creates notification object with defaults
   */
  export function createNotification(
    type: NotificationType,
    title: string,
    message?: string,
    duration?: number
  ): { id: string; type: NotificationType; title: string; message?: string; duration: number; createdAt: string } {
    return {
      id: generateId(),
      type,
      title,
      message,
      duration: duration || (type === 'error' ? 8000 : 5000),
      createdAt: new Date().toISOString()
    };
  }
  
  // ============================================================================
  // ARRAY UTILITIES
  // ============================================================================
  
  /**
   * Groups array of objects by a key
   */
  export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }
  
  /**
   * Removes duplicates from array based on a key
   */
  export function uniqueBy<T>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }
  
  /**
   * Debounces a function call
   */
  export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }