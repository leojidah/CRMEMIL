// ============================================================================
// UTILITY FUNCTIONS & HELPERS - Vattenmiljö CRM
// ============================================================================

import type { 
    Customer, 
    CustomerStatus, 
    UserRole, 
    User,
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
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat('sv-SE', defaultOptions).format(new Date(dateString));
  }
  
  /**
   * Formats date and time in Swedish locale
   */
  export function formatDateTime(dateString: string): string {
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  }
  
  /**
   * Gets relative time in Swedish (e.g., "2 dagar sedan")
   */
  export function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
    if (diffInSeconds < 60) return 'Just nu';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min sedan`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h sedan`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} dagar sedan`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} veckor sedan`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} månader sedan`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} år sedan`;
  }
  
  /**
   * Checks if a date is today
   */
  export function isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
  
  /**
   * Checks if a date is overdue
   */
  export function isOverdue(dateString: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
  }
  
  /**
   * Gets days until a date
   */
  export function getDaysUntil(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffInTime = date.getTime() - now.getTime();
    return Math.ceil(diffInTime / (1000 * 60 * 60 * 24));
  }
  
  // ============================================================================
  // STRING UTILITIES
  // ============================================================================
  
  /**
   * Capitalizes the first letter of a string
   */
  export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  /**
   * Converts string to title case
   */
  export function toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
  
  /**
   * Truncates text with ellipsis
   */
  export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  }
  
  /**
   * Removes extra whitespace and normalizes string
   */
  export function normalizeString(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  }
  
  /**
   * Generates initials from a name
   */
  export function getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
  
  // ============================================================================
  // PHONE UTILITIES
  // ============================================================================
  
  /**
   * Formats Swedish phone number
   */
  export function formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle different Swedish phone number formats
    if (cleaned.startsWith('46')) {
      // International format +46
      const number = cleaned.slice(2);
      if (number.length === 9) {
        return `+46 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5, 7)} ${number.slice(7)}`;
      }
    }
    
    if (cleaned.startsWith('07') && cleaned.length === 10) {
      // Mobile number 07X-XXX XX XX
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
    }
    
    if (cleaned.startsWith('08') && cleaned.length === 10) {
      // Stockholm area 08-XXX XX XX
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
    }
    
    // Default formatting
    return phone;
  }
  
  /**
   * Validates Swedish phone number
   */
  export function isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    
    // Swedish mobile (07X) or landline patterns
    return /^(07[0-9]{8}|08[0-9]{8}|0[1-9][0-9]{7,8})$/.test(cleaned) ||
           /^46[0-9]{8,9}$/.test(cleaned);
  }
  
  // ============================================================================
  // EMAIL UTILITIES
  // ============================================================================
  
  /**
   * Validates email format
   */
  export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Masks email for privacy (e.g., j***@example.com)
   */
  export function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal = local.charAt(0) + '*'.repeat(Math.max(0, local.length - 2)) + (local.length > 1 ? local.slice(-1) : '');
    return `${maskedLocal}@${domain}`;
  }
  
  // ============================================================================
  // CUSTOMER UTILITIES
  // ============================================================================
  
  /**
   * Gets customer status configuration
   */
  export function getCustomerStatusInfo(status: CustomerStatus) {
    return CUSTOMER_STATUS_CONFIG[status];
  }
  
  /**
   * Gets customer display name with fallback
   */
  export function getCustomerDisplayName(customer: Customer): string {
    return customer.name || 'Namnlös kund';
  }
  
  /**
   * Calculates customer priority score based on various factors
   */
  export function calculateCustomerPriority(customer: Customer): number {
    let score = 0;
    
    // Base priority
    if (customer.priority === 'high') score += 10;
    else if (customer.priority === 'medium') score += 5;
    
    // Status urgency
    if (customer.status === 'not_handled') score += 8;
    else if (customer.status === 'meeting') score += 6;
    else if (customer.status === 'sales') score += 4;
    
    // Time factor (older customers get higher priority)
    const daysSinceCreated = Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated > 7) score += 3;
    if (daysSinceCreated > 14) score += 2;
    
    // Estimated value factor
    if (customer.estimatedValue && customer.estimatedValue > 50000) score += 5;
    else if (customer.estimatedValue && customer.estimatedValue > 25000) score += 3;
    
    return score;
  }
  
  /**
   * Filters customers based on filter state
   */
  export function filterCustomers(customers: Customer[], filters: FilterState): Customer[] {
    return customers.filter(customer => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(customer.status)) {
        return false;
      }
      
      // Assigned to filter
      if (filters.assignedTo.length > 0 && customer.assignedTo && !filters.assignedTo.includes(customer.assignedTo)) {
        return false;
      }
      
      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(customer.priority)) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange) {
        const createdDate = new Date(customer.createdAt);
        const fromDate = new Date(filters.dateRange.from);
        const toDate = new Date(filters.dateRange.to);
        
        if (createdDate < fromDate || createdDate > toDate) {
          return false;
        }
      }
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          customer.name.toLowerCase().includes(searchLower) ||
          customer.address.toLowerCase().includes(searchLower) ||
          customer.phone.includes(searchLower) ||
          (customer.email && customer.email.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  }
  
  /**
   * Sorts customers based on sort state
   */
  export function sortCustomers(customers: Customer[], sort: SortState): Customer[] {
    return [...customers].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
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
    return ROLE_PERMISSIONS[userRole]?.includes(permission as any) ?? false;
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
      duration: duration || (type === 'error' ? 8000 : 4000),
      createdAt: new Date().toISOString()
    };
  }
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Generates a unique ID
   */
  export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Debounce function for search and other inputs
   */
  export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }
  
  /**
   * Deep clone an object
   */
  export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
    if (typeof obj === 'object') {
      const clonedObj = {} as any;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  }
  
  /**
   * Sleep utility for delays
   */
  export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Safe JSON parse with fallback
   */
  export function safeParse<T>(jsonString: string, fallback: T): T {
    try {
      return JSON.parse(jsonString);
    } catch {
      return fallback;
    }
  }
  
  /**
   * Checks if value is empty (null, undefined, empty string, empty array, empty object)
   */
  export function isEmpty(value: any): boolean {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }