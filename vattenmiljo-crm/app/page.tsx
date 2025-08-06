'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, User, FileText, Phone, MapPin, Plus, CheckCircle, Users, Search,
  Settings, BarChart3, Calendar, Clock, Archive, Home, UserCheck, Wrench,
  TrendingUp, Target, Activity, Award, Eye, Edit, Trash2, MoreHorizontal,
  X, Check, AlertCircle, Loader2, Zap, Star, ChevronRight
} from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  address: string;
  phone: string;
  files: FileInfo[];
  status: string;
  createdBy: string;
  createdAt: string;
  notes: string;
  inHouseNotes: string;
  archivedAt?: string;
}

interface Notification {
  id: number;
  message: string;
  targetUser: string;
  timestamp: string;
  read: boolean;
}

interface FileInfo {
  name: string;
  type: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const VattenmiljoCRM = () => {
  const [currentUser, setCurrentUser] = useState<string>('salesperson');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState<boolean>(false);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Counter for unique IDs
  const [nextId, setNextId] = useState<number>(1);
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    phone: string;
    files: FileInfo[];
  }>({
    name: '',
    address: '',
    phone: '',
    files: []
  });

  // Toast functionality
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const toast: Toast = {
      id: Date.now(),
      message,
      type
    };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 4000);
  };

  // Add notification
  const addNotification = (message: string, targetUser: string) => {
    const notification: Notification = {
      id: nextId,
      message,
      targetUser,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    setNotifications(prev => [...prev, notification]);
    setNextId(prev => prev + 1);
  };

  // Create new customer card
  const createCustomer = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      showToast('Vänligen fyll i alla obligatoriska fält', 'error');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newCustomer: Customer = {
      id: nextId,
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      files: formData.files,
      status: 'not_handled',
      createdBy: 'salesperson',
      createdAt: new Date().toLocaleString(),
      notes: '',
      inHouseNotes: ''
    };

    setCustomers(prev => [...prev, newCustomer]);
    setFormData({ name: '', address: '', phone: '', files: [] });
    setShowNewCustomerForm(false);
    setIsLoading(false);
    setNextId(prev => prev + 1);
    
    showToast('Ny kund skapad framgångsrikt! 🎉');
  };

  // Update customer status
  const updateStatus = async (customerId: number, newStatus: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setCustomers(prev => prev.map(customer => {
      if (customer.id === customerId) {
        const updatedCustomer = { 
          ...customer, 
          status: newStatus,
          archivedAt: newStatus === 'archived' ? new Date().toLocaleString() : customer.archivedAt
        };
        
        // Trigger notifications based on status change
        if (newStatus === 'sales') {
          addNotification(`Ny försäljning från ${customer.name} - behöver intern bearbetning`, 'inhouse');
          showToast(`Kund ${customer.name} markerad som försäljning`, 'success');
        } else if (newStatus === 'done') {
          addNotification(`Kund ${customer.name} redo för installation`, 'installer');
          showToast(`Kund ${customer.name} redo för installation`, 'success');
        } else if (newStatus === 'meeting') {
          showToast(`Möte bokat med ${customer.name}`, 'info');
        } else if (newStatus === 'archived') {
          showToast(`Kund ${customer.name} arkiverad`, 'info');
        }
        
        return updatedCustomer;
      }
      return customer;
    }));
    
    setIsLoading(false);
  };

  // Update customer notes
  const updateNotes = (customerId: number, notes: string, field = 'inHouseNotes') => {
    setCustomers(prev => prev.map(customer => 
      customer.id === customerId 
        ? { ...customer, [field]: notes }
        : customer
    ));
  };

  // Simulate file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: FileInfo[] = files.map(file => ({ name: file.name, type: file.type }));
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  // Get filtered customers
  const getFilteredCustomers = () => {
    switch (currentUser) {
      case 'salesperson':
        if (showArchived) {
          return customers.filter(c => c.status === 'archived');
        }
        return customers.filter(c => c.status === 'not_handled' || c.status === 'meeting');
      case 'inhouse':
        return customers.filter(c => c.status === 'sales' || c.status === 'done');
      case 'installer':
        return customers.filter(c => c.status === 'done');
      default:
        return customers;
    }
  };

  // Get search filtered customers
  const getSearchFilteredCustomers = () => {
    const baseFiltered = getFilteredCustomers();
    
    if (!searchQuery.trim()) {
      return baseFiltered;
    }
    
    return baseFiltered.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Get user notifications
  const getUserNotifications = () => {
    return notifications.filter(n => n.targetUser === currentUser);
  };

  // Get KPIs based on current user
  const getKPIs = () => {
    const totalCustomers = customers.length;
    const thisWeekCustomers = customers.filter(c => {
      const createdDate = new Date(c.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return createdDate > weekAgo;
    }).length;

    const newCustomers = customers.filter(c => c.status === 'not_handled').length;
    
    const conversionRate = totalCustomers > 0 
      ? Math.round((customers.filter(c => c.status === 'sales' || c.status === 'done').length / totalCustomers) * 100)
      : 0;

    switch (currentUser) {
      case 'salesperson':
        return [
          {
            title: 'Totala kunder',
            value: totalCustomers.toString(),
            subtitle: 'Alla registrerade kunder',
            icon: Users,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50 border-blue-200',
            trend: '+12%'
          },
          {
            title: 'Denna vecka',
            value: thisWeekCustomers.toString(),
            subtitle: 'Nya kunder senaste veckan',
            icon: TrendingUp,
            color: 'bg-green-500',
            bgColor: 'bg-green-50 border-green-200',
            trend: '+25%'
          },
          {
            title: 'Ej hanterade',
            value: newCustomers.toString(),
            subtitle: 'Kräver din uppmärksamhet',
            icon: AlertCircle,
            color: 'bg-red-500',
            bgColor: 'bg-red-50 border-red-200',
            trend: newCustomers > 0 ? 'Hög prioritet' : 'Allt klart!'
          },
          {
            title: 'Konvertering',
            value: `${conversionRate}%`,
            subtitle: 'Leads till försäljning',
            icon: Target,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50 border-purple-200',
            trend: conversionRate > 50 ? 'Utmärkt!' : 'Förbättring möjlig'
          }
        ];
      case 'inhouse':
        const salesPending = customers.filter(c => c.status === 'sales').length;
        const readyForInstall = customers.filter(c => c.status === 'done').length;
        return [
          {
            title: 'Pågående försäljningar',
            value: salesPending.toString(),
            subtitle: 'Behöver bearbetning',
            icon: Activity,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50 border-blue-200',
            trend: salesPending > 0 ? 'Aktiva ärenden' : 'Inga väntande'
          },
          {
            title: 'Redo för installation',
            value: readyForInstall.toString(),
            subtitle: 'Färdigbearbetade kunder',
            icon: CheckCircle,
            color: 'bg-green-500',
            bgColor: 'bg-green-50 border-green-200',
            trend: 'Färdiga att skicka'
          }
        ];
      case 'installer':
        const installationReady = customers.filter(c => c.status === 'done').length;
        return [
          {
            title: 'Installation redo',
            value: installationReady.toString(),
            subtitle: 'Kunder redo för installation',
            icon: Wrench,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50 border-orange-200',
            trend: installationReady > 0 ? 'Installation väntande' : 'Inget schemalagt'
          }
        ];
      default:
        return [];
    }
  };

  // Get role info
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'salesperson':
        return { 
          icon: UserCheck, 
          label: 'Säljare', 
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          activeColor: 'bg-blue-600 text-white',
          name: 'Magnus Andersson'
        };
      case 'inhouse':
        return { 
          icon: Home, 
          label: 'Intern Personal', 
          color: 'text-green-600 bg-green-50 border-green-200',
          activeColor: 'bg-green-600 text-white',
          name: 'Anna Johansson'
        };
      case 'installer':
        return { 
          icon: Wrench, 
          label: 'Montör', 
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          activeColor: 'bg-orange-600 text-white',
          name: 'Erik Larsson'
        };
      default:
        return { 
          icon: User, 
          label: role, 
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          activeColor: 'bg-gray-600 text-white',
          name: 'Användare'
        };
    }
  };

  // Status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'not_handled':
        return {
          label: 'Ej hanterad',
          color: 'bg-red-50 border-red-200 text-red-800',
          badge: 'bg-red-100 text-red-700 border-red-200',
          indicator: 'bg-red-500'
        };
      case 'meeting':
        return {
          label: 'Möte bokat',
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          indicator: 'bg-yellow-500'
        };
      case 'sales':
        return {
          label: 'Försäljning',
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
          indicator: 'bg-blue-500'
        };
      case 'done':
        return {
          label: 'Redo',
          color: 'bg-green-50 border-green-200 text-green-800',
          badge: 'bg-green-100 text-green-700 border-green-200',
          indicator: 'bg-green-500'
        };
      case 'archived':
        return {
          label: 'Arkiverad',
          color: 'bg-gray-50 border-gray-200 text-gray-800',
          badge: 'bg-gray-100 text-gray-700 border-gray-200',
          indicator: 'bg-gray-500'
        };
      default:
        return {
          label: status,
          color: 'bg-gray-50 border-gray-200 text-gray-800',
          badge: 'bg-gray-100 text-gray-700 border-gray-200',
          indicator: 'bg-gray-500'
        };
    }
  };

  const userNotifications = getUserNotifications();
  const filteredCustomers = getSearchFilteredCustomers();
  const currentUserInfo = getRoleInfo(currentUser);
  const kpis = getKPIs();

  // Loading skeleton component
  const SkeletonCard = () => (
    <div className="card-modern animate-pulse">
      <div className="h-4 bg-gray-200 rounded mb-4"></div>
      <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`
            flex items-center space-x-3 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm
            animate-slideInRight border-2 max-w-sm
            ${toast.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800' : 
              toast.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' :
              'bg-blue-50/90 border-blue-200 text-blue-800'}
          `}>
            {toast.type === 'success' && <Check size={20} className="text-green-600" />}
            {toast.type === 'error' && <X size={20} className="text-red-600" />}
            {toast.type === 'info' && <AlertCircle size={20} className="text-blue-600" />}
            <span className="font-medium">{toast.message}</span>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-current opacity-60 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-8">
              {/* Modern Logo */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Vattenmiljö CRM</h1>
                  <p className="text-sm text-slate-600 font-medium">Sales Workflow System</p>
                </div>
              </div>
              
              {/* Modern Role Tabs */}
              <div className="hidden md:flex space-x-2 bg-slate-100/80 rounded-xl p-2">
                {['salesperson', 'inhouse', 'installer'].map((role) => {
                  const roleInfo = getRoleInfo(role);
                  const Icon = roleInfo.icon;
                  const roleCustomers = customers.filter(c => {
                    switch (role) {
                      case 'salesperson':
                        return c.status === 'not_handled' || c.status === 'meeting';
                      case 'inhouse':
                        return c.status === 'sales' || c.status === 'done';
                      case 'installer':
                        return c.status === 'done';
                      default:
                        return false;
                    }
                  });

                  return (
                    <button
                      key={role}
                      onClick={() => setCurrentUser(role)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        currentUser === role
                          ? roleInfo.activeColor + ' shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{roleInfo.label}</span>
                      {roleCustomers.length > 0 && (
                        <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                          currentUser === role 
                            ? 'bg-white/20 text-white' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {roleCustomers.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Role Selector */}
              <div className="md:hidden">
                <select 
                  value={currentUser} 
                  onChange={(e) => setCurrentUser(e.target.value)}
                  className="input-modern text-sm"
                >
                  <option value="salesperson">👤 Säljare</option>
                  <option value="inhouse">🏢 Intern Personal</option>
                  <option value="installer">🔧 Montör</option>
                </select>
              </div>
            </div>
            
            {/* Modern Right Side */}
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="hidden md:flex space-x-1 bg-slate-100/80 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'cards' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                >
                  <Users size={18} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                >
                  <BarChart3 size={18} />
                </button>
              </div>

              {/* Quick Actions */}
              <button className="p-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-all duration-200">
                <Settings size={20} />
              </button>
              
              {/* Modern Notifications */}
              <div className="relative">
                <button className="p-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-all duration-200">
                  <Bell size={20} />
                  {userNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {userNotifications.length}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Modern Profile */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <User size={20} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Welcome & KPIs */}
        <div className="mb-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${currentUserInfo.color}`}>
                  <currentUserInfo.icon size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Välkommen tillbaka, {currentUserInfo.name}! 👋</h1>
                  <p className="text-lg text-slate-600 mt-1">Här är en överblick av dina aktiviteter</p>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200">
                <Zap size={20} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Aktiv dashboard</span>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className={`grid gap-6 ${kpis.length === 4 ? 'md:grid-cols-2 xl:grid-cols-4' : 
            kpis.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <div key={index} className={`card-modern ${kpi.bgColor} border-2 relative overflow-hidden group`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${kpi.color} rounded-xl shadow-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    {kpi.title === 'Ej hanterade' && parseInt(kpi.value) > 0 && (
                      <div className="absolute top-4 right-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{kpi.title}</h3>
                    <div className="flex items-end space-x-2">
                      <span className="text-4xl font-black text-slate-900">{kpi.value}</span>
                      {kpi.title === 'Konvertering' && (
                        <div className="flex-1 bg-slate-200 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full ${kpi.color} transition-all duration-1000`}
                            style={{ width: kpi.value }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 font-medium">{kpi.subtitle}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-current/10">
                      <span className="text-xs font-bold text-current/80">{kpi.trend}</span>
                      <ChevronRight size={16} className="text-current/60 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modern Notifications Panel */}
        {userNotifications.length > 0 && (
          <div className="mb-8 card-modern bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Bell size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">Notifieringar</h3>
                  <p className="text-blue-700">{userNotifications.length} nya meddelanden</p>
                </div>
              </div>
              <button 
                onClick={() => setNotifications([])}
                className="btn-secondary !px-4 !py-2 text-sm"
              >
                Rensa alla
              </button>
            </div>
            <div className="space-y-3">
              {userNotifications.map(notification => (
                <div key={notification.id} className="flex items-start justify-between bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50 hover:bg-white/90 transition-all">
                  <div className="flex-1">
                    <p className="text-slate-800 font-semibold mb-1">{notification.message}</p>
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock size={16} className="mr-1" />
                      {notification.timestamp}
                    </div>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                    className="ml-4 text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 transition-all duration-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modern Control Bar */}
        <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Kundhantering</h2>
              <p className="text-slate-600 mt-2 font-medium">Hantera dina kunder effektivt</p>
            </div>
            
            {currentUser === 'salesperson' && (
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  showArchived 
                    ? 'btn-secondary' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Archive size={16} />
                <span>{showArchived ? 'Visa aktiva' : 'Visa arkiverade'}</span>
              </button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
            {/* Modern Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-modern w-full sm:w-80 pl-12 !py-4"
                placeholder="Sök kunder, adresser, telefon..."
              />
            </div>

            {currentUser === 'salesperson' && !showArchived && (
              <button
                onClick={() => setShowNewCustomerForm(true)}
                className="btn-primary flex items-center space-x-2 !px-6 !py-4"
              >
                <Plus size={20} />
                <span>Ny kund</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : viewMode === 'cards' ? (
          /* Modern Customer Cards */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCustomers.map(customer => {
              const statusConfig = getStatusConfig(customer.status);
              
              return (
                <div key={customer.id} className={`card-modern border-2 ${statusConfig.color} relative overflow-hidden`}>
                  {/* Status Indicator */}
                  {customer.status === 'not_handled' && (
                    <div className="absolute top-4 right-4">
                      <div className={`w-3 h-3 ${statusConfig.indicator} rounded-full animate-pulse`}></div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-1">{customer.name}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border-2 ${statusConfig.badge}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start space-x-3 text-slate-700">
                      <div className="p-1 bg-slate-100 rounded-md">
                        <MapPin size={16} />
                      </div>
                      <span className="text-sm font-medium line-clamp-2">{customer.address}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-700">
                      <div className="p-1 bg-slate-100 rounded-md">
                        <Phone size={16} />
                      </div>
                      <span className="text-sm font-bold">{customer.phone}</span>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {customer.files.length > 0 && (
                      <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-xs font-semibold">
                        <FileText size={14} className="mr-1" />
                        {customer.files.length} filer
                      </div>
                    )}
                    <div className="flex items-center bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-semibold">
                      <User size={14} className="mr-1" />
                      {customer.createdBy}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      Skapad: {customer.createdAt}
                    </div>
                    {customer.status === 'archived' && customer.archivedAt && (
                      <div className="flex items-center mt-1">
                        <Archive size={12} className="mr-1" />
                        Arkiverad: {customer.archivedAt}
                      </div>
                    )}
                  </div>

                  {/* Notes for internal staff */}
                  {currentUser === 'inhouse' && customer.status === 'sales' && (
                    <div className="mb-6">
                      <label className="label-modern">Ytterligare information</label>
                      <textarea
                        value={customer.inHouseNotes}
                        onChange={(e) => updateNotes(customer.id, e.target.value)}
                        className="input-modern !py-3 text-sm resize-none"
                        rows={3}
                        placeholder="Lägg till nödvändig information..."
                      />
                    </div>
                  )}

                  {/* Display notes for installers */}
                  {currentUser === 'installer' && customer.inHouseNotes && (
                    <div className="mb-6">
                      <h4 className="label-modern !mb-3">Installationsanteckningar</h4>
                      <div className="text-sm text-blue-800 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 font-medium">
                        {customer.inHouseNotes}
                      </div>
                    </div>
                  )}

                  {/* Modern Action Buttons */}
                  <div className="flex space-x-2">
                    {currentUser === 'salesperson' && customer.status === 'not_handled' && !showArchived && (
                      <>
                        <button
                          onClick={() => updateStatus(customer.id, 'meeting')}
                          className="btn-warning flex-1 !px-3 !py-2 text-sm"
                        >
                          Boka möte
                        </button>
                        <button
                          onClick={() => updateStatus(customer.id, 'archived')}
                          className="!px-3 !py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-all duration-200"
                        >
                          Arkivera
                        </button>
                      </>
                    )}
                    
                    {currentUser === 'salesperson' && customer.status === 'meeting' && !showArchived && (
                      <>
                        <button
                          onClick={() => updateStatus(customer.id, 'sales')}
                          className="btn-success flex-1 !px-3 !py-2 text-sm"
                        >
                          Försäljning
                        </button>
                        <button
                          onClick={() => updateStatus(customer.id, 'archived')}
                          className="!px-3 !py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-all duration-200"
                        >
                          Arkivera
                        </button>
                      </>
                    )}
                    
                    {currentUser === 'inhouse' && customer.status === 'sales' && (
                      <button
                        onClick={() => updateStatus(customer.id, 'done')}
                        className="btn-primary flex-1 !px-3 !py-2 text-sm flex items-center justify-center"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Markera redo
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Modern Table View */
          <div className="card-modern !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 font-bold text-slate-900 text-sm uppercase tracking-wide">Kund</th>
                    <th className="text-left px-6 py-4 font-bold text-slate-900 text-sm uppercase tracking-wide">Kontakt</th>
                    <th className="text-left px-6 py-4 font-bold text-slate-900 text-sm uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-4 font-bold text-slate-900 text-sm uppercase tracking-wide">Skapad</th>
                    <th className="text-left px-6 py-4 font-bold text-slate-900 text-sm uppercase tracking-wide">Åtgärder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCustomers.map((customer, index) => {
                    const statusConfig = getStatusConfig(customer.status);
                    return (
                      <tr 
                        key={customer.id}
                        className={`
                          hover:bg-slate-50 transition-colors group
                          ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}
                        `}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                              <User size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{customer.name}</div>
                              <div className="text-sm text-slate-500 line-clamp-1">{customer.address}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-slate-700">
                            <Phone size={16} className="mr-2 text-slate-400" />
                            {customer.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${statusConfig.badge}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600">{customer.createdAt}</div>
                          <div className="text-xs text-slate-400">av {customer.createdBy}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100">
                              <Eye size={16} />
                            </button>
                            <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100">
                              <Edit size={16} />
                            </button>
                            <button className="p-2 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modern Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
              <Users size={48} className="text-slate-400 relative z-10" />
              <Star size={20} className="absolute top-3 right-3 text-yellow-400 animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              {searchQuery ? 'Inga matchande kunder' : 'Inga kunder än'}
            </h3>
            <p className="text-slate-600 max-w-lg mx-auto mb-8 text-lg leading-relaxed">
              {searchQuery ? (
                <>Försök med en annan sökning eller <button onClick={() => setSearchQuery('')} className="text-blue-600 hover:text-blue-800 font-semibold underline">visa alla kunder</button></>
              ) : (
                <>
                  {currentUser === 'salesperson' && !showArchived && "Skapa ditt första kundkort och börja bygga din kunddatabas"}
                  {currentUser === 'salesperson' && showArchived && "Inga arkiverade kunder än - de kommer visas här när du arkiverar kunder"}
                  {currentUser === 'inhouse' && "Inga försäljningar väntar på bearbetning just nu"}
                  {currentUser === 'installer' && "Inga installationer redo än - de kommer visas här när de är klara"}
                </>
              )}
            </p>
            {currentUser === 'salesperson' && !showArchived && !searchQuery && (
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={() => setShowNewCustomerForm(true)}
                  className="btn-primary !px-8 !py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <Plus size={24} className="mr-2" />
                  Skapa din första kund
                </button>
                <p className="text-sm text-slate-500">Det tar bara en minut att komma igång</p>
              </div>
            )}
          </div>
        )}

        {/* Modern Form Modal */}
        {showNewCustomerForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-screen overflow-y-auto animate-fadeInUp">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Skapa ny kund</h3>
                  <p className="text-slate-600 font-medium">Fyll i kundinformationen nedan</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="label-modern">Kundnamn *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input-modern"
                    placeholder="För- och efternamn"
                  />
                </div>
                
                <div>
                  <label className="label-modern">Installationsadress *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="input-modern"
                    placeholder="Fullständig adress inklusive postnummer"
                  />
                </div>
                
                <div>
                  <label className="label-modern">Telefonnummer *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="input-modern"
                    placeholder="Mobilnummer eller telefonnummer"
                  />
                </div>
                
                <div>
                  <label className="label-modern">Bilagor</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="input-modern file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-all file:duration-200"
                  />
                  {formData.files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Valda filer:</p>
                      {formData.files.map((file: FileInfo, index: number) => (
                        <div key={index} className="flex items-center text-sm text-slate-600 bg-slate-50 rounded-lg px-4 py-3">
                          <FileText size={18} className="mr-3 text-blue-600" />
                          <span className="truncate font-medium">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-10 pt-6 border-t border-slate-200">
                <button
                  onClick={() => setShowNewCustomerForm(false)}
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  Avbryt
                </button>
                <button
                  onClick={createCustomer}
                  className="btn-primary flex items-center space-x-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Skapar...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      <span>Skapa kund</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  return <VattenmiljoCRM />;
}