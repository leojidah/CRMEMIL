// ============================================================================
// APP CONSTANTS & CONFIGURATION - Vattenmiljö CRM
// ============================================================================

import type { 
    CustomerStatusColor, 
    UserRoleLabel, 
    RolePermissions, 
    AppConfig,
    Permission,
    CustomerStatus,
    UserRole
  } from './types';
  
  // ============================================================================
  // CUSTOMER STATUS CONFIGURATION
  // ============================================================================
  
  export const CUSTOMER_STATUS_CONFIG: Record<CustomerStatus, {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
    description: string;
  }> = {
    not_handled: {
      label: 'Ej hanterad',
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: 'AlertCircle',
      description: 'Ny kund som behöver behandlas'
    },
    meeting: {
      label: 'Möte bokat',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: 'Calendar',
      description: 'Möte är schemalagt med kunden'
    },
    sales: {
      label: 'Försäljning',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: 'TrendingUp',
      description: 'Aktiv försäljningsprocess pågår'
    },
    done: {
      label: 'Redo',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: 'CheckCircle2',
      description: 'Installation klar, kund färdigbehandlad'
    },
    archived: {
      label: 'Arkiverad',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: 'Archive',
      description: 'Ärendet är avslutat och arkiverat'
    }
  };
  
  // Status progression rules
  export const STATUS_FLOW: Record<CustomerStatus, CustomerStatus[]> = {
    not_handled: ['meeting', 'archived'],
    meeting: ['sales', 'archived', 'not_handled'],
    sales: ['done', 'meeting', 'archived'],
    done: ['archived'],
    archived: [] // Cannot transition from archived
  };
  
  // ============================================================================
  // USER ROLES & PERMISSIONS
  // ============================================================================
  
  export const USER_ROLE_CONFIG: Record<UserRole, {
    label: string;
    description: string;
    color: string;
    icon: string;
  }> = {
    salesperson: {
      label: 'Säljare',
      description: 'Skapar kunder, bokar möten, hanterar leads',
      color: 'text-blue-600',
      icon: 'Users'
    },
    internal: {
      label: 'Intern Personal',
      description: 'Bearbetar försäljningar, lägger till noter',
      color: 'text-purple-600',
      icon: 'Building2'
    },
    installer: {
      label: 'Montör',
      description: 'Hanterar installationer och slutförande',
      color: 'text-green-600',
      icon: 'Wrench'
    }
  };
  
  export const ROLE_PERMISSIONS: RolePermissions = {
    salesperson: [
      'customer:create',
      'customer:read',
      'customer:update',
      'files:upload',
      'notes:add'
    ],
    internal: [
      'customer:create',
      'customer:read',
      'customer:update',
      'customer:archive',
      'files:upload',
      'files:delete',
      'notes:add',
      'analytics:view'
    ],
    installer: [
      'customer:read',
      'customer:update',
      'files:upload',
      'notes:add'
    ]
  };
  
  // ============================================================================
  // PRIORITY LEVELS
  // ============================================================================
  
  export const PRIORITY_CONFIG = {
    low: {
      label: 'Låg',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: 'ChevronDown'
    },
    medium: {
      label: 'Mellan',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: 'Minus'
    },
    high: {
      label: 'Hög',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: 'ChevronUp'
    }
  };
  
  // ============================================================================
  // ACTIVITY TYPES
  // ============================================================================
  
  export const ACTIVITY_CONFIG = {
    status_change: {
      label: 'Statusändring',
      icon: 'RefreshCw',
      color: 'text-blue-600'
    },
    note_added: {
      label: 'Anteckning tillagd',
      icon: 'FileText',
      color: 'text-green-600'
    },
    file_uploaded: {
      label: 'Fil uppladdad',
      icon: 'Upload',
      color: 'text-purple-600'
    },
    meeting_scheduled: {
      label: 'Möte schemalagt',
      icon: 'Calendar',
      color: 'text-orange-600'
    },
    call_made: {
      label: 'Telefonsamtal',
      icon: 'Phone',
      color: 'text-indigo-600'
    },
    email_sent: {
      label: 'E-post skickad',
      icon: 'Mail',
      color: 'text-cyan-600'
    },
    custom: {
      label: 'Anpassad aktivitet',
      icon: 'Star',
      color: 'text-gray-600'
    }
  };
  
  // ============================================================================
  // APP CONFIGURATION
  // ============================================================================
  
  export const APP_CONFIG: AppConfig = {
    appName: 'Vattenmiljö CRM',
    version: '2.0.0',
    features: {
      darkMode: true,
      notifications: true,
      fileUpload: true,
      analytics: true
    },
    limits: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFilesPerCustomer: 20,
      customersPerPage: 25
    }
  };
  
  // ============================================================================
  // UI CONSTANTS
  // ============================================================================
  
  export const NOTIFICATION_DURATION = {
    success: 4000,
    info: 5000,
    warning: 6000,
    error: 8000
  };
  
  export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  };
  
  export const ANIMATION_DURATION = {
    fast: 150,
    normal: 300,
    slow: 500
  };
  
  // ============================================================================
  // FILE HANDLING
  // ============================================================================
  
  export const ALLOWED_FILE_TYPES = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    text: ['text/plain', 'text/csv']
  };
  
  export const FILE_CATEGORY_CONFIG = {
    contract: {
      label: 'Kontrakt',
      icon: 'FileText',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    photo: {
      label: 'Foto',
      icon: 'Image',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    document: {
      label: 'Dokument',
      icon: 'File',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    other: {
      label: 'Övrigt',
      icon: 'Paperclip',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  };
  
  // ============================================================================
  // DASHBOARD KPIs
  // ============================================================================
  
  export const DEFAULT_KPIS = [
    {
      id: 'total_customers',
      title: 'Totalt antal kunder',
      icon: 'Users',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'active_meetings',
      title: 'Aktiva möten',
      icon: 'Calendar',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'sales_progress',
      title: 'Pågående försäljning',
      icon: 'TrendingUp',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'completed_today',
      title: 'Avslutade idag',
      icon: 'CheckCircle2',
      color: 'from-green-500 to-green-600'
    }
  ];
  
  // ============================================================================
  // SEARCH CONFIGURATION
  // ============================================================================
  
  export const SEARCH_CONFIG = {
    minQueryLength: 2,
    debounceDelay: 300,
    maxResults: 50,
    searchFields: ['name', 'address', 'phone', 'email'] as const
  };
  
  // ============================================================================
  // THEME CONFIGURATION
  // ============================================================================
  
  export const THEME_CONFIG = {
    colors: {
      primary: {
        light: '#2563eb',
        dark: '#3b82f6'
      },
      accent: {
        light: '#10b981',
        dark: '#34d399'
      },
      background: {
        light: '#ffffff',
        dark: '#0f172a'
      },
      surface: {
        light: '#f8fafc',
        dark: '#1e293b'
      }
    },
    borderRadius: {
      none: '0',
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem'
    }
  };
  
  // ============================================================================
  // ERROR MESSAGES
  // ============================================================================
  
  export const ERROR_MESSAGES = {
    generic: 'Ett oväntat fel uppstod. Försök igen.',
    network: 'Nätverksfel. Kontrollera din internetanslutning.',
    validation: 'Vänligen kontrollera att all information är korrekt ifylld.',
    unauthorized: 'Du har inte behörighet att utföra denna åtgärd.',
    notFound: 'Den begärda informationen kunde inte hittas.',
    fileSize: 'Filen är för stor. Max storlek är 10MB.',
    fileType: 'Filtypen stöds inte.'
  };
  
  // ============================================================================
  // SUCCESS MESSAGES
  // ============================================================================
  
  export const SUCCESS_MESSAGES = {
    customerCreated: 'Kunden har skapats framgångsrikt!',
    customerUpdated: 'Kundinformationen har uppdaterats.',
    customerArchived: 'Kunden har arkiverats.',
    fileUploaded: 'Filen har laddats upp framgångsrikt.',
    noteAdded: 'Anteckningen har sparats.',
    statusUpdated: 'Kundstatus har uppdaterats.'
  };
  
  // ============================================================================
  // EXPORT GROUPED CONSTANTS
  // ============================================================================
  
  export const CONSTANTS = {
    status: CUSTOMER_STATUS_CONFIG,
    roles: USER_ROLE_CONFIG,
    priorities: PRIORITY_CONFIG,
    activities: ACTIVITY_CONFIG,
    files: FILE_CATEGORY_CONFIG,
    theme: THEME_CONFIG,
    errors: ERROR_MESSAGES,
    success: SUCCESS_MESSAGES
  } as const;
  
  // Helper functions for constants
  export const getStatusConfig = (status: CustomerStatus) => CUSTOMER_STATUS_CONFIG[status];
  export const getRoleConfig = (role: UserRole) => USER_ROLE_CONFIG[role];
  export const canTransitionTo = (from: CustomerStatus, to: CustomerStatus) => 
    STATUS_FLOW[from]?.includes(to) ?? false;