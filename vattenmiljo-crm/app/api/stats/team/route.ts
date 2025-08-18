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

    // Kontrollera användarroll - endast INHOUSE och ADMIN kan se teamstatistik
    const userRole = user.user_metadata?.role || 'ADMIN'
    if (userRole !== 'INHOUSE' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only inhouse personnel and admins can view team statistics.' },
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

    // Hämta alla kunder för teamstatistik
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

    // Hämta alla användare för att bygga teamstatistik
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      // Fallback: simulera team members
      var teamMembers = [
        { id: user.id, email: user.email, name: user.user_metadata?.name || 'Användare', role: userRole }
      ]
    } else {
      var teamMembers = users
        .filter(u => u.user_metadata?.role === 'SALESPERSON')
        .map(u => ({
          id: u.id,
          email: u.email || '',
          name: u.user_metadata?.name || u.email?.split('@')[0] || 'Användare',
          role: u.user_metadata?.role || 'SALESPERSON'
        }))
    }

    // Om inga säljare hittades, lägg till current user som exempel
    if (teamMembers.length === 0) {
      teamMembers = [
        { id: user.id, email: user.email || '', name: user.user_metadata?.name || 'Användare', role: userRole }
      ]
    }

    const allCustomers = customers || []
    
    // Beräkna statistik per teammedlem
    const salespeople = teamMembers.map((member, index) => {
      // Filtrera kunder för denna säljare (antingen assigned_to eller simulera för demo)
      const memberCustomers = allCustomers.filter(c => 
        c.assigned_to === member.id || (!c.assigned_to && index === 0) // Fallback för demo
      )
      
      const soldCustomers = memberCustomers.filter(c => c.status === 'sold' || c.status === 'installation_complete')
      const totalSales = soldCustomers.length
      const totalRevenue = soldCustomers.reduce((sum, customer) => sum + (customer.sale_amount || 0), 0)
      const totalCustomers = memberCustomers.length
      
      // Beräkna konverteringsgrad
      const potentialCustomers = memberCustomers.filter(c => 
        ['not_handled', 'meeting_booked', 'quotation_stage', 'extended_water_test'].includes(c.status)
      )
      const conversionRate = (potentialCustomers.length + totalSales) > 0 
        ? (totalSales / (potentialCustomers.length + totalSales)) * 100 
        : 0

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        totalSales,
        totalRevenue,
        conversionRate: Math.round(conversionRate * 10) / 10,
        totalCustomers,
        rank: 0 // Kommer att sättas senare
      }
    })

    // Sortera och sätt ranking baserat på totala försäljningar
    salespeople.sort((a, b) => b.totalSales - a.totalSales)
    salespeople.forEach((member, index) => {
      member.rank = index + 1
    })

    // Beräkna team-övergripande statistik
    const totalTeamSales = salespeople.reduce((sum, member) => sum + member.totalSales, 0)
    const totalTeamRevenue = salespeople.reduce((sum, member) => sum + member.totalRevenue, 0)
    const totalTeamCustomers = salespeople.reduce((sum, member) => sum + member.totalCustomers, 0)
    const averageConversionRate = salespeople.length > 0 
      ? salespeople.reduce((sum, member) => sum + member.conversionRate, 0) / salespeople.length 
      : 0

    // Gruppera data per månad för diagram
    const monthlyData: { [key: string]: { totalSales: number, totalRevenue: number, totalCustomers: number, conversions: number[] } } = {}
    
    allCustomers.forEach(customer => {
      const date = new Date(customer.created_at)
      const monthKey = date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { totalSales: 0, totalRevenue: 0, totalCustomers: 0, conversions: [] }
      }
      
      monthlyData[monthKey].totalCustomers += 1
      
      if (customer.status === 'sold' || customer.status === 'installation_complete') {
        monthlyData[monthKey].totalSales += 1
        monthlyData[monthKey].totalRevenue += customer.sale_amount || 0
        monthlyData[monthKey].conversions.push(1)
      } else {
        monthlyData[monthKey].conversions.push(0)
      }
    })

    // Konvertera till array och beräkna genomsnittlig konvertering per månad
    const monthlyArray = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        totalSales: data.totalSales,
        totalRevenue: data.totalRevenue,
        totalCustomers: data.totalCustomers,
        averageConversionRate: data.conversions.length > 0 
          ? (data.conversions.reduce((a, b) => a + b, 0) / data.conversions.length) * 100 
          : 0
      }))
      .sort((a, b) => new Date(`01 ${a.month}`).getTime() - new Date(`01 ${b.month}`).getTime())

    // Status distribution
    const statusCounts = {
      not_handled: 0,
      meeting_booked: 0,
      quotation_stage: 0,
      extended_water_test: 0,
      sold: 0,
      ready_for_installation: 0,
      installation_complete: 0
    }

    allCustomers.forEach(customer => {
      if (statusCounts.hasOwnProperty(customer.status)) {
        statusCounts[customer.status as keyof typeof statusCounts] += 1
      }
    })

    const statusDistribution = [
      { status: 'not_handled', label: 'Ej hanterat', count: statusCounts.not_handled },
      { status: 'meeting_booked', label: 'Möte bokat', count: statusCounts.meeting_booked },
      { status: 'quotation_stage', label: 'Förslag sänt', count: statusCounts.quotation_stage },
      { status: 'extended_water_test', label: 'Vattenprov', count: statusCounts.extended_water_test },
      { status: 'sold', label: 'Såld', count: statusCounts.sold },
      { status: 'ready_for_installation', label: 'Klar för installation', count: statusCounts.ready_for_installation },
      { status: 'installation_complete', label: 'Installerad', count: statusCounts.installation_complete }
    ].filter(s => s.count > 0) // Filtrera bort statusar med 0 kunder
    .map(s => ({
      ...s,
      percentage: totalTeamCustomers > 0 ? (s.count / totalTeamCustomers) * 100 : 0
    }))

    // Top performers
    const topPerformers = {
      sales: salespeople[0] || salespeople.find(s => s.totalSales > 0) || salespeople[0],
      revenue: [...salespeople].sort((a, b) => b.totalRevenue - a.totalRevenue)[0] || salespeople[0],
      conversion: [...salespeople].sort((a, b) => b.conversionRate - a.conversionRate)[0] || salespeople[0]
    }

    // Team metrics (simulerade värden för demo)
    const teamMetrics = {
      avgDealSize: totalTeamSales > 0 ? Math.round(totalTeamRevenue / totalTeamSales) : 0,
      totalPipeline: allCustomers
        .filter(c => ['not_handled', 'meeting_booked', 'quotation_stage', 'extended_water_test'].includes(c.status))
        .reduce((sum, c) => sum + (c.estimated_value || c.sale_amount || 25000), 0), // Antag 25k om inget värde
      salesVelocity: 21, // Genomsnittligt antal dagar från lead till stängd affär
      customerSatisfaction: 87.5 // Procent nöjda kunder
    }

    // Team targets (simulerade värden)
    const teamTarget = 200000 // 200,000 SEK per månad för hela teamet
    const currentMonth = new Date()
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const teamAchieved = allCustomers
      .filter(c => (c.status === 'sold' || c.status === 'installation_complete') && new Date(c.updated_at) >= monthStart)
      .reduce((sum, c) => sum + (c.sale_amount || 0), 0)

    const stats = {
      totalTeamSales,
      totalTeamRevenue,
      totalTeamCustomers,
      averageConversionRate: Math.round(averageConversionRate * 10) / 10,
      teamTarget,
      teamAchieved,
      monthlyData: monthlyArray,
      salespeople,
      topPerformers,
      statusDistribution,
      teamMetrics
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
      },
      teamSize: salespeople.length
    })

  } catch (error) {
    console.error('Error in team stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}