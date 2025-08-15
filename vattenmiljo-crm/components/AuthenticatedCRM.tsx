'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Calendar, TrendingUp, CheckCircle2, Plus, Search, X, Phone, Mail, MapPin, AlertCircle, LogOut, LayoutGrid, Columns } from 'lucide-react'
import { Customer, CustomerStatus } from '@/lib/types'
import KanbanBoard from './kanban/KanbanBoard'

interface AuthenticatedCRMProps {
  session: {
    user: {
      id: string
      email: string
      name: string
      role: string
      isActive: boolean
    }
  }
}

export default function AuthenticatedCRM({ session }: AuthenticatedCRMProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all')
  const [notifications, setNotifications] = useState<{ id: string; type: string; title: string; message: string }[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('kanban')

  const currentUser = session.user

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/customers?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setCustomers(data.customers || [])
      } else {
        setError(data.error || 'Failed to fetch customers')
      }
    } catch (error) {
      setError('Failed to fetch customers')
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update customer status
  const updateCustomerStatus = async (customerId: string, newStatus: CustomerStatus) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()
      if (response.ok) {
        setCustomers(prev => prev.map(customer => 
          customer.id === customerId 
            ? { ...customer, status: newStatus, updatedAt: new Date().toISOString() }
            : customer
        ))
        addNotification({
          title: 'Status uppdaterad',
          message: data.message,
          type: 'success'
        })
      } else {
        addNotification({
          title: 'Fel',
          message: data.error,
          type: 'error'
        })
      }
    } catch (err) {
      console.error('Error updating status:', err)
      addNotification({
        title: 'Fel',
        message: 'Kunde inte uppdatera status',
        type: 'error'
      })
    }
  }

  // createCustomer function removed - will be implemented in CustomerModal

  // Add notification
  const addNotification = (notification: { title: string; message: string; type: string }) => {
    const id = Date.now().toString()
    setNotifications(prev => [{ ...notification, id }, ...prev])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  // Load customers on mount and when filters change
  useEffect(() => {
    fetchCustomers()
  }, [statusFilter, searchTerm])

  // Filter customers for display
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const STATUS_CONFIG = {
    not_handled: { label: 'Ej hanterad', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    meeting: { label: 'Möte bokat', color: 'bg-yellow-100 text-yellow-800', icon: Calendar },
    sales: { label: 'Försäljning', color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
    done: { label: 'Klar för installation', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    archived: { label: 'Arkiverad', color: 'bg-gray-100 text-gray-800', icon: CheckCircle2 }
  }

  const PRIORITY_CONFIG = {
    low: { label: 'Låg', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    high: { label: 'Hög', color: 'bg-red-100 text-red-800' }
  }

  // Customer Card Component
  const CustomerCard = ({ customer }: { customer: Customer }) => {
    const statusConfig = STATUS_CONFIG[customer.status]
    const StatusIcon = statusConfig.icon

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

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              let nextStatus: CustomerStatus = customer.status
              if (currentUser.role === 'salesperson') {
                if (customer.status === 'not_handled') nextStatus = 'meeting'
                else if (customer.status === 'meeting') nextStatus = 'sales'
              } else if (currentUser.role === 'internal' && customer.status === 'sales') {
                nextStatus = 'done'
              }
              
              if (nextStatus !== customer.status) {
                updateCustomerStatus(customer.id, nextStatus)
              }
            }}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            {currentUser.role === 'salesperson' && customer.status === 'not_handled' && 'Boka möte'}
            {currentUser.role === 'salesperson' && customer.status === 'meeting' && 'Markera som såld'}
            {currentUser.role === 'internal' && customer.status === 'sales' && 'Markera som klar'}
            {currentUser.role === 'installer' && customer.status === 'done' && 'Markera installation klar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CSS Test Component */}
      <div className="fixed top-4 left-4 bg-purple-500 text-white p-2 rounded text-sm z-50">
        Dashboard CSS: <span className="bg-yellow-500 text-black px-2 ml-1 rounded">Test</span>
      </div>
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Vattenmiljö CRM</h1>
                <p className="text-xs text-gray-500">
                  {currentUser.role === 'salesperson' && 'Säljare'}
                  {currentUser.role === 'internal' && 'Intern Personal'}
                  {currentUser.role === 'installer' && 'Montör'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* User info and logout */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {currentUser.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    window.location.href = '/login'
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logga ut"
                >
                  <LogOut className="w-5 h-5" />
                </button>
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

            {viewMode === 'grid' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Alla statusar</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            )}

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'kanban' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Columns className="w-4 h-4" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Rutnät
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            Kanban vy aktiverad
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Arkiverade</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'archived').length}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Laddar kunder...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {!loading && !error && (
          <>
            {viewMode === 'kanban' ? (
              <div className="h-[calc(100vh-16rem)]">
                <KanbanBoard session={session} />
              </div>
            ) : (
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
            )}
          </>
        )}
      </main>

      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`border-l-4 p-4 rounded-r-lg shadow-lg animate-slide-in-right ${
              notification.type === 'success' ? 'border-green-500 bg-green-50 text-green-800' :
              notification.type === 'error' ? 'border-red-500 bg-red-50 text-red-800' :
              'border-blue-500 bg-blue-50 text-blue-800'
            }`}
          >
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
        ))}
      </div>

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
  )
}