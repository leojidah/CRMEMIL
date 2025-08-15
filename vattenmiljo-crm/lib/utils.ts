// ============================================================================
// UTILITY FUNCTIONS & HELPERS - Vattenmiljö CRM (Enhanced)
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
// ENHANCED DATE UTILITIES
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
 * Enhanced relative time formatting with more precision and Swedish locale
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Handle future dates
  if (diffInSeconds < 0) {
    return 'I framtiden';
  }
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'Just nu';
  }
  
  // Minutes
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minut${diffInMinutes > 1 ? 'er' : ''} sedan`;
  }
  
  // Hours
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} timme${diffInHours > 1 ? 'r' : ''} sedan`;
  }
  
  // Days
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Igår';
  }
  if (diffInDays < 7) {
    return `${diffInDays} dagar sedan`;
  }
  
  // Weeks
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks === 1) {
    return 'För en vecka sedan';
  }
  if (diffInWeeks < 4) {
    return `${diffInWeeks} veckor sedan`;
  }
  
  // Months
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) {
    return 'För en månad sedan';
  }
  if (diffInMonths < 12) {
    return `${diffInMonths} månader sedan`;
  }
  
  // Years
  const diffInYears = Math.floor(diffInMonths / 12);
  if (diffInYears === 1) {
    return 'För ett år sedan';
  }
  return `${diffInYears} år sedan`;
}

/**
 * More detailed relative time formatting for precise timestamps
 */
export function formatDetailedRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Handle future dates
  if (diffInSeconds < 0) {
    return 'I framtiden';
  }

  // Less than 30 seconds
  if (diffInSeconds < 30) {
    return 'Alldeles nyss';
  }

  // Less than a minute
  if (diffInSeconds < 60) {
    return 'Mindre än en minut sedan';
  }

  // Minutes with more precision
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    if (diffInMinutes === 1) return '1 minut sedan';
    if (diffInMinutes < 5) return `${diffInMinutes} minuter sedan`;
    if (diffInMinutes < 15) return `~${Math.round(diffInMinutes / 5) * 5} minuter sedan`;
    return `${diffInMinutes} minuter sedan`;
  }

  // Hours with precision
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (diffInHours === 1) return '1 timme sedan';
    return `${diffInHours} timmar sedan`;
  }

  // Today/Yesterday logic
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Idag ${date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}`;
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return `Igår ${date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // This week
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    const dayNames = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
    return `${dayNames[date.getDay()]} ${date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // More than a week - use standard format
  if (diffInDays < 30) {
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} vecka${diffInWeeks > 1 ? 'r' : ''} sedan`;
  }

  // More than a month
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} månad${diffInMonths > 1 ? 'er' : ''} sedan`;
  }

  // More than a year
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} år sedan`;
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

/**
 * Get current month name in Swedish
 */
export function getCurrentMonthName(): string {
  const months = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
  ];
  return months[new Date().getMonth()];
}

/**
 * Get current week number
 */
export function getCurrentWeekNumber(): number {
  const date = new Date();
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.toDateString() === today.toDateString();
}

/**
 * Check if date is this week
 */
export function isThisWeek(date: string | Date): boolean {
  const today = new Date();
  const checkDate = new Date(date);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  return checkDate >= weekAgo && checkDate <= today;
}

/**
 * Check if date is this month
 */
export function isThisMonth(date: string | Date): boolean {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.getMonth() === today.getMonth() && 
         checkDate.getFullYear() === today.getFullYear();
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
 * Generate user initials from full name
 */
export function generateInitials(name: string): string {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Generate a random color class for avatars
 */
export function generateAvatarColor(seed?: string): string {
  const colors = [
    'bg-gradient-to-r from-blue-500 to-blue-600',
    'bg-gradient-to-r from-green-500 to-green-600',
    'bg-gradient-to-r from-purple-500 to-purple-600',
    'bg-gradient-to-r from-red-500 to-red-600',
    'bg-gradient-to-r from-yellow-500 to-yellow-600',
    'bg-gradient-to-r from-indigo-500 to-indigo-600',
    'bg-gradient-to-r from-pink-500 to-pink-600',
    'bg-gradient-to-r from-teal-500 to-teal-600',
  ];

  if (seed) {
    const hash = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  return colors[Math.floor(Math.random() * colors.length)];
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

/**
 * Format currency in SEK
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// ============================================================================
// MATH UTILITIES
// ============================================================================

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Calculate percentage of a value
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Clamp a number between min and max values
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Round to specific decimal places
 */
export function roundTo(num: number, decimals: number): number {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
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
 * Gets customer activity summary with enhanced analytics
 */
export function getCustomerActivitySummary(customer: Customer): {
  totalActivities: number;
  recentActivity?: CustomerActivity;
  daysSinceLastActivity: number;
  activitiesThisWeek: number;
  activitiesThisMonth: number;
  mostCommonActivityType?: string;
} {
  const activities = customer.activities || [];
  const recentActivity = activities.sort((a, b) => 
    new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
  )[0];
  
  const daysSinceLastActivity = recentActivity 
    ? Math.floor((Date.now() - new Date(recentActivity.performedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const activitiesThisWeek = activities.filter(activity => 
    isThisWeek(activity.performedAt)
  ).length;

  const activitiesThisMonth = activities.filter(activity => 
    isThisMonth(activity.performedAt)
  ).length;

  // Find most common activity type
  const activityTypes = activities.map(a => a.type);
  const typeCounts = activityTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonActivityType = Object.keys(typeCounts).reduce((a, b) => 
    typeCounts[a] > typeCounts[b] ? a : b
  );
    
  return {
    totalActivities: activities.length,
    recentActivity,
    daysSinceLastActivity,
    activitiesThisWeek,
    activitiesThisMonth,
    mostCommonActivityType: activities.length > 0 ? mostCommonActivityType : undefined
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

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Swedish phone number
 */
export function isValidSwedishPhone(phone: string): boolean {
  const cleanedPhone = phone.replace(/\D/g, '');
  // Swedish mobile numbers start with 07 and have 10 digits
  // Landline numbers vary but are typically 8-10 digits
  return cleanedPhone.length >= 8 && cleanedPhone.length <= 15;
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
 * Sort array by multiple criteria
 */
export function sortBy<T>(array: T[], ...criteria: Array<keyof T | ((item: T) => any)>): T[] {
  return [...array].sort((a, b) => {
    for (const criterion of criteria) {
      let aVal, bVal;
      
      if (typeof criterion === 'function') {
        aVal = criterion(a);
        bVal = criterion(b);
      } else {
        aVal = a[criterion];
        bVal = b[criterion];
      }
      
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
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

/**
 * Throttle a function call
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, wait);
    }
  };
}

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

/**
 * Safe localStorage access with fallbacks
 */
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
      return false;
    }
  },

  remove: (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage:`, error);
      return false;
    }
  }
};