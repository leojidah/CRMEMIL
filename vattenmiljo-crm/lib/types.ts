// ============================================================================
// TYPE DEFINITIONS - Vattenmiljö CRM
// ============================================================================

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export type CustomerStatus = 'not_handled' | 'meeting' | 'sales' | 'done' | 'archived';

export type CustomerPriority = 'low' | 'medium' | 'high';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  status: CustomerStatus;
  priority: CustomerPriority;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  notes?: CustomerNote[];
  files?: CustomerFile[];
  activities?: CustomerActivity[];
  metadata?: Record<string, unknown>;
}

export interface CustomerNote {
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  isPrivate?: boolean;
}

export interface CustomerFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category: 'contract' | 'photo' | 'document' | 'other';
  uploadedBy: string;
  uploadedById: string;
  uploadedAt: string;
}

export type ActivityType = 
  | 'status_change'
  | 'note_added'
  | 'file_uploaded'
  | 'meeting_scheduled'
  | 'call_made'
  | 'email_sent'
  | 'custom';

export interface CustomerActivity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  performedBy: string;
  performedById: string;
  performedAt: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'salesperson' | 'internal' | 'installer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type Permission = 
  | 'customer:create'
  | 'customer:read'
  | 'customer:update'
  | 'customer:archive'
  | 'files:upload'
  | 'files:delete'
  | 'notes:add'
  | 'analytics:view';

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface FilterState {
  search?: string;
  status?: CustomerStatus[];
  assignedTo?: string[];
  priority?: CustomerPriority[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// UI TYPES
// ============================================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration: number;
  createdAt: string;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AppConfig {
  appName: string;
  version: string;
  features: {
    darkMode: boolean;
    notifications: boolean;
    fileUpload: boolean;
    analytics: boolean;
  };
  limits: {
    maxFileSize: number;
    maxFilesPerCustomer: number;
    customersPerPage: number;
  };
}

// ============================================================================
// ROLE & PERMISSION TYPES
// ============================================================================

export type RolePermissions = Record<UserRole, Permission[]>;

export type UserRoleLabel = Record<UserRole, string>;

export type CustomerStatusColor = Record<CustomerStatus, {
  color: string;
  bgColor: string;
  borderColor: string;
}>;

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CustomerFormData {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  status: CustomerStatus;
  priority: CustomerPriority;
  assignedTo?: string;
  notes?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface KPIData {
  id: string;
  title: string;
  value: number | string;
  change?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  icon: string;
  color: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// ============================================================================
// EXPORT GROUPED TYPES
// ============================================================================

export type {
  Customer as CustomerType,
  User as UserType,
  CustomerNote as NoteType,
  CustomerFile as FileType,
  CustomerActivity as ActivityInterface
};