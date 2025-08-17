'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { Customer, CustomerStatus, UserRole, KanbanColumn } from '@/lib/types'
import KanbanColumnComponent from './KanbanColumn'
import CustomerCard from './CustomerCard'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

interface UserProfile {
  id: string
  email: string
  name: string
  role: 'SALESPERSON' | 'INHOUSE' | 'INSTALLER' | 'ADMIN'
  created_at: string
  updated_at: string
}

interface KanbanBoardProps {
  userProfile: UserProfile
}

// Definiera kolumner baserat på din specifikation
const KANBAN_COLUMNS: KanbanColumn[] = [
  // Säljare-kolumner
  {
    id: 'not_handled',
    title: 'Inte hanterat',
    description: 'Nya leads som behöver kontakt',
    color: 'bg-red-50 border-red-200',
    order: 1,
    visibleToRoles: ['salesperson', 'admin']
  },
  {
    id: 'meeting_booked',
    title: 'Möte bokat',
    description: 'Möte schemalagt med kund',
    color: 'bg-blue-50 border-blue-200',
    order: 2,
    visibleToRoles: ['salesperson', 'admin']
  },
  {
    id: 'quotation_stage',
    title: 'Förslag skickat',
    description: 'Offert/förslag sänt till kund',
    color: 'bg-yellow-50 border-yellow-200',
    order: 3,
    visibleToRoles: ['salesperson', 'admin']
  },
  {
    id: 'extended_water_test',
    title: 'Utökat vattenprov',
    description: 'Vattenprov pågår',
    color: 'bg-purple-50 border-purple-200',
    order: 4,
    visibleToRoles: ['salesperson', 'admin']
  },
  // In-house kolumner
  {
    id: 'sold',
    title: 'Redo att faktureras',
    description: 'Kund såld, behöver faktureras',
    color: 'bg-green-50 border-green-200',
    order: 5,
    visibleToRoles: ['internal', 'admin']
  },
  // Montör kolumner
  {
    id: 'ready_for_installation',
    title: 'Redo att installeras',
    description: 'Klar för installation',
    color: 'bg-indigo-50 border-indigo-200',
    order: 6,
    visibleToRoles: ['installer', 'internal', 'admin']
  },
  {
    id: 'installation_complete',
    title: 'Klar',
    description: 'Installation genomförd',
    color: 'bg-gray-50 border-gray-200',
    order: 7,
    visibleToRoles: ['installer', 'internal', 'admin']
  }
]

export default function KanbanBoard({ userProfile }: KanbanBoardProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  // Get access token for Authorization header approach
  const { accessToken, loading: authLoading } = useSupabaseAuth()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Konvertera användarroll till vårt format
  const userRole = useMemo(() => {
    switch (userProfile.role) {
      case 'SALESPERSON': return 'salesperson'
      case 'INHOUSE': return 'internal'
      case 'INSTALLER': return 'installer'
      case 'ADMIN': return 'admin'
      default: return 'salesperson'
    }
  }, [userProfile.role])

  // DEBUG: Auth state logging
  useEffect(() => {
    console.log('🔍 DEBUG KanbanBoard: Component mounted/updated')
    console.log('👤 DEBUG KanbanBoard: UserProfile:', userProfile)
    console.log('🎭 DEBUG KanbanBoard: UserRole (converted):', userRole)
    console.log('🍪 DEBUG KanbanBoard: Document cookies:', document.cookie)
    
    // Check if we have Supabase auth state
    const supabaseAuth = localStorage.getItem('sb-wyxqyqlnzkgbigsfglou-auth-token')
    console.log('🔐 DEBUG KanbanBoard: Supabase auth token in localStorage:', supabaseAuth ? 'Present' : 'Missing')
    
    if (supabaseAuth) {
      try {
        const parsed = JSON.parse(supabaseAuth)
        console.log('🔑 DEBUG KanbanBoard: Auth token details:', {
          hasAccessToken: !!parsed.access_token,
          hasRefreshToken: !!parsed.refresh_token,
          expiresAt: parsed.expires_at,
          userEmail: parsed.user?.email
        })
      } catch (e) {
        console.log('❌ DEBUG KanbanBoard: Failed to parse auth token:', e)
      }
    }
  }, [userProfile, userRole])

  // Filtrera kolumner baserat på användarroll
  const visibleColumns = useMemo(() => {
    return KANBAN_COLUMNS.filter(column => 
      column.visibleToRoles.includes(userRole as UserRole)
    ).sort((a, b) => a.order - b.order)
  }, [userRole])

  // Reusable function to build authenticated headers
  const buildAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Add Authorization header if we have an access token
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    
    return headers
  }

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      console.log('🔄 KanbanBoard: Fetching customers...')
      console.log('🔑 KanbanBoard: Access token available:', accessToken ? 'Yes' : 'No')
      
      const response = await fetch('/api/customers', {
        credentials: 'include', // Keep cookies as fallback
        headers: buildAuthHeaders(),
      })
      
      console.log('📊 KanbanBoard: API response status:', response.status)
      
      if (!response.ok) {
        let errorData = {}
        let rawResponse = ''
        
        try {
          rawResponse = await response.text()
          console.log('📄 KanbanBoard: Raw error response:', rawResponse)
          
          if (rawResponse) {
            errorData = JSON.parse(rawResponse)
          }
        } catch (parseError) {
          console.error('❌ KanbanBoard: Failed to parse error response:', parseError)
          console.log('📄 KanbanBoard: Raw response was:', rawResponse)
          errorData = { error: `HTTP ${response.status} - Invalid JSON response` }
        }
        
        console.error('❌ KanbanBoard: API error:', errorData)
        
        // Build comprehensive error message
        let errorMessage = 'Failed to fetch customers'
        if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (rawResponse) {
          errorMessage = `Server error: ${rawResponse.substring(0, 100)}`
        } else {
          errorMessage = `HTTP ${response.status} error`
        }
        
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      console.log('✅ KanbanBoard: Successfully received data:', {
        customersCount: data.customers?.length || 0,
        hasCustomers: Array.isArray(data.customers)
      })
      
      setCustomers(data.customers || [])
      setError(null)
    } catch (err) {
      console.error('💥 KanbanBoard: Error fetching customers:', err)
      
      const errorMessage = err instanceof Error ? err.message : 'Kunde inte ladda kunder'
      setError(errorMessage)
      
      // Auto-clear error after 10 seconds for fetch errors
      setTimeout(() => setError(null), 10000)
    } finally {
      setLoading(false)
    }
  }

  // Only fetch customers when auth is ready and we have access token
  useEffect(() => {
    if (!authLoading && accessToken) {
      console.log('🚀 KanbanBoard: Auth ready, fetching customers...')
      fetchCustomers()
    } else if (!authLoading && !accessToken) {
      console.log('❌ KanbanBoard: No access token available, cannot fetch customers')
      setError('Autentisering krävs för att ladda kunder')
      setLoading(false)
    }
  }, [authLoading, accessToken])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) {
      return
    }

    const customerId = active.id as string
    const newStatus = over.id as CustomerStatus

    // Uppdatera lokalt först för bättre UX
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === customerId 
          ? { ...customer, status: newStatus }
          : customer
      )
    )

    try {
      setIsUpdating(true)
      setError(null) // Clear previous errors
      console.log('🔄 KanbanBoard: Updating customer status...', { customerId, newStatus })
      
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        credentials: 'include', // Add cookies for auth
        headers: buildAuthHeaders(), // Use our reusable auth headers
        body: JSON.stringify({ status: newStatus }),
      })

      console.log('📊 KanbanBoard: Status update response:', response.status)

      if (!response.ok) {
        let errorData = {}
        let rawResponse = ''
        
        try {
          rawResponse = await response.text()
          console.log('📄 KanbanBoard: Raw error response:', rawResponse)
          
          if (rawResponse) {
            errorData = JSON.parse(rawResponse)
          }
        } catch (parseError) {
          console.error('❌ KanbanBoard: Failed to parse error response:', parseError)
          console.log('📄 KanbanBoard: Raw response was:', rawResponse)
          errorData = { error: `HTTP ${response.status} - Invalid JSON response` }
        }
        
        console.error('❌ KanbanBoard: Status update failed:', errorData)
        
        // Build comprehensive error message
        let errorMessage = 'Failed to update customer status'
        if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (rawResponse) {
          errorMessage = `Server error: ${rawResponse.substring(0, 100)}`
        } else {
          errorMessage = `HTTP ${response.status} error`
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('✅ KanbanBoard: Status updated successfully:', result)

      // Refresh data from server to ensure consistency
      await fetchCustomers()
    } catch (err) {
      console.error('💥 KanbanBoard: Error updating customer status:', err)
      // Revert local change on error
      await fetchCustomers()
      
      const errorMessage = err instanceof Error ? err.message : 'Kunde inte uppdatera kundstatus'
      setError(errorMessage)
      
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCreateCustomer = async () => {
    try {
      setIsCreating(true)
      setError(null) // Clear previous errors
      
      // Simple demo customer - in production this would be a form modal
      const newCustomer = {
        name: `Demo Kund ${new Date().getTime()}`,
        email: `demo${Date.now()}@example.com`,
        phone: '070-123-4567',
        address: 'Demo Address 123',
        status: 'not_handled',
        priority: 'medium',
        notes: 'Skapad via Kanban board'
      }

      console.log('🔄 KanbanBoard: Creating new customer...', newCustomer)

      const response = await fetch('/api/customers', {
        method: 'POST',
        credentials: 'include',
        headers: buildAuthHeaders(),
        body: JSON.stringify(newCustomer),
      })

      console.log('📊 KanbanBoard: Create customer response:', response.status)

      if (!response.ok) {
        let errorData = {}
        let rawResponse = ''
        
        try {
          rawResponse = await response.text()
          console.log('📄 KanbanBoard: Raw error response:', rawResponse)
          
          if (rawResponse) {
            errorData = JSON.parse(rawResponse)
          }
        } catch (parseError) {
          console.error('❌ KanbanBoard: Failed to parse error response:', parseError)
          console.log('📄 KanbanBoard: Raw response was:', rawResponse)
          errorData = { error: `HTTP ${response.status} - Invalid JSON response` }
        }
        
        console.error('❌ KanbanBoard: Create customer failed:', errorData)
        
        // Build comprehensive error message
        let errorMessage = 'Failed to create customer'
        if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (rawResponse) {
          errorMessage = `Server error: ${rawResponse.substring(0, 100)}`
        } else {
          errorMessage = `HTTP ${response.status} error`
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('✅ KanbanBoard: Customer created successfully:', result)

      // Refresh data to show new customer
      await fetchCustomers()
      
      // Show success message briefly
      alert('Kund skapad framgångsrikt!')
      
    } catch (err) {
      console.error('💥 KanbanBoard: Error creating customer:', err)
      
      const errorMessage = err instanceof Error ? err.message : 'Kunde inte skapa ny kund'
      setError(errorMessage)
      
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsCreating(false)
    }
  }

  const getCustomersForStatus = (status: CustomerStatus) => {
    return customers.filter(customer => customer.status === status)
  }

  const activeCustomer = activeId ? customers.find(c => c.id === activeId) : null

  const handleCustomerUpdated = (updatedCustomer: Customer) => {
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Laddar Kanban-tavla...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-400 mr-3">⚠️</div>
          <div>
            <p className="text-red-800 font-medium">Fel vid laddning</p>
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={fetchCustomers}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Försök igen
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header med statistik */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Kanban-tavla för {userProfile.name}
        </h2>
        <div className="text-sm text-gray-600">
          Totalt {customers.length} kunder • 
          {visibleColumns.length} aktiva kolumner för din roll
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {visibleColumns.map((column) => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              customers={getCustomersForStatus(column.id)}
              userRole={userRole as UserRole}
              onCustomerUpdated={handleCustomerUpdated}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCustomer ? (
            <div className="rotate-2 opacity-90">
              <CustomerCard 
                customer={activeCustomer} 
                isDragging={true}
                userRole={userRole as UserRole}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Refresh-knapp */}
      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={fetchCustomers}
          disabled={loading || isUpdating}
          className={`px-4 py-2 text-white rounded-lg transition-colors ${
            loading || isUpdating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? '⏳ Laddar...' : '🔄 Uppdatera data'}
        </button>
        <button
          onClick={handleCreateCustomer}
          disabled={!accessToken || isCreating || loading}
          className={`px-4 py-2 text-white rounded-lg transition-colors ${
            !accessToken || isCreating || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isCreating ? '⏳ Skapar...' : '➕ Lägg till kund'}
        </button>
      </div>
      
      {/* Enhanced loading state indicator */}
      {(isUpdating || isCreating) && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">
              {isUpdating ? 'Uppdaterar kundstatus...' : 'Skapar ny kund...'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}