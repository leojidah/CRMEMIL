'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart } from 'recharts'
import { Calendar, TrendingUp, Target, Award, Download, Filter, RefreshCw, DollarSign, Users, Crown, Trophy, Star, TrendingDown } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

interface TeamMember {
  id: string
  name: string
  email: string
  totalSales: number
  totalRevenue: number
  conversionRate: number
  totalCustomers: number
  rank: number
}

interface TeamStats {
  totalTeamSales: number
  totalTeamRevenue: number
  totalTeamCustomers: number
  averageConversionRate: number
  teamTarget: number
  teamAchieved: number
  monthlyData: {
    month: string
    totalSales: number
    totalRevenue: number
    totalCustomers: number
    averageConversionRate: number
  }[]
  salespeople: TeamMember[]
  topPerformers: {
    sales: TeamMember
    revenue: TeamMember
    conversion: TeamMember
  }
  statusDistribution: {
    status: string
    count: number
    label: string
    percentage: number
  }[]
  teamMetrics: {
    avgDealSize: number
    totalPipeline: number
    salesVelocity: number
    customerSatisfaction: number
  }
}

interface TeamDashboardProps {
  currentUserId: string
  currentUserName: string
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#F97316']

export default function TeamDashboard({ currentUserId, currentUserName }: TeamDashboardProps) {
  const [stats, setStats] = useState<TeamStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'leaderboard' | 'performance'>('overview')
  
  // Get access token for authentication
  const { accessToken, loading: authLoading } = useSupabaseAuth()

  useEffect(() => {
    if (!authLoading && accessToken) {
      fetchStats()
    } else if (!authLoading && !accessToken) {
      setError('Autentisering krävs för att ladda teamstatistik')
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
      
      const response = await fetch(`/api/stats/team?range=${dateRange}`, {
        credentials: 'include',
        headers,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch team statistics')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      console.error('Error fetching team stats:', err)
      setError('Kunde inte ladda teamstatistik')
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
    
    // Export leaderboard data
    const csvContent = [
      'Name,Email,Sales,Revenue,Customers,ConversionRate,Rank',
      ...stats.salespeople.map(member => 
        `${member.name},${member.email},${member.totalSales},${member.totalRevenue},${member.totalCustomers},${member.conversionRate}%,${member.rank}`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `team-stats-${new Date().toISOString().split('T')[0]}.csv`
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />
      case 2: return <Trophy className="w-5 h-5 text-gray-400" />
      case 3: return <Award className="w-5 h-5 text-amber-600" />
      default: return <Star className="w-5 h-5 text-gray-300" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
      case 2: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Laddar teamstatistik...</span>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-800 font-medium mb-2">Fel vid laddning av teamstatistik</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-gray-600 mt-1">Översikt över hela försäljningsteamets prestanda</p>
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

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Översikt', icon: TrendingUp },
            { id: 'leaderboard', label: 'Ranking', icon: Trophy },
            { id: 'performance', label: 'Prestanda', icon: Target }
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
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Team försäljningar</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTeamSales}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total intäkt</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalTeamRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totala kunder</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTeamCustomers}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Snitt konvertering</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(stats.averageConversionRate)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Team target progress */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team måluppföljning</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uppnått / Mål</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(stats.teamAchieved)} / {formatCurrency(stats.teamTarget)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.teamAchieved / stats.teamTarget) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {formatPercentage((stats.teamAchieved / stats.teamTarget) * 100)} av målet
                </span>
                <span className={`font-medium ${(stats.teamAchieved / stats.teamTarget) >= 1 ? 'text-green-600' : 'text-blue-600'}`}>
                  {(stats.teamAchieved / stats.teamTarget) >= 1 ? '🎉 Mål uppnått!' : `${formatCurrency(stats.teamTarget - stats.teamAchieved)} kvar`}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedTab === 'leaderboard' && (
        <>
          {/* Top performers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-6 h-6" />
                <h3 className="font-semibold">Bästa försäljare</h3>
              </div>
              <p className="text-2xl font-bold">{stats.topPerformers.sales.name}</p>
              <p className="opacity-90">{stats.topPerformers.sales.totalSales} försäljningar</p>
            </div>

            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6" />
                <h3 className="font-semibold">Högst intäkt</h3>
              </div>
              <p className="text-2xl font-bold">{stats.topPerformers.revenue.name}</p>
              <p className="opacity-90">{formatCurrency(stats.topPerformers.revenue.totalRevenue)}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6" />
                <h3 className="font-semibold">Bästa konvertering</h3>
              </div>
              <p className="text-2xl font-bold">{stats.topPerformers.conversion.name}</p>
              <p className="opacity-90">{formatPercentage(stats.topPerformers.conversion.conversionRate)}</p>
            </div>
          </div>

          {/* Full leaderboard */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Team Ranking</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Säljare</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Försäljningar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intäkter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kunder</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konvertering</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.salespeople.map((member) => (
                    <tr key={member.id} className={member.id === currentUserId ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getRankIcon(member.rank)}
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankColor(member.rank)}`}>
                            {member.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                          {member.id === currentUserId && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              Du
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {member.totalSales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(member.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.totalCustomers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.conversionRate >= 25 ? 'bg-green-100 text-green-800' :
                          member.conversionRate >= 15 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {formatPercentage(member.conversionRate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedTab === 'performance' && (
        <>
          {/* Additional team metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Genomsnittlig affär</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.teamMetrics.avgDealSize)}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total pipeline</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.teamMetrics.totalPipeline)}</p>
                </div>
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-cyan-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Försäljningshastighet</p>
                  <p className="text-xl font-bold text-gray-900">{stats.teamMetrics.salesVelocity} dagar</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kundnöjdhet</p>
                  <p className="text-xl font-bold text-gray-900">{formatPercentage(stats.teamMetrics.customerSatisfaction)}</p>
                </div>
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-pink-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Performance charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly performance trend */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Månadsvis team prestanda</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'totalRevenue' ? formatCurrency(value as number) : value,
                      name === 'totalRevenue' ? 'Intäkter' : 
                      name === 'totalSales' ? 'Försäljningar' : 
                      name === 'averageConversionRate' ? 'Snitt konvertering (%)' : 'Kunder'
                    ]}
                  />
                  <Bar dataKey="totalSales" fill="#3B82F6" name="totalSales" />
                  <Line type="monotone" dataKey="averageConversionRate" stroke="#EF4444" strokeWidth={3} name="averageConversionRate" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Status distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team kundstatus fördelning</h3>
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
        </>
      )}
    </div>
  )
}