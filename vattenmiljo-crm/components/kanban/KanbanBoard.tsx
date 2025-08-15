'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
// import { arrayMove } from '@dnd-kit/sortable' // Not currently used
import { Customer, CustomerStatus, UserRole, KanbanColumn } from '@/lib/types'
// Removed NextAuth session import
import KanbanColumnComponent from './KanbanColumn'
import CustomerCard from './CustomerCard'

interface KanbanBoardProps {
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

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'not_handled',
    title: 'Ej hanterad',
    description: 'Nya leads som behöver kontakt',
    color: 'bg-red-50 border-red-200',
    order: 1,
    visibleToRoles: ['salesperson', 'internal', 'admin']
  },
  {
    id: 'no_answer',
    title: 'Inget svar',
    description: 'Kunder som inte svarat',
    color: 'bg-orange-50 border-orange-200',
    order: 2,
    visibleToRoles: ['salesperson', 'internal', 'admin']
  },
  {
    id: 'call_again',
    title: 'Ring igen',
    description: 'Schemalagd uppföljning',
    color: 'bg-yellow-50 border-yellow-200',
    order: 3,
    visibleToRoles: ['salesperson', 'internal', 'admin']
  },
  {
    id: 'meeting_booked',
    title: 'Möte bokat',
    description: 'Möte schemalagt med kund',
    color: 'bg-blue-50 border-blue-200',
    order: 4,
    visibleToRoles: ['salesperson', 'internal', 'admin']
  },
  {
    id: 'quotation_stage',
    title: 'Offert',
    description: 'Offert skickad eller under framtagning',
    color: 'bg-indigo-50 border-indigo-200',
    order: 5,
    visibleToRoles: ['salesperson', 'internal', 'admin']
  },
  {
    id: 'extended_water_test',
    title: 'Utökad vattenanalys',
    description: 'Kund genomför vattentest',
    color: 'bg-cyan-50 border-cyan-200',
    order: 6,
    visibleToRoles: ['salesperson', 'internal', 'admin']
  },
  {
    id: 'sold',
    title: 'Såld',
    description: 'Kund har köpt, väntar på bearbetning',
    color: 'bg-green-50 border-green-200',
    order: 7,
    visibleToRoles: ['salesperson', 'internal', 'admin']
  },
  {
    id: 'ready_for_installation',
    title: 'Redo för installation',
    description: 'Klar för montering',
    color: 'bg-emerald-50 border-emerald-200',
    order: 8,
    visibleToRoles: ['internal', 'installer', 'admin']
  },
  {
    id: 'installation_complete',
    title: 'Installation klar',
    description: 'Installation genomförd',
    color: 'bg-teal-50 border-teal-200',
    order: 9,
    visibleToRoles: ['installer', 'internal', 'admin']
  },
  {
    id: 'not_interested',
    title: 'Ej intresserad',
    description: 'Kunder som tackat nej',
    color: 'bg-gray-50 border-gray-200',
    order: 10,
    visibleToRoles: ['salesperson', 'internal', 'admin']
  },
  {
    id: 'archived',
    title: 'Arkiverad',
    description: 'Avslutade ärenden',
    color: 'bg-slate-50 border-slate-200',
    order: 11,
    visibleToRoles: ['internal', 'admin']
  }
]

export default function KanbanBoard({ session }: KanbanBoardProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draggedCustomer, setDraggedCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const currentUserRole = session.user.role as UserRole

  // Filter columns based on user role
  const visibleColumns = useMemo(() => {
    return KANBAN_COLUMNS
      .filter(column => 
        column.visibleToRoles.includes(currentUserRole) ||
        (currentUserRole === 'admin') // Admin can see all columns
      )
      .sort((a, b) => a.order - b.order)
  }, [currentUserRole])

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance before drag starts
      },
    })
  )

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
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
      const response = await fetch(`/api/customers/${customerId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          movedBy: session.user.id,
          method: 'kanban_drag_drop'
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status')
      }

      return data.customer
    } catch (error) {
      console.error('Error updating customer status:', error)
      throw error
    }
  }

  // Get customers for a specific column
  const getCustomersForColumn = (status: CustomerStatus) => {
    let columnCustomers = customers.filter(customer => customer.status === status)
    
    // Apply role-based filtering
    if (currentUserRole === 'salesperson') {
      // Salespeople only see their own customers or unassigned ones
      columnCustomers = columnCustomers.filter(customer => 
        customer.assignedTo === session.user.id || !customer.assignedTo
      )
    } else if (currentUserRole === 'installer') {
      // Installers only see customers ready for installation or completed
      columnCustomers = columnCustomers.filter(customer =>
        customer.status === 'ready_for_installation' || customer.status === 'installation_complete'
      )
    }

    return columnCustomers
  }

  // Check if user can move customer to a specific status
  const canMoveToStatus = (customer: Customer, newStatus: CustomerStatus): boolean => {
    const currentStatus = customer.status

    // Define valid transitions by role
    const validTransitions: Record<UserRole, Record<CustomerStatus, CustomerStatus[]>> = {
      salesperson: {
        'not_handled': ['no_answer', 'call_again', 'not_interested', 'meeting_booked'],
        'no_answer': ['call_again', 'not_interested', 'meeting_booked'],
        'call_again': ['no_answer', 'not_interested', 'meeting_booked'],
        'meeting_booked': ['quotation_stage', 'not_interested'],
        'quotation_stage': ['extended_water_test', 'sold', 'not_interested'],
        'extended_water_test': ['sold', 'not_interested'],
        'sold': [], // Salespeople can't move from sold
        'ready_for_installation': [],
        'installation_complete': [],
        'not_interested': ['call_again'], // Can reactivate
        'archived': []
      },
      internal: {
        'not_handled': ['no_answer', 'call_again', 'not_interested', 'meeting_booked'],
        'no_answer': ['call_again', 'not_interested', 'meeting_booked'],
        'call_again': ['no_answer', 'not_interested', 'meeting_booked'],
        'meeting_booked': ['quotation_stage', 'not_interested'],
        'quotation_stage': ['extended_water_test', 'sold', 'not_interested'],
        'extended_water_test': ['sold', 'not_interested'],
        'sold': ['ready_for_installation'],
        'ready_for_installation': ['installation_complete'],
        'installation_complete': ['archived'],
        'not_interested': ['archived'],
        'archived': []
      },
      installer: {
        'not_handled': [],
        'no_answer': [],
        'call_again': [],
        'meeting_booked': [],
        'quotation_stage': [],
        'extended_water_test': [],
        'sold': [],
        'ready_for_installation': ['installation_complete'],
        'installation_complete': [],
        'not_interested': [],
        'archived': []
      },
      admin: {
        // Admin can move between any statuses
        'not_handled': ['no_answer', 'call_again', 'not_interested', 'meeting_booked', 'quotation_stage', 'extended_water_test', 'sold', 'ready_for_installation', 'installation_complete', 'archived'],
        'no_answer': ['not_handled', 'call_again', 'not_interested', 'meeting_booked', 'quotation_stage', 'extended_water_test', 'sold', 'ready_for_installation', 'installation_complete', 'archived'],
        'call_again': ['not_handled', 'no_answer', 'not_interested', 'meeting_booked', 'quotation_stage', 'extended_water_test', 'sold', 'ready_for_installation', 'installation_complete', 'archived'],
        'meeting_booked': ['not_handled', 'no_answer', 'call_again', 'not_interested', 'quotation_stage', 'extended_water_test', 'sold', 'ready_for_installation', 'installation_complete', 'archived'],
        'quotation_stage': ['not_handled', 'no_answer', 'call_again', 'meeting_booked', 'not_interested', 'extended_water_test', 'sold', 'ready_for_installation', 'installation_complete', 'archived'],
        'extended_water_test': ['not_handled', 'no_answer', 'call_again', 'meeting_booked', 'quotation_stage', 'not_interested', 'sold', 'ready_for_installation', 'installation_complete', 'archived'],
        'sold': ['not_handled', 'no_answer', 'call_again', 'meeting_booked', 'quotation_stage', 'extended_water_test', 'not_interested', 'ready_for_installation', 'installation_complete', 'archived'],
        'ready_for_installation': ['not_handled', 'no_answer', 'call_again', 'meeting_booked', 'quotation_stage', 'extended_water_test', 'sold', 'not_interested', 'installation_complete', 'archived'],
        'installation_complete': ['not_handled', 'no_answer', 'call_again', 'meeting_booked', 'quotation_stage', 'extended_water_test', 'sold', 'ready_for_installation', 'not_interested', 'archived'],
        'not_interested': ['not_handled', 'no_answer', 'call_again', 'meeting_booked', 'quotation_stage', 'extended_water_test', 'sold', 'ready_for_installation', 'installation_complete', 'archived'],
        'archived': ['not_handled', 'no_answer', 'call_again', 'meeting_booked', 'quotation_stage', 'extended_water_test', 'sold', 'ready_for_installation', 'installation_complete', 'not_interested']
      }
    }

    const allowedTransitions = validTransitions[currentUserRole]?.[currentStatus] || []
    return allowedTransitions.includes(newStatus)
  }

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const customerId = event.active.id as string
    const customer = customers.find(c => c.id === customerId)
    setDraggedCustomer(customer || null)
  }

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedCustomer(null)

    if (!over || active.id === over.id) return

    const customerId = active.id as string
    const newStatus = over.id as CustomerStatus
    const customer = customers.find(c => c.id === customerId)

    if (!customer) return

    // Check if the move is allowed
    if (!canMoveToStatus(customer, newStatus)) {
      console.warn(`Move from ${customer.status} to ${newStatus} not allowed for role ${currentUserRole}`)
      return
    }

    // Optimistic update
    setCustomers(prev => 
      prev.map(c => 
        c.id === customerId 
          ? { ...c, status: newStatus, updatedAt: new Date().toISOString() }
          : c
      )
    )

    try {
      await updateCustomerStatus(customerId, newStatus)
    } catch (err) {
      console.error('Error updating customer status:', err)
      // Revert optimistic update on error
      setCustomers(prev => 
        prev.map(c => 
          c.id === customerId 
            ? { ...c, status: customer.status, updatedAt: customer.updatedAt }
            : c
        )
      )
    }
  }

  // Load customers on mount and when search changes
  useEffect(() => {
    fetchCustomers()
  }, [searchTerm])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-600">Laddar Kanban board...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchCustomers}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Försök igen
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search and controls */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Sök kunder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Roll: <span className="font-semibold">{currentUserRole}</span>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 p-4 min-w-max">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {visibleColumns.map(column => (
              <KanbanColumnComponent
                key={column.id}
                column={column}
                customers={getCustomersForColumn(column.id)}
                canMoveToStatus={(customer, status) => canMoveToStatus(customer, status)}
              />
            ))}
            
            <DragOverlay>
              {draggedCustomer && (
                <div className="transform rotate-3">
                  <CustomerCard customer={draggedCustomer} isDragging />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  )
}