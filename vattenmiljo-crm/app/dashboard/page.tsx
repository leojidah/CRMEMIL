'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import Link from 'next/link'
import { BarChart3, Users, TrendingUp, LogOut, Wrench, Settings } from 'lucide-react'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <div className="relative">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 mb-1">Vattenmiljö CRM</p>
            <p className="text-sm text-gray-600 animate-pulse">Laddar dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Vattenmiljö CRM</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dashboard links based on role */}
              <div className="flex items-center space-x-2">
                {(profile.role === 'SALESPERSON' || profile.role === 'ADMIN') && (
                  <Link
                    href="/dashboard/personal"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Min statistik
                  </Link>
                )}
                
                {(profile.role === 'INHOUSE' || profile.role === 'ADMIN') && (
                  <Link
                    href="/dashboard/team"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Team dashboard
                  </Link>
                )}
                
                {(profile.role === 'INSTALLER' || profile.role === 'ADMIN') && (
                  <Link
                    href="/dashboard/installations"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Wrench className="w-4 h-4" />
                    Installationer
                  </Link>
                )}
                
                {profile.role === 'ADMIN' && (
                  <Link
                    href="/dashboard/admin"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </div>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{profile.name}</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {profile.role === 'SALESPERSON' ? 'Säljare' : 
                     profile.role === 'INHOUSE' ? 'In-house' :
                     profile.role === 'INSTALLER' ? 'Montör' : 'Admin'}
                  </span>
                </div>
                
                <Link
                  href="/auth/signout"
                  className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:text-red-600 rounded transition-colors"
                  title="Logga ut"
                >
                  <LogOut className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard shortcuts */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(profile.role === 'SALESPERSON' || profile.role === 'ADMIN') && (
              <Link
                href="/dashboard/personal"
                className="flex items-center gap-3 px-6 py-3 bg-white rounded-lg shadow-sm border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all group min-w-fit"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Min försäljningsstatistik</h3>
                  <p className="text-sm text-gray-600">Se dina personliga resultat och mål</p>
                </div>
              </Link>
            )}
            
            {(profile.role === 'INHOUSE' || profile.role === 'ADMIN') && (
              <Link
                href="/dashboard/team"
                className="flex items-center gap-3 px-6 py-3 bg-white rounded-lg shadow-sm border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all group min-w-fit"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Team dashboard</h3>
                  <p className="text-sm text-gray-600">Övergripande teamstatistik och ranking</p>
                </div>
              </Link>
            )}
            
            {(profile.role === 'INSTALLER' || profile.role === 'ADMIN') && (
              <Link
                href="/dashboard/installations"
                className="flex items-center gap-3 px-6 py-3 bg-white rounded-lg shadow-sm border border-orange-200 hover:border-orange-300 hover:shadow-md transition-all group min-w-fit"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Wrench className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Installation dashboard</h3>
                  <p className="text-sm text-gray-600">Hantera installationer och schema</p>
                </div>
              </Link>
            )}
            
            {profile.role === 'ADMIN' && (
              <Link
                href="/dashboard/admin"
                className="flex items-center gap-3 px-6 py-3 bg-white rounded-lg shadow-sm border border-red-200 hover:border-red-300 hover:shadow-md transition-all group min-w-fit"
              >
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <Settings className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Admin dashboard</h3>
                  <p className="text-sm text-gray-600">Systemöversikt och administration</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <KanbanBoard userProfile={profile} />
      </div>
    </div>
  )
}