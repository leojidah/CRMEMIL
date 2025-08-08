'use client';

import React, { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, CheckCircle2, Building2, Wrench, Plus, Search, Filter, Upload, Bell, X, Edit, Trash2, FileText, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';

// Types
type CustomerStatus = 'not_handled' | 'meeting' | 'sales' | 'done' | 'installed' | 'archived';
type CustomerPriority = 'low' | 'medium' | 'high';
type UserRole = 'salesperson' | 'internal' | 'installer';

interface Customer {
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
  notes?: string;
  files?: CustomerFile[];
}

interface CustomerFile {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

interface User {
  id: string;
  name: string;
  role: UserRole;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

// Constants
const STATUS_CONFIG = {
  not_handled: { label: 'Ej hanterad', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  meeting: { label: 'Möte bokat', color: 'bg-yellow-100 text-yellow-800', icon: Calendar },
  sales: { label: 'Försäljning', color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
  done: { label: 'Klar för installation', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  installed: { label: 'Installation klar', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  archived: { label: 'Arkiverad', color: 'bg-gray-100 text-gray-800', icon: CheckCircle2 }
};

const ROLE_CONFIG = {
  salesperson: { label: 'Säljare', color: 'text-blue-600', icon: Users },
  internal: { label: 'Intern Personal', color: 'text-purple-600', icon: Building2 },
  installer: { label: 'Montör', color: 'text-green-600', icon: Wrench }
};

const PRIORITY_CONFIG = {
  low: { label: 'Låg', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Hög', color: 'bg-red-100 text-red-800' }
};

// Main CRM Component
export default function VattenmiljoCRM() {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-001',
    name: 'Demo Användare',
    role: 'salesperson'
  });

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 'customer-001',
      name: 'Anna Andersson',
      email: 'anna@example.com',
      phone: '070-123 45 67',
      address: 'Storgatan 1, Stockholm',
      status: 'meeting',
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: 'Intresserad av vattenpump för hela huset.',
      files: []
    },
    {
      id: 'customer-002',
      name: 'Erik Eriksson',
      email: 'erik@company.se',
      phone: '070-987 65 43',
      address: 'Vasagatan 10, Göteborg',
      status: 'sales',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: 'Behöver offert för industrial system.',
      files: []
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');

  // Notification system
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  // ID generator for unique keys
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Customer creation
  const createCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'files'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: []
    };
    setCustomers(prev => [newCustomer, ...prev]);
    addNotification({
      title: 'Kund skapad',
      message: `${newCustomer.name} har lagts till i systemet`,
      type: 'success'
    });
  };

  // Status update with notifications (fixed to prevent duplicate notifications)
  const updateCustomerStatus = (customerId: string, newStatus: CustomerStatus) => {
    setCustomers(prev => prev.map(customer => {
      if (customer.id === customerId && customer.status !== newStatus) {
        const updatedCustomer = {
          ...customer,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };

        // Trigger notifications based on status transitions (only when status actually changes)
        if (newStatus === 'sales' && customer.status !== 'sales') {
          // Säljare markerar som "försäljning" - notifiera intern personal
          setTimeout(() => {
            addNotification({
              title: '🔔 Försäljning genomförd!',
              message: `${customer.name} - Redo för intern behandling`,
              type: 'info'
            });
          }, 100);
        } else if (newStatus === 'done' && customer.status !== 'done') {
          // Intern personal markerar som "klar" - notifiera montörer
          setTimeout(() => {
            addNotification({
              title: '🔔 Redo för installation!',
              message: `${customer.name} - All information komplett, redo för montage`,
              type: 'success'
            });
          }, 100);
        } else if (newStatus === 'installed' && customer.status !== 'installed') {
          // Montör markerar som "installation klar"
          setTimeout(() => {
            addNotification({
              title: '🔔 Installation genomförd!',
              message: `${customer.name} - Installation är slutförd`,
              type: 'success'
            });
          }, 100);
        }

        return updatedCustomer;
      }
      return customer;
    }));
  };

  // File upload simulation
  const uploadFile = (customerId: string, files: FileList) => {
    const file = files[0];
    if (!file) return;

    const newFile: CustomerFile = {
      id: generateId(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      uploadedAt: new Date().toISOString()
    };

    setCustomers(prev => prev.map(customer => {
      if (customer.id === customerId) {
        return {
          ...customer,
          files: [...(customer.files || []), newFile],
          updatedAt: new Date().toISOString()
        };
      }
      return customer;
    }));

    addNotification({
      title: 'Fil uppladdad',
      message: `${file.name} har laddats upp för ${customers.find(c => c.id === customerId)?.name}`,
      type: 'success'
    });
  };

  // Filter customers based on role and filters - ÄNDRING 1: Uppdaterad logik för visibility
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;

    // Om det finns sökterm, visa alla sökbara resultat
    if (searchTerm.trim().length > 0) {
      return matchesSearch && matchesStatus;
    }

    // Annars, visa bara kunder som användaren har action på
    const hasAction = () => {
      // Om kunden är assignad till aktuell användare
      if (customer.assignedTo === currentUser.id) return true;
      
      // Rollbaserad action-logik
      if (currentUser.role === 'salesperson') {
        return customer.status === 'not_handled' || 
               customer.status === 'meeting' || 
               customer.status === 'sales';
      } else if (currentUser.role === 'internal') {
        return customer.status === 'sales'; // Behöver behandla försäljning
      } else if (currentUser.role === 'installer') {
        return customer.status === 'done' || customer.status === 'installed'; // Behöver installera eller redan installerat
      }
      return false;
    };

    return matchesStatus && hasAction();
  });

  // Get role-specific view of customer status
  const getRoleSpecificStatus = (customer: Customer) => {
    if (currentUser.role === 'internal' && customer.status === 'sales') {
      return 'not_handled';
    }
    if (currentUser.role === 'internal' && customer.status === 'done') {
      return 'completed';
    }
    return customer.status;
  };

  // Role switching
  const switchRole = (newRole: UserRole) => {
    setCurrentUser(prev => ({ ...prev, role: newRole }));
    setStatusFilter('all');
    addNotification({
      title: 'Roll byttes',
      message: `Nu arbetar du som ${ROLE_CONFIG[newRole].label}`,
      type: 'info'
    });
  };

  // Customer Form Component
  const CustomerForm = ({ customer, onSave, onCancel }: {
    customer?: Customer;
    onSave: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'files'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      status: customer?.status || 'not_handled' as CustomerStatus,
      priority: customer?.priority || 'medium' as CustomerPriority,
      assignedTo: customer?.assignedTo || '',
      notes: customer?.notes || ''
    });

    const handleSubmit = () => {
      if (!formData.name || !formData.phone) return;
      onSave(formData);
      onCancel();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {customer ? 'Redigera kund' : 'Skapa ny kund'}
            </h3>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Namn *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kundens namn"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="070-123 45 67"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="kund@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adress</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Gata, stad"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as CustomerStatus }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="not_handled">Ej hanterad</option>
                  <option value="meeting">Möte bokat</option>
                  <option value="sales">Försäljning</option>
                  <option value="done">Klar för installation</option>
                  <option value="installed">Installation klar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioritet</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as CustomerPriority }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Låg</option>
                  <option value="medium">Medium</option>
                  <option value="high">Hög</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anteckningar</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Lägg till anteckningar..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {customer ? 'Uppdatera' : 'Skapa kund'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Customer Card Component
  const CustomerCard = ({ customer }: { customer: Customer }) => {
    const status = getRoleSpecificStatus(customer);
    const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[customer.status];
    const StatusIcon = statusConfig.icon;

    const canUpdateStatus = () => {
      if (currentUser.role === 'salesperson') return true;
      if (currentUser.role === 'internal' && customer.status === 'sales') return true;
      if (currentUser.role === 'installer' && customer.status === 'done') return true; // Montörer kan markera som installerat
      return false;
    };

    const getNextStatus = () => {
      if (currentUser.role === 'salesperson') {
        if (customer.status === 'not_handled') return 'meeting';
        if (customer.status === 'meeting') return 'sales';
        return customer.status;
      }
      if (currentUser.role === 'internal' && customer.status === 'sales') {
        return 'done';
      }
      if (currentUser.role === 'installer' && customer.status === 'done') {
        return 'installed';
      }
      return customer.status;
    };

    const handleStatusUpdate = () => {
      const nextStatus = getNextStatus();
      if (nextStatus !== customer.status) {
        updateCustomerStatus(customer.id, nextStatus);
      }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        uploadFile(customer.id, e.target.files);
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{customer.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_CONFIG[customer.priority].color}`}>
                {PRIORITY_CONFIG[customer.priority].label}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingCustomer(customer)}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {customer.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{customer.email}</span>
            </div>
          )}
          {customer.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{customer.address}</span>
            </div>
          )}
        </div>

        {customer.notes && (
          <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
            <strong>Anteckningar:</strong> {customer.notes}
          </div>
        )}

        {customer.files && customer.files.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Bifogade filer:</p>
            <div className="space-y-1">
              {customer.files.map(file => (
                <div key={file.id} className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {canUpdateStatus() && (
            <button
              onClick={handleStatusUpdate}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              {currentUser.role === 'salesperson' && customer.status === 'not_handled' && 'Boka möte'}
              {currentUser.role === 'salesperson' && customer.status === 'meeting' && 'Markera som såld'}
              {currentUser.role === 'internal' && customer.status === 'sales' && 'Markera som klar'}
              {currentUser.role === 'installer' && customer.status === 'done' && 'Markera installation klar'}
            </button>
          )}
          
          <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Ladda upp
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            />
          </label>
        </div>
      </div>
    );
  };

  // Notification Component
  const NotificationToast = ({ notification }: { notification: Notification }) => {
    const colors = {
      success: 'border-green-200 bg-green-50 text-green-800',
      info: 'border-blue-200 bg-blue-50 text-blue-800',
      warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
      error: 'border-red-200 bg-red-50 text-red-800'
    };

    return (
      <div className={`border-l-4 p-4 rounded-r-lg shadow-lg ${colors[notification.type]} animate-slide-in-right`}>
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium">{notification.title}</h4>
            <p className="text-sm mt-1">{notification.message}</p>
          </div>
          <button
            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            className="text-current opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">Vattenmiljö CRM</h1>
              <span className="text-sm text-gray-500">
                {ROLE_CONFIG[currentUser.role].label}
              </span>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {Object.entries(ROLE_CONFIG).map(([role, config]) => {
                  const RoleIcon = role === 'salesperson' ? Users : role === 'internal' ? Building2 : Wrench;
                  return (
                    <button
                      key={role}
                      onClick={() => switchRole(role as UserRole)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                        currentUser.role === role
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <RoleIcon className="w-4 h-4" />
                      {config.label}
                    </button>
                  );
                })}
              </div>

              {/* Notifications indicator */}
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-500" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Sök kunder..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alla statusar</option>
              {currentUser.role === 'internal' ? (
                <>
                  <option value="sales">Ej hanterade</option>
                  <option value="done">Klara</option>
                </>
              ) : currentUser.role === 'installer' ? (
                <>
                  <option value="done">Redo för installation</option>
                  <option value="installed">Installation klar</option>
                </>
              ) : (
                Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))
              )}
            </select>
          </div>

          {(currentUser.role === 'salesperson' || currentUser.role === 'internal') && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ny kund
            </button>
          )}
        </div>

        {/* Stats Cards - ÄNDRING 2: Omordning av statuskort */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* 1. Totalt kunder */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totalt kunder</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* 2. Ej hanterade */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ej hanterade</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'not_handled').length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* 3. Pågående försäljning */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pågående försäljning</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'sales').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* 4. Redo för installation */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Redo för installation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'done').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* 5. Installationer klara */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Installationer klara</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'installed').length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Inga kunder hittades</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Prova att justera dina sökkriterier'
                  : 'Skapa din första kund för att komma igång'
                }
              </p>
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <CustomerCard key={customer.id} customer={customer} />
            ))
          )}
        </div>
      </main>

      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map(notification => (
          <NotificationToast key={notification.id} notification={notification} />
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateForm || editingCustomer) && (
        <CustomerForm
          customer={editingCustomer || undefined}
          onSave={editingCustomer ? 
            (data) => {
              setCustomers(prev => prev.map(c => 
                c.id === editingCustomer.id 
                  ? { ...c, ...data, updatedAt: new Date().toISOString() }
                  : c
              ));
              addNotification({
                title: 'Kund uppdaterad',
                message: `${data.name} har uppdaterats`,
                type: 'success'
              });
            } : createCustomer
          }
          onCancel={() => {
            setShowCreateForm(false);
            setEditingCustomer(null);
          }}
        />
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}