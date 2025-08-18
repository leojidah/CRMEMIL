import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-server'

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

    // Kontrollera användarroll
    const userRole = user.user_metadata?.role || 'ADMIN'
    if (userRole !== 'SALESPERSON' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only salespeople can view personal statistics.' },
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

    // För SALESPERSON-roll, filtrera endast deras egna kunder
    // För ADMIN, visa alla (men detta är personal stats så det borde vara för den inloggade användaren)
    const customerFilter = userRole === 'SALESPERSON' 
      ? `assigned_to.eq.${user.id}` 
      : `assigned_to.eq.${user.id}` // Även admins får sina egna personal stats

    // Hämta kunder och relaterad data
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

    // Filtrera kunderna baserat på assigned_to (om det finns)
    const filteredCustomers = userRole === 'SALESPERSON' 
      ? customers?.filter(c => c.assigned_to === user.id) || []
      : customers || []

    // Beräkna grundläggande statistik
    const totalCustomers = filteredCustomers.length
    const soldCustomers = filteredCustomers.filter(c => c.status === 'sold' || c.status === 'installation_complete')
    const totalSales = soldCustomers.length
    const totalRevenue = soldCustomers.reduce((sum, customer) => sum + (customer.sale_amount || 0), 0)
    const averageDealSize = totalSales > 0 ? totalRevenue / totalSales : 0
    
    // Beräkna konverteringsgrad
    const potentialCustomers = filteredCustomers.filter(c => 
      ['not_handled', 'meeting_booked', 'quotation_stage', 'extended_water_test'].includes(c.status)
    )
    const conversionRate = (potentialCustomers.length + totalSales) > 0 
      ? (totalSales / (potentialCustomers.length + totalSales)) * 100 
      : 0

    // Gruppera data per månad för diagram
    const monthlyData: { [key: string]: { sales: number, customers: number, revenue: number } } = {}
    
    filteredCustomers.forEach(customer => {
      const date = new Date(customer.created_at)
      const monthKey = date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { sales: 0, customers: 0, revenue: 0 }
      }
      
      monthlyData[monthKey].customers += 1
      
      if (customer.status === 'sold' || customer.status === 'installation_complete') {
        monthlyData[monthKey].sales += 1
        monthlyData[monthKey].revenue += customer.sale_amount || 0
      }
    })

    // Konvertera till array och sortera efter datum
    const monthlyArray = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(`01 ${a.month}`).getTime() - new Date(`01 ${b.month}`).getTime())

    // Status distribution
    const statusDistribution = [
      { status: 'not_handled', label: 'Ej hanterat', count: 0 },
      { status: 'meeting_booked', label: 'Möte bokat', count: 0 },
      { status: 'quotation_stage', label: 'Förslag sänt', count: 0 },
      { status: 'extended_water_test', label: 'Vattenprov', count: 0 },
      { status: 'sold', label: 'Såld', count: 0 },
      { status: 'installation_complete', label: 'Installerad', count: 0 }
    ]

    filteredCustomers.forEach(customer => {
      const statusItem = statusDistribution.find(s => s.status === customer.status)
      if (statusItem) {
        statusItem.count += 1
      }
    })

    // Filtrera bort statusar med 0 kunder
    const filteredStatusDistribution = statusDistribution.filter(s => s.count > 0)

    // Simulera månadsligt mål (i praktiken skulle detta komma från databas)
    const monthlyTarget = 50000 // 50,000 SEK per månad
    const currentMonth = new Date()
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const currentMonthRevenue = soldCustomers
      .filter(c => new Date(c.updated_at) >= monthStart)
      .reduce((sum, c) => sum + (c.sale_amount || 0), 0)

    // Simulera några achievements
    const recentAchievements = []
    if (totalSales >= 5) {
      recentAchievements.push({
        id: '1',
        title: '5 Försäljningar Uppnådda!',
        description: 'Du har gjort 5 eller fler försäljningar den här perioden.',
        date: new Date().toISOString()
      })
    }
    
    if (conversionRate >= 20) {
      recentAchievements.push({
        id: '2',
        title: 'Hög Konverteringsgrad',
        description: `Fantastisk konverteringsgrad på ${conversionRate.toFixed(1)}%!`,
        date: new Date().toISOString()
      })
    }

    if (currentMonthRevenue >= monthlyTarget) {
      recentAchievements.push({
        id: '3',
        title: 'Månadsligt Mål Uppnått!',
        description: 'Du har uppnått ditt månatliga försäljningsmål.',
        date: new Date().toISOString()
      })
    }

    const stats = {
      totalSales,
      totalCustomers,
      averageDealSize: Math.round(averageDealSize),
      conversionRate: Math.round(conversionRate * 10) / 10,
      monthlyData: monthlyArray,
      statusDistribution: filteredStatusDistribution,
      recentAchievements,
      targets: {
        monthly: monthlyTarget,
        achieved: currentMonthRevenue,
        percentage: Math.round((currentMonthRevenue / monthlyTarget) * 100)
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
    console.error('Error in personal stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}