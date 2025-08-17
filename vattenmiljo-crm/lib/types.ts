// ============================================================================
// TYPE DEFINITIONS - Vattenmiljö CRM
// ============================================================================

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export type CustomerStatus = 
  | 'not_handled'
  | 'no_answer'
  | 'call_again' 
  | 'not_interested'
  | 'meeting_booked'
  | 'quotation_stage'
  | 'extended_water_test'
  | 'sold'
  | 'ready_for_installation'
  | 'installation_complete'
  | 'archived';

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
  meetings?: Meeting[];
  quotations?: Quotation[];
  installations?: Installation[];
  waterTests?: WaterTest[];
  metadata?: Record<string, unknown>;
  // Enhanced Kanban fields
  needsAnalysis?: NeedsAnalysis;
  saleAmount?: number;
  saleDate?: string;
  lastContactDate?: string;
  nextFollowupDate?: string;
  leadSource?: string;
  waterTestResults?: Record<string, unknown>;
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
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url?: string;
  storagePath: string;
  category?: 'contract' | 'photo' | 'document' | 'other';
  uploadedBy: string;
  uploadedById: string;
  uploadedAt: string;
}

export type ActivityType = 
  | 'status_change'
  | 'note_added'
  | 'file_upload'
  | 'file_download'
  | 'file_delete'
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

export type UserRole = 'salesperson' | 'internal' | 'installer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  lastLogout?: string;
  passwordHash?: string;
}

// Authentication types
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
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
  leadSource?: string;
  lastContactDate?: string;
  nextFollowupDate?: string;
  saleAmount?: number;
  saleDate?: string;
  needsAnalysis?: NeedsAnalysis;
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
// KANBAN TYPES
// ============================================================================

export interface NeedsAnalysis {
  waterHardness?: 'low' | 'medium' | 'high' | 'very_high';
  chlorineTaste?: boolean;
  ironStaining?: boolean;
  bacteriaConcern?: boolean;
  wellWater?: boolean;
  installationType?: 'whole_house' | 'kitchen_only' | 'bathroom' | 'custom';
  budgetRange?: 'under_20k' | '20k_50k' | '50k_100k' | 'over_100k';
  timeframe?: 'immediate' | 'within_month' | 'within_3months' | 'flexible';
  additionalNotes?: string;
}

export interface Meeting {
  id: string;
  customerId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingType: 'consultation' | 'installation' | 'followup' | 'sales';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  location?: string;
  attendees?: string[];
  agenda?: string;
  outcome?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  customerId: string;
  quoteNumber: string;
  totalAmount: number;
  currency: string;
  items: QuotationItem[];
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  validUntil?: string;
  sentAt?: string;
  acceptedAt?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface WaterTest {
  id: string;
  customerId: string;
  testType: 'standard' | 'comprehensive' | 'bacteria' | 'chemical';
  testDate: string;
  results: WaterTestResults;
  recommendations?: Record<string, unknown>;
  phLevel?: number;
  hardnessLevel?: number;
  chlorineLevel?: number;
  ironContent?: number;
  bacteriaPresent?: boolean;
  sampleLocation?: string;
  testedBy?: string;
  createdAt: string;
}

export interface WaterTestResults {
  ph?: number;
  hardness?: number;
  chlorine?: number;
  iron?: number;
  bacteria?: boolean;
  nitrates?: number;
  pesticides?: boolean;
  overallRating?: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations?: string[];
}

export interface Installation {
  id: string;
  customerId: string;
  scheduledDate?: string;
  completedDate?: string;
  installerId?: string;
  equipmentInstalled: InstallationEquipment[];
  installationNotes?: string;
  customerSatisfaction?: number; // 1-5 rating
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface InstallationEquipment {
  id: string;
  name: string;
  model?: string;
  serialNumber?: string;
  warrantyMonths?: number;
}

export interface Notification {
  id: string;
  recipientId: string;
  customerId?: string;
  type: 'customer_status_change' | 'meeting_reminder' | 'quotation_update' | 'installation_scheduled';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
}

// ============================================================================
// KANBAN BOARD TYPES
// ============================================================================

export interface KanbanColumn {
  id: CustomerStatus;
  title: string;
  description?: string;
  color: string;
  order: number;
  visibleToRoles: UserRole[];
}

export interface KanbanCard {
  customer: Customer;
  isDragging?: boolean;
}

export interface DragEndEvent {
  active: {
    id: string;
  };
  over: {
    id: string;
  } | null;
}

// ============================================================================
// EXPORT GROUPED TYPES
// ============================================================================

export type {
  Customer as CustomerType,
  User as UserType,
  CustomerNote as NoteType,
  CustomerFile as FileType,
  CustomerActivity as ActivityInterface,
  Meeting as MeetingType,
  Quotation as QuotationType,
  Installation as InstallationType,
  WaterTest as WaterTestType
};