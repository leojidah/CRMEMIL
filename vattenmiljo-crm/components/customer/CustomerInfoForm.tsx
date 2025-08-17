'use client'

import React, { useState, useEffect } from 'react'
import { Customer, CustomerStatus, CustomerPriority } from '@/lib/types'
import { FormGroup, FormLabel, FormError } from '@/components/ui/form'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Flag, 
  Users,
  Calendar,
  DollarSign
} from 'lucide-react'

interface CustomerInfoFormProps {
  customer: Customer
  onCustomerChange: (customer: Customer) => void
  onValidationChange?: (isValid: boolean) => void
}

interface ValidationErrors {
  name?: string
  phone?: string
  email?: string
  status?: string
  priority?: string
}

export default function CustomerInfoForm({ 
  customer, 
  onCustomerChange, 
  onValidationChange 
}: CustomerInfoFormProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  
  // Status options based on the kanban columns
  const statusOptions = [
    { value: 'not_handled', label: 'Inte hanterat' },
    { value: 'no_answer', label: 'Inget svar' },
    { value: 'call_again', label: 'Ring igen' },
    { value: 'not_interested', label: 'Inte intresserad' },
    { value: 'meeting_booked', label: 'Möte bokat' },
    { value: 'quotation_stage', label: 'Förslag skickat' },
    { value: 'extended_water_test', label: 'Utökat vattenprov' },
    { value: 'sold', label: 'Såld' },
    { value: 'ready_for_installation', label: 'Redo att installeras' },
    { value: 'installation_complete', label: 'Installation klar' },
    { value: 'archived', label: 'Arkiverad' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Låg prioritet' },
    { value: 'medium', label: 'Medium prioritet' },
    { value: 'high', label: 'Hög prioritet' }
  ]

  const leadSourceOptions = [
    'Website',
    'Referral', 
    'Social Media',
    'Cold Call',
    'Trade Show',
    'Print Ad',
    'Direct Mail',
    'Other'
  ]

  // Validation function
  const validateForm = (data: Customer): ValidationErrors => {
    const newErrors: ValidationErrors = {}

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
      newErrors.name = 'Namn måste vara minst 2 tecken'
    }

    // Phone validation
    if (!data.phone || data.phone.trim().length < 8) {
      newErrors.phone = 'Telefonnummer krävs (minst 8 siffror)'
    }

    // Email validation (optional but if provided must be valid)
    if (data.email && data.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        newErrors.email = 'Ogiltig e-postadress'
      }
    }

    return newErrors
  }

  // Update validation when customer changes
  useEffect(() => {
    const newErrors = validateForm(customer)
    setErrors(newErrors)
    
    if (onValidationChange) {
      onValidationChange(Object.keys(newErrors).length === 0)
    }
  }, [customer, onValidationChange])

  const handleInputChange = (field: keyof Customer, value: any) => {
    const updatedCustomer = { ...customer, [field]: value }
    onCustomerChange(updatedCustomer)
  }

  const formatPhoneNumber = (phone: string) => {
    // Simple Swedish phone number formatting
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length >= 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1-$2 $3 $4')
    }
    return phone
  }

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Grundläggande information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Field */}
          <FormGroup error={!!errors.name} required>
            <FormLabel htmlFor="customer-name" required>
              Kundens namn
            </FormLabel>
            <input
              id="customer-name"
              type="text"
              value={customer.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="För- och efternamn"
              autoComplete="name"
            />
            {errors.name && <FormError>{errors.name}</FormError>}
          </FormGroup>

          {/* Phone Field */}
          <FormGroup error={!!errors.phone} required>
            <FormLabel htmlFor="customer-phone" required>
              Telefonnummer
            </FormLabel>
            <div className="relative">
              <input
                id="customer-phone"
                type="tel"
                value={customer.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onBlur={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}
                className={`w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="070-123 45 67"
                autoComplete="tel"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            {errors.phone && <FormError>{errors.phone}</FormError>}
          </FormGroup>

          {/* Email Field */}
          <FormGroup error={!!errors.email}>
            <FormLabel htmlFor="customer-email">
              E-postadress
            </FormLabel>
            <div className="relative">
              <input
                id="customer-email"
                type="email"
                value={customer.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="kund@exempel.se"
                autoComplete="email"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            {errors.email && <FormError>{errors.email}</FormError>}
          </FormGroup>

          {/* Priority Field */}
          <FormGroup>
            <FormLabel htmlFor="customer-priority">
              Prioritet
            </FormLabel>
            <div className="relative">
              <select
                id="customer-priority"
                value={customer.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as CustomerPriority)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Flag className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </FormGroup>
        </div>

        {/* Address Field */}
        <div className="mt-4">
          <FormGroup>
            <FormLabel htmlFor="customer-address">
              Adress
            </FormLabel>
            <div className="relative">
              <textarea
                id="customer-address"
                value={customer.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Gatuadress, postnummer och ort"
              />
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </FormGroup>
        </div>
      </div>

      {/* Status & Lead Information Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Status & Leadinformation</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Field */}
          <FormGroup>
            <FormLabel htmlFor="customer-status">
              Kundstatus
            </FormLabel>
            <select
              id="customer-status"
              value={customer.status}
              onChange={(e) => handleInputChange('status', e.target.value as CustomerStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormGroup>

          {/* Lead Source Field */}
          <FormGroup>
            <FormLabel htmlFor="customer-lead-source">
              Leadkälla
            </FormLabel>
            <select
              id="customer-lead-source"
              value={customer.leadSource || ''}
              onChange={(e) => handleInputChange('leadSource', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
            >
              <option value="">Välj leadkälla...</option>
              {leadSourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </FormGroup>

          {/* Last Contact Date */}
          <FormGroup>
            <FormLabel htmlFor="customer-last-contact">
              Senaste kontakt
            </FormLabel>
            <div className="relative">
              <input
                id="customer-last-contact"
                type="date"
                value={customer.lastContactDate ? customer.lastContactDate.split('T')[0] : ''}
                onChange={(e) => handleInputChange('lastContactDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </FormGroup>

          {/* Next Follow-up Date */}
          <FormGroup>
            <FormLabel htmlFor="customer-followup">
              Nästa uppföljning
            </FormLabel>
            <div className="relative">
              <input
                id="customer-followup"
                type="date"
                value={customer.nextFollowupDate ? customer.nextFollowupDate.split('T')[0] : ''}
                onChange={(e) => handleInputChange('nextFollowupDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </FormGroup>
        </div>
      </div>

      {/* Sales Information Section */}
      {(customer.status === 'sold' || customer.status === 'ready_for_installation' || customer.status === 'installation_complete') && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Försäljningsinformation</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sale Amount */}
            <FormGroup>
              <FormLabel htmlFor="customer-sale-amount">
                Försäljningsbelopp (SEK)
              </FormLabel>
              <div className="relative">
                <input
                  id="customer-sale-amount"
                  type="number"
                  value={customer.saleAmount || ''}
                  onChange={(e) => handleInputChange('saleAmount', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="85000"
                  min="0"
                  step="1000"
                />
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </FormGroup>

            {/* Sale Date */}
            <FormGroup>
              <FormLabel htmlFor="customer-sale-date">
                Försäljningsdatum
              </FormLabel>
              <div className="relative">
                <input
                  id="customer-sale-date"
                  type="date"
                  value={customer.saleDate ? customer.saleDate.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('saleDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </FormGroup>
          </div>
        </div>
      )}
    </div>
  )
}