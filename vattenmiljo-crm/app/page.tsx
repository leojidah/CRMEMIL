'use client';

import React, { useState } from 'react';
import { Bell, User, FileText, Phone, MapPin, Plus, CheckCircle, Users, Search } from 'lucide-react';

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

const VattenmiljoCRM = () => {
  const [currentUser, setCurrentUser] = useState<string>('salesperson');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState<boolean>(false);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
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
  const createCustomer = () => {
    if (!formData.name || !formData.address || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

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
    setNextId(prev => prev + 1);
  };

  // Update customer status
  const updateStatus = (customerId: number, newStatus: string) => {
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
        } else if (newStatus === 'done') {
          addNotification(`Kund ${customer.name} redo för installation`, 'installer');
        }
        
        return updatedCustomer;
      }
      return customer;
    }));
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

  // Get filtered customers based on user role and status
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

  // Simple, working status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_handled': return 'bg-red-50 border-red-200 text-red-900';
      case 'meeting': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'sales': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'done': return 'bg-green-50 border-green-200 text-green-900';
      case 'archived': return 'bg-gray-50 border-gray-200 text-gray-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  // Status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_handled': return 'bg-red-100 text-red-800 border-red-300';
      case 'meeting': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'sales': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'done': return 'bg-green-100 text-green-800 border-green-300';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Status display names
  const getStatusName = (status: string) => {
    switch (status) {
      case 'not_handled': return 'Ej hanterad';
      case 'meeting': return 'Möte bokat';
      case 'sales': return 'Försäljning';
      case 'done': return 'Redo';
      case 'archived': return 'Arkiverad';
      default: return status;
    }
  };

  const userNotifications = getUserNotifications();
  const filteredCustomers = getSearchFilteredCustomers();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Modern Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Vattenmiljö CRM</h1>
                  <p className="text-xs text-gray-500">Sales Workflow System</p>
                </div>
              </div>
              
              {/* Role Tabs - Clean and Simple */}
              <div className="hidden md:flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentUser('salesperson')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    currentUser === 'salesperson'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  👤 Säljare
                  {customers.filter(c => c.status === 'not_handled' || c.status === 'meeting').length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 text-xs rounded-full">
                      {customers.filter(c => c.status === 'not_handled' || c.status === 'meeting').length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setCurrentUser('inhouse')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    currentUser === 'inhouse'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🏢 Intern
                  {customers.filter(c => c.status === 'sales' || c.status === 'done').length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 text-xs rounded-full">
                      {customers.filter(c => c.status === 'sales' || c.status === 'done').length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setCurrentUser('installer')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    currentUser === 'installer'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🔧 Montör
                  {customers.filter(c => c.status === 'done').length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 text-xs rounded-full">
                      {customers.filter(c => c.status === 'done').length}
                    </span>
                  )}
                </button>
              </div>

              {/* Mobile Role Selector */}
              <div className="md:hidden">
                <select 
                  value={currentUser} 
                  onChange={(e) => setCurrentUser(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white"
                >
                  <option value="salesperson">👤 Säljare</option>
                  <option value="inhouse">🏢 Intern Personal</option>
                  <option value="installer">🔧 Montör</option>
                </select>
              </div>
            </div>
            
            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {userNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {userNotifications.length}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Profile */}
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications Panel */}
        {userNotifications.length > 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-blue-900 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifieringar ({userNotifications.length})
              </h3>
              <button 
                onClick={() => setNotifications([])}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-white px-3 py-1 rounded-lg"
              >
                Rensa alla
              </button>
            </div>
            <div className="space-y-3">
              {userNotifications.map(notification => (
                <div key={notification.id} className="flex items-start justify-between bg-white p-4 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium mb-1">{notification.message}</p>
                    <p className="text-sm text-gray-500">{notification.timestamp}</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                    className="ml-4 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Control Bar */}
        <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Kundhantering</h2>
              <p className="text-gray-600 mt-1">Hantera dina kunder effektivt</p>
            </div>
            
            {currentUser === 'salesperson' && (
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showArchived 
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {showArchived ? '← Visa aktiva' : 'Visa arkiverade →'}
              </button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sök kunder, adresser, telefon..."
              />
            </div>

            {currentUser === 'salesperson' && !showArchived && (
              <button
                onClick={() => setShowNewCustomerForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 font-medium transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Ny kund</span>
              </button>
            )}
          </div>
        </div>

        {/* Customer Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCustomers.map(customer => (
            <div key={customer.id} className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all ${getStatusColor(customer.status)}`}>
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{customer.name}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(customer.status)}`}>
                    {getStatusName(customer.status)}
                  </span>
                </div>
                
                {customer.status === 'not_handled' && (
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-start space-x-3 text-gray-700">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{customer.address}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{customer.phone}</span>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-2 mb-4">
                {customer.files.length > 0 && (
                  <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    {customer.files.length}
                  </div>
                )}
                <div className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                  <User className="h-3 w-3 mr-1" />
                  {customer.createdBy}
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-gray-500 mb-4">
                <div>Skapad: {customer.createdAt}</div>
                {customer.status === 'archived' && customer.archivedAt && (
                  <div>Arkiverad: {customer.archivedAt}</div>
                )}
              </div>

              {/* Files */}
              {customer.files.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Bilagor</h4>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {customer.files.map((file: FileInfo, index: number) => (
                      <div key={index} className="flex items-center text-sm text-gray-600 bg-gray-50 rounded px-2 py-1">
                        <FileText className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes for internal staff */}
              {currentUser === 'inhouse' && customer.status === 'sales' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ytterligare information</label>
                  <textarea
                    value={customer.inHouseNotes}
                    onChange={(e) => updateNotes(customer.id, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Lägg till nödvändig information..."
                  />
                </div>
              )}

              {/* Display notes for installers */}
              {currentUser === 'installer' && customer.inHouseNotes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Installationsanteckningar</h4>
                  <div className="text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    {customer.inHouseNotes}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {currentUser === 'salesperson' && customer.status === 'not_handled' && !showArchived && (
                  <>
                    <button
                      onClick={() => updateStatus(customer.id, 'meeting')}
                      className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                    >
                      Boka möte
                    </button>
                    <button
                      onClick={() => updateStatus(customer.id, 'archived')}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                    >
                      Arkivera
                    </button>
                  </>
                )}
                
                {currentUser === 'salesperson' && customer.status === 'meeting' && !showArchived && (
                  <>
                    <button
                      onClick={() => updateStatus(customer.id, 'sales')}
                      className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      Markera försäljning
                    </button>
                    <button
                      onClick={() => updateStatus(customer.id, 'archived')}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                    >
                      Arkivera
                    </button>
                  </>
                )}
                
                {currentUser === 'inhouse' && customer.status === 'sales' && (
                  <button
                    onClick={() => updateStatus(customer.id, 'done')}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Markera redo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchQuery ? 'Inga kunder hittades' : 'Inga kunder hittades'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchQuery ? (
                <>Prova att söka efter något annat eller <button onClick={() => setSearchQuery('')} className="text-blue-600 hover:text-blue-800 font-medium">rensa sökningen</button>.</>
              ) : (
                <>
                  {currentUser === 'salesperson' && !showArchived && "Skapa ditt första kundkort för att komma igång."}
                  {currentUser === 'salesperson' && showArchived && "Inga arkiverade kunder än."}
                  {currentUser === 'inhouse' && "Inga försäljningar väntar på bearbetning."}
                  {currentUser === 'installer' && "Inga installationer redo."}
                </>
              )}
            </p>
            {currentUser === 'salesperson' && !showArchived && !searchQuery && (
              <button
                onClick={() => setShowNewCustomerForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Skapa första kunden
              </button>
            )}
          </div>
        )}

        {/* Form Modal */}
        {showNewCustomerForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Skapa ny kund</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Namn *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Kundnamn"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adress *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Installationsadress"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Telefonnummer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bilagor</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm"
                  />
                  {formData.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.files.map((file: FileInfo, index: number) => (
                        <div key={index} className="flex items-center text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="truncate">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowNewCustomerForm(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Avbryt
                </button>
                <button
                  onClick={createCustomer}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Skapa kund
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