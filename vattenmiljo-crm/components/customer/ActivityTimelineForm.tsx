'use client'

import React, { useState, useEffect } from 'react'
import { Customer, CustomerActivity, ActivityType } from '@/lib/types'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { 
  Activity, 
  Clock, 
  User, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar, 
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Plus
} from 'lucide-react'

interface ActivityTimelineFormProps {
  customer: Customer
  onCustomerChange: (customer: Customer) => void
  onValidationChange?: (isValid: boolean) => void
}

export default function ActivityTimelineForm({ 
  customer, 
  onCustomerChange, 
  onValidationChange 
}: ActivityTimelineFormProps) {
  const [activities, setActivities] = useState<CustomerActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [newActivity, setNewActivity] = useState({
    type: 'custom' as ActivityType,
    title: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)
  
  const { accessToken } = useSupabaseAuth()

  // Activity type configurations
  const ACTIVITY_CONFIGS: Record<ActivityType, { icon: any; label: string; color: string }> = {
    status_change: { icon: TrendingUp, label: 'Statusändring', color: 'text-blue-600' },
    note_added: { icon: FileText, label: 'Anteckning tillagd', color: 'text-green-600' },
    file_upload: { icon: Upload, label: 'Fil uppladdad', color: 'text-purple-600' },
    file_download: { icon: Download, label: 'Fil nedladdad', color: 'text-indigo-600' },
    file_delete: { icon: Trash2, label: 'Fil borttagen', color: 'text-red-600' },
    meeting_scheduled: { icon: Calendar, label: 'Möte schemalagt', color: 'text-yellow-600' },
    call_made: { icon: Phone, label: 'Samtal genomfört', color: 'text-cyan-600' },
    email_sent: { icon: Mail, label: 'E-post skickat', color: 'text-orange-600' },
    custom: { icon: Activity, label: 'Aktivitet', color: 'text-gray-600' }
  }

  // Fetch activities on component mount
  useEffect(() => {
    if (customer.id && accessToken) {
      fetchActivities()
    }
  }, [customer.id, accessToken])

  // Validation
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(true) // Activities are always optional, so always valid
    }
  }, [activities, onValidationChange])

  const buildAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    return headers
  }

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError(null)


      const response = await fetch(`/api/customers/${customer.id}/activities`, {
        method: 'GET',
        credentials: 'include',
        headers: buildAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch activities (${response.status})`)
      }

      const data = await response.json()
      
      setActivities(data.activities || [])
    } catch (err) {
      console.error('💥 ActivityTimeline: Error fetching activities:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load activities'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAddActivity = async () => {
    if (!newActivity.title.trim()) {
      return
    }

    try {
      setSubmitting(true)
      setError(null)


      const response = await fetch(`/api/customers/${customer.id}/activities`, {
        method: 'POST',
        credentials: 'include',
        headers: buildAuthHeaders(),
        body: JSON.stringify(newActivity),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to add activity (${response.status})`)
      }

      const data = await response.json()

      // Add activity to local state
      setActivities(prev => [data.activity, ...prev])

      // Reset form
      setNewActivity({
        type: 'custom',
        title: '',
        description: ''
      })
      setShowAddActivity(false)

    } catch (err) {
      console.error('💥 ActivityTimeline: Error adding activity:', err)
      setError(err instanceof Error ? err.message : 'Failed to add activity')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('sv-SE', { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('sv-SE', { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Activity Button */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Aktivitetshistorik</h3>
          </div>
          <button
            onClick={() => setShowAddActivity(true)}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Lägg till aktivitet
          </button>
        </div>

        {/* Add Activity Form */}
        {showAddActivity && (
          <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-4">Ny aktivitet</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aktivitetstyp
                </label>
                <select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value as ActivityType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(ACTIVITY_CONFIGS).map(([type, config]) => (
                    <option key={type} value={type}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titel *
                </label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Kort beskrivning av aktiviteten"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beskrivning
                </label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Detaljerad beskrivning (valfritt)"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleAddActivity}
                  disabled={!newActivity.title.trim() || submitting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Spara aktivitet
                </button>
                <button
                  onClick={() => {
                    setShowAddActivity(false)
                    setNewActivity({ type: 'custom', title: '', description: '' })
                  }}
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Laddar aktiviteter...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        {!loading && activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Inga aktiviteter registrerade än</p>
            <p className="text-sm text-gray-500 mt-1">
              Aktiviteter läggs till automatiskt när du utför åtgärder eller manuellt ovan
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {activities.map((activity, index) => {
              const config = ACTIVITY_CONFIGS[activity.type]
              const Icon = config.icon
              const isLast = index === activities.length - 1

              return (
                <div key={activity.id} className="relative">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-6 top-12 w-px h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start space-x-4 pb-6">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${config.color} bg-gray-100`}>
                            {config.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(activity.performedAt)}</span>
                        </div>
                      </div>
                      
                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        <span>{activity.performedBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}