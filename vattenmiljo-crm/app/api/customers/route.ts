import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CustomerFormData } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('customers')
      .select(`
        *,
        customer_notes(*),
        customer_files(*),
        customer_activities(*),
        assigned_user:assigned_to(name, email, role)
      `)

    // Apply filters based on user role and params
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // Role-based filtering
    const userRole = session.user.role
    if (userRole === 'salesperson') {
      // Salespeople see their assigned customers and unassigned ones
      query = query.or(`assigned_to.eq.${session.user.id},assigned_to.is.null`)
    } else if (userRole === 'installer') {
      // Installers only see customers ready for installation
      query = query.in('status', ['done', 'installed'])
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching customers:', error)
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }

    return NextResponse.json({
      customers: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    if (!['salesperson', 'internal'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body: CustomerFormData = await request.json()
    const { name, email, phone, address, status, priority, assignedTo, notes } = body

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    // Create customer
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        name,
        email,
        phone,
        address,
        status: status || 'not_handled',
        priority: priority || 'medium',
        assigned_to: assignedTo || session.user.id
      })
      .select()
      .single()

    if (customerError) {
      console.error('Error creating customer:', customerError)
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }

    // Add initial note if provided
    if (notes && notes.trim()) {
      await supabaseAdmin
        .from('customer_notes')
        .insert({
          customer_id: customer.id,
          content: notes,
          author: session.user.name,
          author_id: session.user.id
        })
    }

    // Log activity
    await supabaseAdmin
      .from('customer_activities')
      .insert({
        customer_id: customer.id,
        type: 'custom',
        title: 'Customer created',
        description: `Customer ${name} was created`,
        performed_by: session.user.name,
        performed_by_id: session.user.id
      })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}