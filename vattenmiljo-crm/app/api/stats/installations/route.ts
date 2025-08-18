import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Hämta authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verifiera token och hämta användare
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Kontrollera användarroll - endast INSTALLER och ADMIN kan se installation statistik
    const userRole = user.user_metadata?.role || 'ADMIN'
    if (userRole !== 'INSTALLER' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only installers and admins can view installation statistics.' },
        { status: 403 }
      )
    }

    // Hämta tidsperiod från query parameters
    const url = new URL(request.url)
    const range = url.searchParams.get('range') || '30d'
    
    // Beräkna datum för filtrering
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '6m':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Hämta kunder för installation statistik
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (customersError) {
      console.error('Error fetching customers:', customersError)
      return NextResponse.json(
        { error: 'Failed to fetch customer data' },
        { status: 500 }
      )
    }

    const allCustomers = customers || []

    // Filtrera för installation-relevanta statusar
    const readyForInstallation = allCustomers.filter(c => c.status === 'ready_for_installation')
    const installationComplete = allCustomers.filter(c => c.status === 'installation_complete')
    const soldCustomers = allCustomers.filter(c => c.status === 'sold')

    // Beräkna grundläggande installation statistik
    const totalInstallations = installationComplete.length
    const pendingInstallations = readyForInstallation.length
    const completedThisMonth = installationComplete.filter(c => {
      const installDate = new Date(c.updated_at)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return installDate >= monthStart
    }).length

    // Genomsnittlig installation tid (simulerad för demo)
    const averageInstallationTime = 3.5 // dagar

    // Gruppera installation data per månad
    const monthlyData: { [key: string]: { scheduled: number, completed: number, pending: number } } = {}
    
    allCustomers.forEach(customer => {
      const date = new Date(customer.updated_at)
      const monthKey = date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { scheduled: 0, completed: 0, pending: 0 }
      }
      
      if (customer.status === 'sold') {
        monthlyData[monthKey].scheduled += 1
      } else if (customer.status === 'ready_for_installation') {
        monthlyData[monthKey].pending += 1
      } else if (customer.status === 'installation_complete') {
        monthlyData[monthKey].completed += 1
      }
    })

    // Konvertera till array för diagram
    const monthlyArray = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(`01 ${a.month}`).getTime() - new Date(`01 ${b.month}`).getTime())

    // Installation status distribution
    const statusDistribution = [
      { status: 'sold', label: 'Redo att faktureras', count: soldCustomers.length },
      { status: 'ready_for_installation', label: 'Redo för installation', count: pendingInstallations },
      { status: 'installation_complete', label: 'Installation klar', count: totalInstallations }
    ].filter(s => s.count > 0)
    .map(s => ({
      ...s,
      percentage: allCustomers.length > 0 ? (s.count / allCustomers.length) * 100 : 0
    }))

    // Kommande installationer (simulerat schema)
    const upcomingInstallations = readyForInstallation.slice(0, 5).map((customer, index) => {
      const scheduleDate = new Date()
      scheduleDate.setDate(scheduleDate.getDate() + (index * 2) + 1) // Spread över nästa 10 dagar
      
      return {
        id: customer.id,
        customerName: customer.name,
        address: customer.address,
        scheduledDate: scheduleDate.toISOString(),
        estimatedDuration: Math.floor(Math.random() * 4) + 2, // 2-6 timmar
        installationType: customer.product_type || 'Vattenrenare'
      }
    })

    // Installation metrics
    const installationMetrics = {
      completionRate: totalInstallations > 0 
        ? Math.round(((totalInstallations / (totalInstallations + pendingInstallations)) * 100) * 10) / 10
        : 0,
      averageInstallTime: averageInstallationTime,
      customerSatisfaction: 92.5, // Simulerat värde
      reworkRate: 2.1 // Procent installations som behövde omgöras
    }

    // Senaste slutförda installationer
    const recentCompletions = installationComplete
      .slice(0, 10)
      .map(customer => ({
        id: customer.id,
        customerName: customer.name,
        address: customer.address,
        completedDate: customer.updated_at,
        installationType: customer.product_type || 'Vattenrenare',
        rating: Math.floor(Math.random() * 2) + 4 // 4-5 stjärnor
      }))

    const stats = {
      totalInstallations,
      pendingInstallations,
      completedThisMonth,
      averageInstallationTime,
      monthlyData: monthlyArray,
      statusDistribution,
      upcomingInstallations,
      installationMetrics,
      recentCompletions,
      workloadSummary: {
        thisWeek: Math.min(pendingInstallations, 7),
        nextWeek: Math.min(Math.max(pendingInstallations - 7, 0), 7),
        backlog: Math.max(pendingInstallations - 14, 0)
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      range,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || 'Användare',
        role: userRole
      }
    })

  } catch (error) {
    console.error('Error in installations stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}