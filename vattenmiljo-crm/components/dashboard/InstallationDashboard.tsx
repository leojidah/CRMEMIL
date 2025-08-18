'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Calendar, Clock, CheckCircle, Wrench, MapPin, RefreshCw, Download, User, Star, TrendingUp, AlertCircle, Tool } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

interface UpcomingInstallation {
  id: string
  customerName: string
  address: string
  scheduledDate: string
  estimatedDuration: number
  installationType: string
}

interface RecentCompletion {
  id: string
  customerName: string
  address: string
  completedDate: string
  installationType: string
  rating: number
}

interface InstallationStats {
  totalInstallations: number
  pendingInstallations: number
  completedThisMonth: number
  averageInstallationTime: number
  monthlyData: {
    month: string
    scheduled: number
    completed: number
    pending: number
  }[]
  statusDistribution: {
    status: string
    label: string
    count: number
    percentage: number
  }[]
  upcomingInstallations: UpcomingInstallation[]
  installationMetrics: {
    completionRate: number
    averageInstallTime: number
    customerSatisfaction: number
    reworkRate: number
  }
  recentCompletions: RecentCompletion[]
  workloadSummary: {
    thisWeek: number
    nextWeek: number
    backlog: number
  }
}

interface InstallationDashboardProps {
  userId: string
  userName: string
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function InstallationDashboard({ userId, userName }: InstallationDashboardProps) {
  const [stats, setStats] = useState<InstallationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'schedule' | 'completed'>('overview')

  // Get access token for authentication
  const { accessToken, loading: authLoading } = useSupabaseAuth()

  useEffect(() => {
    if (!authLoading && accessToken) {
      fetchStats()
    } else if (!authLoading && !accessToken) {
      setError('Autentisering krävs för att ladda installationsstatistik')
      setLoading(false)
    }
  }, [dateRange, authLoading, accessToken])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }
      
      const response = await fetch(`/api/stats/installations?range=${dateRange}`, {
        credentials: 'include',
        headers,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch installation statistics')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      console.error('Error fetching installation stats:', err)
      setError('Kunde inte ladda installationsstatistik')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchStats()
  }

  const handleExportData = () => {
    if (!stats) return
    
    const csvContent = [
      'Month,Scheduled,Completed,Pending',
      ...stats.monthlyData.map(d => `${d.month},${d.scheduled},${d.completed},${d.pending}`)
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `installation-stats-${userName}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Laddar installationsstatistik...</span>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-800 font-medium mb-2">Fel vid laddning av installationsstatistik</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Försök igen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Installation Dashboard</h1>
          <p className="text-gray-600 mt-1">Hantera och spåra installationer för {userName}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Senaste 7 dagarna</option>
            <option value="30d">Senaste 30 dagarna</option>
            <option value="90d">Senaste 90 dagarna</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Uppdatera
          </button>
          
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportera
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Väntande installationer</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingInstallations}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Klara installationer</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalInstallations}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Denna månad</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completedThisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Snitt installtid</p>
              <p className="text-2xl font-bold text-purple-600">{stats.averageInstallationTime}d</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Tool className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Workload summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Arbetsbelastning</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{stats.workloadSummary.thisWeek}</div>
            <div className="text-sm text-yellow-600">Denna vecka</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{stats.workloadSummary.nextWeek}</div>
            <div className="text-sm text-blue-600">Nästa vecka</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-700">{stats.workloadSummary.backlog}</div>
            <div className="text-sm text-gray-600">Backlog</div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Översikt', icon: TrendingUp },
            { id: 'schedule', label: 'Schema', icon: Calendar },
            { id: 'completed', label: 'Färdiga', icon: CheckCircle }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab content */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly progress chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Månadsvis progression</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10B981" name="Färdiga" />
                <Bar dataKey="pending" fill="#F59E0B" name="Väntande" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status fördelning</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percentage }) => `${label} (${percentage.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedTab === 'schedule' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Kommande installationer</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.upcomingInstallations.map((installation) => (
              <div key={installation.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{installation.customerName}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {installation.installationType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{installation.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{installation.estimatedDuration}h beräknad tid</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-gray-900">
                      {formatDate(installation.scheduledDate)}
                    </div>
                    <div className="text-sm text-gray-500">Schemalagt</div>
                  </div>
                </div>
              </div>
            ))}
            {stats.upcomingInstallations.length === 0 && (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Inga schemalagda installationer</h3>
                <p className="text-gray-600">Nya installationer kommer att visas här</p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'completed' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Senaste färdiga installationer</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentCompletions.map((completion) => (
              <div key={completion.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{completion.customerName}</h4>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Färdig
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{completion.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wrench className="w-4 h-4" />
                        <span>{completion.installationType}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {getStarRating(completion.rating)}
                      <span className="ml-2 text-sm text-gray-600">Kundbetyg</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-gray-900">
                      {formatDate(completion.completedDate)}
                    </div>
                    <div className="text-sm text-gray-500">Färdigställd</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Färdigställningsgrad</p>
              <p className="text-xl font-bold text-green-600">{formatPercentage(stats.installationMetrics.completionRate)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Kundnöjdhet</p>
              <p className="text-xl font-bold text-blue-600">{formatPercentage(stats.installationMetrics.customerSatisfaction)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Snitt installtid</p>
              <p className="text-xl font-bold text-purple-600">{stats.installationMetrics.averageInstallTime}d</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Omarbetning</p>
              <p className="text-xl font-bold text-orange-600">{formatPercentage(stats.installationMetrics.reworkRate)}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}