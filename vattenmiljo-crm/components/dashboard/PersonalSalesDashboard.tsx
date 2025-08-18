'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Calendar, TrendingUp, Target, Award, Download, Filter, RefreshCw, DollarSign, Users, Clock } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

interface PersonalStats {
  totalSales: number
  totalCustomers: number
  averageDealSize: number
  conversionRate: number
  monthlyData: {
    month: string
    sales: number
    customers: number
    revenue: number
  }[]
  statusDistribution: {
    status: string
    count: number
    label: string
  }[]
  recentAchievements: {
    id: string
    title: string
    description: string
    date: string
  }[]
  targets: {
    monthly: number
    achieved: number
    percentage: number
  }
}

interface PersonalSalesDashboardProps {
  userId: string
  userName: string
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function PersonalSalesDashboard({ userId, userName }: PersonalSalesDashboardProps) {
  const [stats, setStats] = useState<PersonalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)
  
  // Get access token for authentication
  const { accessToken, loading: authLoading } = useSupabaseAuth()

  useEffect(() => {
    if (!authLoading && accessToken) {
      fetchStats()
    } else if (!authLoading && !accessToken) {
      setError('Autentisering krävs för att ladda statistik')
      setLoading(false)
    }
  }, [userId, dateRange, authLoading, accessToken])

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
      
      const response = await fetch(`/api/stats/personal?range=${dateRange}`, {
        credentials: 'include',
        headers,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch personal statistics')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      console.error('Error fetching personal stats:', err)
      setError('Kunde inte ladda personlig statistik')
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
      'Month,Sales,Customers,Revenue',
      ...stats.monthlyData.map(d => `${d.month},${d.sales},${d.customers},${d.revenue}`)
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `personal-stats-${userName}-${new Date().toISOString().split('T')[0]}.csv`
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Laddar personlig statistik...</span>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-800 font-medium mb-2">Fel vid laddning av statistik</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Min Dashboard</h1>
          <p className="text-gray-600 mt-1">Personlig försäljningsstatistik för {userName}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date range selector */}
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
          
          {/* Action buttons */}
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
              <p className="text-sm text-gray-600 mb-1">Totala försäljningar</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Totala kunder</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Genomsnittlig affär</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageDealSize)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Konverteringsgrad</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(stats.conversionRate)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Target progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Måluppföljning denna månad</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Uppnått / Mål</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(stats.targets.achieved)} / {formatCurrency(stats.targets.monthly)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(stats.targets.percentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {formatPercentage(stats.targets.percentage)} av målet
            </span>
            <span className={`font-medium ${stats.targets.percentage >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
              {stats.targets.percentage >= 100 ? '🎉 Mål uppnått!' : `${formatCurrency(stats.targets.monthly - stats.targets.achieved)} kvar`}
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly performance chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Månadsvis prestanda</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(value as number) : value,
                  name === 'revenue' ? 'Intäkter' : name === 'sales' ? 'Försäljningar' : 'Kunder'
                ]}
              />
              <Bar dataKey="sales" fill="#3B82F6" name="sales" />
              <Bar dataKey="customers" fill="#10B981" name="customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kundstatus fördelning</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}
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

      {/* Revenue trend */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Intäktsutveckling</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [formatCurrency(value as number), 'Intäkter']} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent achievements */}
      {stats.recentAchievements.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Senaste framgångar
          </h3>
          <div className="space-y-3">
            {stats.recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(achievement.date).toLocaleDateString('sv-SE')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}