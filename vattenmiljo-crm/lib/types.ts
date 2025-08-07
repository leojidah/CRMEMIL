// ============================================================================
// TYPE DEFINITIONS - Vattenmilj� CRM
// ============================================================================

// Customer Types
export type CustomerStatus = 
  | 'not_handled' 
  | 'meeting' 
  | 'sales' 
  | 'done' 
  | 'archived';

export type CustomerStatusColor = {
  [K in CustomerStatus]: {
    label: string;
    bgColor: string;
    color: string;
    borderColor: string;
  }
};

// User & Permission Types
export type UserRole = 
  | 'admin' 
  | 'manager' 
  | 'sales' 
  | 'support' 
  | 'viewer';

export type Permission = 
  | 'customers.read'
  | 'customers.write' 
  | 'customers.delete'
  | 'users.read'
  | 'users.write'
  | 'users.delete'
  | 'settings.read'
  | 'settings.write'
  | 'reports.read'
  | 'reports.export';

export type UserRoleLabel = {
  [K in UserRole]: string;
};

export type RolePermissions = {
  [K in UserRole]: Permission[];
};

// App Configuration
export type AppConfig = {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  api: {
    baseUrl: string;
    timeout: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
};

// Priority Types
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Common Entity Types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  address?: string; 
  company?: string;
  status: CustomerStatus;
  priority: Priority;
  assignedTo?: string;
  estimatedValue?: number;
  notes?: string;
  tags?: string[];
  activities?: CustomerActivity[];
}

// Activity Types
export interface CustomerActivity extends BaseEntity {
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'sale';
  title: string;
  description?: string;
  performedAt: Date;
  performedBy: string;
  customerId: string;
}

// Filter and Sort Types
export interface FilterState {
  status?: CustomerStatus[];
  priority?: Priority[];
  assignedTo?: string[];
  tags?: string[];
  search?: string;
}

export interface SortState {
  field: keyof Customer;
  direction: 'asc' | 'desc';
}

// Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
}