'use client'

import React from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import PersonalSalesDashboard from '@/components/dashboard/PersonalSalesDashboard'
import { ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

export default function PersonalDashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
      return
    }

    // Kontrollera att användaren har rätt roll
    if (!loading && profile && profile.role !== 'SALESPERSON' && profile.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <span>Laddar dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  // Säkerhetskontroll för rollåtkomst
  if (profile.role !== 'SALESPERSON' && profile.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Åtkomst nekad
          </h1>
          <p className="text-gray-600 mb-6">
            Du har inte behörighet att komma åt personlig försäljningsstatistik. 
            Denna funktion är endast tillgänglig för säljare.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till huvuddashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Tillbaka till dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-medium text-gray-900">Personal Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Inloggad som:</span>
              <span className="font-medium text-gray-900">{profile.name}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                {profile.role === 'SALESPERSON' ? 'Säljare' : 'Admin'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PersonalSalesDashboard
          userId={profile.id}
          userName={profile.name}
        />
      </div>
    </div>
  )
}