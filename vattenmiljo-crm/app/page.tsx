'use client';

import React, { useState } from 'react';
import { Bell, User, FileText, Phone, MapPin, Plus, CheckCircle, Users } from 'lucide-react';

const SalesWorkflowSystem = () => {
  const [currentUser, setCurrentUser] = useState('salesperson');
  const [customers, setCustomers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    files: [] as any[]
  });

  // Add notification
  const addNotification = (message: string, targetUser: string) => {
    const notification = {
      id: Date.now(),
      message,
      targetUser,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    setNotifications(prev => [...prev, notification]);
  };

  // Create new customer card
  const createCustomer = () => {
    if (!formData.name || !formData.address || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    const newCustomer = {
      id: Date.now(),
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
          addNotification(`New sale from ${customer.name} - needs in-house processing`, 'inhouse');
        } else if (newStatus === 'done') {
          addNotification(`Customer ${customer.name} ready for installation`, 'installer');
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
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files.map(file => ({ name: file.name, type: file.type }))]
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

  // Get user notifications
  const getUserNotifications = () => {
    return notifications.filter(n => n.targetUser === currentUser);
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_handled': return 'bg-red-100 text-red-800';
      case 'meeting': return 'bg-yellow-100 text-yellow-800';
      case 'sales': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Status display names
  const getStatusName = (status: string) => {
    switch (status) {
      case 'not_handled': return 'Not Handled';
      case 'meeting': return 'Meeting';
      case 'sales': return 'Sales';
      case 'done': return 'Done';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  const userNotifications = getUserNotifications();
  const filteredCustomers = getFilteredCustomers();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Sales Workflow System</h1>
            
            {/* User Role Selector */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <select 
                  value={currentUser} 
                  onChange={(e) => setCurrentUser(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="salesperson">Salesperson</option>
                  <option value="inhouse">In-House Staff</option>
                  <option value="installer">Installer</option>
                </select>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-500" />
                {userNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {userNotifications.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications Panel */}
        {userNotifications.length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications ({userNotifications.length})
            </h3>
            <div className="space-y-2">
              {userNotifications.map(notification => (
                <div key={notification.id} className="flex items-center justify-between bg-white p-3 rounded border">
                  <span className="text-sm text-gray-700">{notification.message}</span>
                  <span className="text-xs text-gray-500">{notification.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentUser === 'salesperson' && (showArchived ? 'Archived Customers' : 'Active Customers')}
              {currentUser === 'inhouse' && 'Sales Processing'}
              {currentUser === 'installer' && 'Installation Queue'}
            </h2>
            
            {currentUser === 'salesperson' && (
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  showArchived 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {showArchived ? 'Show Active' : 'Show Archived'}
              </button>
            )}
          </div>
          
          {currentUser === 'salesperson' && !showArchived && (
            <button
              onClick={() => setShowNewCustomerForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>New Customer</span>
            </button>
          )}
        </div>

        {/* New Customer Form Modal */}
        {showNewCustomerForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Create New Customer Card</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Customer name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Installation address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  {formData.files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.files.map((file, index) => (
                        <div key={index} className="text-sm text-gray-600 flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowNewCustomerForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={createCustomer}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Customer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-white rounded-lg shadow border p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                  {getStatusName(customer.status)}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {customer.address}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {customer.phone}
                </div>
                <div className="text-xs text-gray-500">
                  Created: {customer.createdAt}
                </div>
              </div>

              {/* Files */}
              {customer.files.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
                  <div className="space-y-1">
                    {customer.files.map((file: any, index: number) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <FileText className="h-4 w-4 mr-2" />
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* In-house notes for in-house staff */}
              {currentUser === 'inhouse' && customer.status === 'sales' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                  <textarea
                    value={customer.inHouseNotes}
                    onChange={(e) => updateNotes(customer.id, e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Add any necessary information..."
                  />
                </div>
              )}

              {/* Display notes for installers */}
              {currentUser === 'installer' && customer.inHouseNotes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Installation Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {customer.inHouseNotes}
                  </p>
                </div>
              )}

              {/* Display archived date for archived customers */}
              {customer.status === 'archived' && customer.archivedAt && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500">
                    Archived: {customer.archivedAt}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {currentUser === 'salesperson' && customer.status === 'not_handled' && !showArchived && (
                  <>
                    <button
                      onClick={() => updateStatus(customer.id, 'meeting')}
                      className="flex-1 bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700"
                    >
                      Schedule Meeting
                    </button>
                    <button
                      onClick={() => updateStatus(customer.id, 'archived')}
                      className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                      title="Archive (No Sale)"
                    >
                      Archive
                    </button>
                  </>
                )}
                
                {currentUser === 'salesperson' && customer.status === 'meeting' && !showArchived && (
                  <>
                    <button
                      onClick={() => updateStatus(customer.id, 'sales')}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                    >
                      Mark as Sale
                    </button>
                    <button
                      onClick={() => updateStatus(customer.id, 'archived')}
                      className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                      title="Archive (No Sale)"
                    >
                      Archive
                    </button>
                  </>
                )}
                
                {currentUser === 'inhouse' && customer.status === 'sales' && (
                  <button
                    onClick={() => updateStatus(customer.id, 'done')}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-600">
              {currentUser === 'salesperson' && !showArchived && "Create your first customer card to get started."}
              {currentUser === 'salesperson' && showArchived && "No archived customers yet."}
              {currentUser === 'inhouse' && "No sales waiting for processing."}
              {currentUser === 'installer' && "No installations ready."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  return <SalesWorkflowSystem />;
}