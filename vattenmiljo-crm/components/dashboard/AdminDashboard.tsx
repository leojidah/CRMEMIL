'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area, AreaChart } from 'recharts'
import { Users, TrendingUp, DollarSign, Shield, Activity, RefreshCw, Download, AlertTriangle, CheckCircle, Clock, Crown, Database, Zap } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

interface TopPerformer {
  id: string
  name: string
  email: string
  totalSales: number
  totalRevenue: number
  totalCustomers: number
  conversionRate: number
}

interface SystemHealth {
  databaseConnected: boolean
  apiResponseTime: number
  activeUsers24h: number
  errorRate: number
  uptime: number
}

interface AdminStats {
  totalCustomers: number
  totalUsers: number
  newCustomersThisPeriod: number
  totalRevenue: number
  periodRevenue: number
  averageDealSize: number
  usersByRole: {
    SALESPERSON: number
    INHOUSE: number
    INSTALLER: number
    ADMIN: number
  }
  systemStatusDistribution: {
    status: string
    label: string
    count: number
    percentage: number
  }[]
  monthlyGrowthData: {
    month: string
    newCustomers: number
    completedSales: number
    totalRevenue: number
  }[]
  topPerformers: TopPerformer[]
  systemHealth: SystemHealth
  recentActivity: {
    id: string
    type: string
    description: string
    timestamp: string
    userId?: string
  }[]
  kpis: {
    conversionRate: number
    averageTimeToClose: number
    customerSatisfaction: number
    monthlyGrowthRate: number
  }
}

interface AdminDashboardProps {
  userId: string
  userName: string
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899']

export default function AdminDashboard({ userId, userName }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'performance' | 'system'>('overview')

  // Get access token for authentication
  const { accessToken, loading: authLoading } = useSupabaseAuth()

  useEffect(() => {
    if (!authLoading && accessToken) {
      fetchStats()
    } else if (!authLoading && !accessToken) {
      setError('Autentisering krävs för att ladda systemstatistik')
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
      
      const response = await fetch(`/api/stats/overview?range=${dateRange}`, {
        credentials: 'include',
        headers,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch system overview')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      console.error('Error fetching admin stats:', err)
      setError('Kunde inte ladda systemstatistik')
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
      'Month,NewCustomers,CompletedSales,Revenue',
      ...stats.monthlyGrowthData.map(d => `${d.month},${d.newCustomers},${d.completedSales},${d.totalRevenue}`)
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `system-overview-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getHealthStatus = (health: SystemHealth) => {
    if (health.uptime >= 99.5 && health.errorRate < 1 && health.apiResponseTime < 200) {
      return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' }
    } else if (health.uptime >= 99 && health.errorRate < 2 && health.apiResponseTime < 500) {
      return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-100' }
    } else if (health.uptime >= 95 && health.errorRate < 5) {
      return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    } else {
      return { status: 'critical', color: 'text-red-600', bg: 'bg-red-100' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Laddar systemstatistik...</span>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-800 font-medium mb-2">Fel vid laddning av systemstatistik</p>
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

  const healthStatus = getHealthStatus(stats.systemHealth)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Systemöversikt och administration för {userName}</p>
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
            <option value="6m">Senaste 6 månaderna</option>
            <option value="1y">Senaste året</option>
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

      {/* System health banner */}
      <div className={`rounded-lg border p-4 ${healthStatus.bg} border-opacity-20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${healthStatus.bg} rounded-lg flex items-center justify-center`}>
              {healthStatus.status === 'excellent' ? (
                <CheckCircle className={`w-6 h-6 ${healthStatus.color}`} />
              ) : healthStatus.status === 'warning' ? (
                <AlertTriangle className={`w-6 h-6 ${healthStatus.color}`} />
              ) : (
                <Activity className={`w-6 h-6 ${healthStatus.color}`} />
              )}
            </div>
            <div>
              <h3 className={`font-semibold ${healthStatus.color}`}>
                System hälsa: {healthStatus.status === 'excellent' ? 'Utmärkt' : 
                              healthStatus.status === 'good' ? 'Bra' : 
                              healthStatus.status === 'warning' ? 'Varning' : 'Kritisk'}
              </h3>
              <p className="text-sm text-gray-600">
                Upptid: {formatPercentage(stats.systemHealth.uptime)} • 
                Svarstid: {Math.round(stats.systemHealth.apiResponseTime)}ms • 
                Aktiva användare: {stats.systemHealth.activeUsers24h}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Totala kunder</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</p>
              <p className="text-xs text-green-600">+{stats.newCustomersThisPeriod} denna period</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total intäkt</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-green-600">+{formatCurrency(stats.periodRevenue)} denna period</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Aktiva användare</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500">Alla roller</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Konverteringsgrad</p>
              <p className="text-2xl font-bold text-orange-600">{formatPercentage(stats.kpis.conversionRate)}</p>
              <p className="text-xs text-gray-500">Genomsnitt</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Översikt', icon: TrendingUp },
            { id: 'users', label: 'Användare', icon: Users },
            { id: 'performance', label: 'Prestanda', icon: Crown },
            { id: 'system', label: 'System', icon: Database }
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
          {/* Growth chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tillväxtutveckling</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={stats.monthlyGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'totalRevenue' ? formatCurrency(value as number) : value,
                  name === 'totalRevenue' ? 'Intäkter' : name === 'newCustomers' ? 'Nya kunder' : 'Försäljningar'
                ]} />
                <Bar dataKey="newCustomers" fill="#3B82F6" name="newCustomers" />
                <Line type="monotone" dataKey="completedSales" stroke="#10B981" strokeWidth={3} name="completedSales" />
                <Area type="monotone" dataKey="totalRevenue" fill="#F59E0B" fillOpacity={0.3} name="totalRevenue" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* System status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.systemStatusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percentage }) => `${label} (${percentage.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.systemStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedTab === 'users' && (
        <>
          {/* User distribution */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.usersByRole.SALESPERSON}</div>
                <div className="text-sm text-gray-600">Säljare</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.usersByRole.INHOUSE}</div>
                <div className="text-sm text-gray-600">Inhouse</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.usersByRole.INSTALLER}</div>
                <div className="text-sm text-gray-600">Montörer</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.usersByRole.ADMIN}</div>
                <div className="text-sm text-gray-600">Administratörer</div>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedTab === 'performance' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Topprestanda</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Säljare</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Försäljningar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intäkter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kunder</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konvertering</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topPerformers.map((performer, index) => (
                  <tr key={performer.id} className={index === 0 ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{performer.name}</div>
                          <div className="text-sm text-gray-500">{performer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {performer.totalSales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(performer.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {performer.totalCustomers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        performer.conversionRate >= 25 ? 'bg-green-100 text-green-800' :
                        performer.conversionRate >= 15 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {formatPercentage(performer.conversionRate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System health metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Systemmetrik</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Databas anslutning</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  stats.systemHealth.databaseConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {stats.systemHealth.databaseConnected ? 'Ansluten' : 'Frånkopplad'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API svarstid</span>
                <span className="text-sm font-medium text-gray-900">{Math.round(stats.systemHealth.apiResponseTime)}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aktiva användare (24h)</span>
                <span className="text-sm font-medium text-gray-900">{stats.systemHealth.activeUsers24h}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fel-frekvens</span>
                <span className="text-sm font-medium text-gray-900">{formatPercentage(stats.systemHealth.errorRate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System upptid</span>
                <span className="text-sm font-medium text-green-600">{formatPercentage(stats.systemHealth.uptime)}</span>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Senaste aktivitet</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stats.recentActivity.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nyckeltal (KPIs)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatPercentage(stats.kpis.conversionRate)}</div>
            <div className="text-sm text-gray-600">Konverteringsgrad</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.kpis.averageTimeToClose}d</div>
            <div className="text-sm text-gray-600">Snitt tid att stänga</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatPercentage(stats.kpis.customerSatisfaction)}</div>
            <div className="text-sm text-gray-600">Kundnöjdhet</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{formatPercentage(stats.kpis.monthlyGrowthRate)}</div>
            <div className="text-sm text-gray-600">Månatlig tillväxt</div>
          </div>
        </div>
      </div>
    </div>
  )
}