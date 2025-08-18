'use client'

import React, { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Customer, CustomerFormData } from '@/lib/types'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import CustomerInfoForm from './CustomerInfoForm'
import NeedsAnalysisForm from './NeedsAnalysisForm'
import FileManagementForm from './FileManagementForm'
import ActivityTimelineForm from './ActivityTimelineForm'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Upload, 
  Activity,
  Save,
  X
} from 'lucide-react'

interface CustomerDetailModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: string | null
  onCustomerUpdated?: (customer: Customer) => void
}

export default function CustomerDetailModal({
  isOpen,
  onClose,
  customerId,
  onCustomerUpdated
}: CustomerDetailModalProps) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'analysis' | 'files' | 'activity'>('info')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isFormValid, setIsFormValid] = useState(true)
  
  const { accessToken } = useSupabaseAuth()

  // Fetch customer data when modal opens
  useEffect(() => {
    if (isOpen && customerId && accessToken) {
      fetchCustomerData()
    }
  }, [isOpen, customerId, accessToken])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCustomer(null)
      setError(null)
      setActiveTab('info')
      setHasUnsavedChanges(false)
      setIsFormValid(true)
    }
  }, [isOpen])

  const buildAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    
    return headers
  }

  const fetchCustomerData = async () => {
    if (!customerId) return
    
    try {
      setLoading(true)
      setError(null)
      
      
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'GET',
        credentials: 'include',
        headers: buildAuthHeaders(),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch customer (${response.status})`)
      }
      
      const data = await response.json()
      
      setCustomer(data.customer)
    } catch (err) {
      console.error('💥 CustomerDetailModal: Error fetching customer:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load customer data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmClose = confirm('Du har osparade ändringar. Är du säker på att du vill stänga?')
      if (!confirmClose) return
    }
    onClose()
  }

  const handleSave = async () => {
    if (!customer || !customerId) return
    
    try {
      setSaving(true)
      setError(null)
      
      
      // Build update data - only include fields that can be updated
      const updateData: Partial<CustomerFormData> = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        status: customer.status,
        priority: customer.priority,
        leadSource: customer.leadSource,
        lastContactDate: customer.lastContactDate,
        nextFollowupDate: customer.nextFollowupDate,
        saleAmount: customer.saleAmount,
        saleDate: customer.saleDate,
        needsAnalysis: customer.needsAnalysis,
      }
      
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: buildAuthHeaders(),
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to save customer (${response.status})`)
      }
      
      const data = await response.json()
      
      setCustomer(data.customer)
      setHasUnsavedChanges(false)
      
      // Notify parent component
      if (onCustomerUpdated) {
        onCustomerUpdated(data.customer)
      }
      
    } catch (err) {
      console.error('💥 CustomerDetailModal: Error saving customer:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save customer'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'info' as const, label: 'Grundinfo', icon: User },
    { id: 'analysis' as const, label: 'Behovsanalys', icon: FileText },
    { id: 'files' as const, label: 'Filer', icon: Upload },
    { id: 'activity' as const, label: 'Aktiviteter', icon: Activity },
  ]

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-600">Laddar kunddata...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ett fel uppstod</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchCustomerData} variant="primary">
              Försök igen
            </Button>
          </div>
        </div>
      )
    }

    if (!customer) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Ingen kunddata hittades</p>
        </div>
      )
    }

    switch (activeTab) {
      case 'info':
        return (
          <CustomerInfoForm
            customer={customer}
            onCustomerChange={(updatedCustomer) => {
              setCustomer(updatedCustomer)
              setHasUnsavedChanges(true)
            }}
            onValidationChange={setIsFormValid}
          />
        )
      
      case 'analysis':
        return (
          <NeedsAnalysisForm
            customer={customer}
            onCustomerChange={(updatedCustomer) => {
              setCustomer(updatedCustomer)
              setHasUnsavedChanges(true)
            }}
            onValidationChange={setIsFormValid}
          />
        )
      
      case 'files':
        return (
          <FileManagementForm
            customer={customer}
            onCustomerChange={(updatedCustomer) => {
              setCustomer(updatedCustomer)
              setHasUnsavedChanges(true)
            }}
            onValidationChange={setIsFormValid}
          />
        )
      
      case 'activity':
        return (
          <ActivityTimelineForm
            customer={customer}
            onCustomerChange={(updatedCustomer) => {
              setCustomer(updatedCustomer)
              setHasUnsavedChanges(true)
            }}
            onValidationChange={setIsFormValid}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      className="max-w-4xl"
    >
      <ModalHeader
        title={customer ? `${customer.name}` : 'Kunddetaljer'}
        subtitle={customer ? `${customer.phone} • ${customer.email || 'Ingen e-post'}` : 'Laddar...'}
        onClose={handleClose}
      />
      
      <ModalBody className="p-0">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 pt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6 min-h-[400px]">
          {renderTabContent()}
        </div>
      </ModalBody>
      
      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            {hasUnsavedChanges && (
              <span className="text-sm text-amber-600 font-medium">
                ⚠️ Osparade ändringar
              </span>
            )}
            {saving && (
              <span className="text-sm text-blue-600 font-medium">
                💾 Sparar...
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Stäng
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!hasUnsavedChanges || saving || !isFormValid}
              loading={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              Spara ändringar
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  )
}