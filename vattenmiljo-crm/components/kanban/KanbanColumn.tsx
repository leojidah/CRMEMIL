'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Customer, UserRole, KanbanColumn } from '@/lib/types'
import CustomerCard from './CustomerCard'

interface KanbanColumnProps {
  column: KanbanColumn
  customers: Customer[]
  userRole: UserRole
  onCustomerUpdated?: (customer: Customer) => void
}

export default function KanbanColumnComponent({ column, customers, userRole, onCustomerUpdated }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      status: column.id
    }
  })

  const customerIds = customers.map(customer => customer.id)

  return (
    <div className="flex flex-col w-80 flex-shrink-0">
      {/* Column Header */}
      <div className={`p-4 rounded-t-lg border-2 ${column.color}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            {column.description && (
              <p className="text-sm text-gray-600 mt-1">{column.description}</p>
            )}
          </div>
          <div className="flex items-center justify-center w-6 h-6 bg-white bg-opacity-70 rounded-full">
            <span className="text-sm font-medium text-gray-700">{customers.length}</span>
          </div>
        </div>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 border-l-2 border-r-2 border-b-2 rounded-b-lg min-h-96 ${
          column.color
        } ${
          isOver ? 'bg-opacity-20' : 'bg-opacity-5'
        } transition-colors duration-200`}
      >
        <SortableContext items={customerIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {customers.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 opacity-50">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="w-8 h-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <p className="text-sm">Inga kunder</p>
                </div>
              </div>
            ) : (
              customers.map(customer => (
                <CustomerCard 
                  key={customer.id} 
                  customer={customer}
                  userRole={userRole}
                  onCustomerUpdated={onCustomerUpdated}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}