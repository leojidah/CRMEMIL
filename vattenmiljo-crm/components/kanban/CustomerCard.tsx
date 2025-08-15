'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Customer, CustomerStatus } from '@/lib/types'
import { Phone, Mail, MapPin, Calendar, Clock, Euro, User, CheckCircle2, TrendingUp } from 'lucide-react'

interface CustomerCardProps {
  customer: Customer
  isDragging?: boolean
  canMoveToStatus?: (customer: Customer, status: CustomerStatus) => boolean
}

export default function CustomerCard({ customer, isDragging = false }: CustomerCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({
    id: customer.id,
    data: {
      type: 'customer',
      customer
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const PRIORITY_CONFIG = {
    low: { 
      label: 'Låg', 
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      dotColor: 'bg-gray-400'
    },
    medium: { 
      label: 'Medium', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      dotColor: 'bg-yellow-500'
    },
    high: { 
      label: 'Hög', 
      color: 'bg-red-100 text-red-800 border-red-200',
      dotColor: 'bg-red-500'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('sv-SE', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return null
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const priorityConfig = PRIORITY_CONFIG[customer.priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
        (isDragging || isSortableDragging) ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50 transform scale-105' : ''
      }`}
    >
      {/* Header with name and priority */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 truncate">
            {customer.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${priorityConfig.color}`}>
              <div className={`w-2 h-2 rounded-full ${priorityConfig.dotColor}`} />
              {priorityConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Contact information */}
      <div className="space-y-2 mb-3">
        {customer.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{customer.phone}</span>
          </div>
        )}
        {customer.email && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {customer.address && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{customer.address}</span>
          </div>
        )}
      </div>

      {/* Enhanced information for different stages */}
      <div className="space-y-2 mb-3">
        {customer.lastContactDate && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>Senast kontakt: {formatDate(customer.lastContactDate)}</span>
          </div>
        )}

        {customer.nextFollowupDate && (
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>Uppföljning: {formatDate(customer.nextFollowupDate)}</span>
          </div>
        )}

        {customer.saleAmount && (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <Euro className="w-3 h-3 flex-shrink-0" />
            <span>{formatCurrency(customer.saleAmount)}</span>
          </div>
        )}

        {customer.assignedTo && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <User className="w-3 h-3 flex-shrink-0" />
            <span>Tilldelad</span>
          </div>
        )}
      </div>

      {/* Lead source indicator */}
      {customer.leadSource && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
            {customer.leadSource}
          </span>
        </div>
      )}

      {/* Needs analysis indicators */}
      {customer.needsAnalysis && Object.keys(customer.needsAnalysis).length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {customer.needsAnalysis.waterHardness === 'high' && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-50 text-orange-700 text-xs border border-orange-200">
                Hårt vatten
              </span>
            )}
            {customer.needsAnalysis.chlorineTaste && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 text-xs border border-yellow-200">
                Klorsmak
              </span>
            )}
            {customer.needsAnalysis.ironStaining && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs border border-red-200">
                Järnfläckar
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer with relative date */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          Uppdaterad {formatDate(customer.updatedAt)}
        </span>
        
        {/* Status indicator icons for quick visual reference */}
        <div className="flex items-center gap-1">
          {customer.meetings && customer.meetings.length > 0 && (
            <Calendar className="w-3 h-3 text-blue-500" title="Har möten" />
          )}
          {customer.quotations && customer.quotations.length > 0 && (
            <TrendingUp className="w-3 h-3 text-green-500" title="Har offerter" />
          )}
          {customer.waterTests && customer.waterTests.length > 0 && (
            <CheckCircle2 className="w-3 h-3 text-cyan-500" title="Har vattentest" />
          )}
        </div>
      </div>
    </div>
  )
}