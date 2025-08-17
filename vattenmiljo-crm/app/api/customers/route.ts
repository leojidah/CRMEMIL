import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, requireRole } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { CustomerFormData } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API: Starting GET /api/customers')
    console.log('📋 API: Request URL:', request.url)
    console.log('🍪 API: Raw cookie header:', request.headers.get('cookie') || 'No cookies')
    console.log('🔑 API: Authorization header:', request.headers.get('authorization') || 'No auth header')
    
    // DEBUG: Parse and analyze cookies
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim())
      console.log('🍪 API: Parsed cookies count:', cookies.length)
      
      const supabaseCookies = cookies.filter(c => c.includes('auth-token'))
      console.log('🔑 API: Supabase auth cookies found:', supabaseCookies.length)
      supabaseCookies.forEach(cookie => {
        const [name] = cookie.split('=')
        console.log(`🔑 API: Found Supabase cookie: ${name}`)
      })
    } else {
      console.log('❌ API: No cookie header received at all!')
    }
    
    // DEBUG: Check all request headers
    console.log('📋 API: All request headers:', Object.fromEntries(request.headers.entries()))
    
    // STEP 1: Test authentication
    console.log('🔐 API: Checking authentication...')
    const user = await getCurrentUser()
    
    if (!user) {
      console.log('❌ API: No authenticated user found')
      console.log('🔍 API: Auth check failed - returning 401')
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: 'No authenticated user found'
      }, { status: 401 })
    }

    console.log('✅ API: Authenticated user found!')
    console.log('👤 API: User details:', {
      email: user.email,
      role: user.role,
      id: user.id,
      isActive: user.isActive
    })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const offset = (page - 1) * limit

    // STEP 2: Test database connection
    console.log('🔗 API: Testing database connection...')
    
    try {
      // Test basic connection first
      const { data: connectionTest, error: connectionError } = await supabaseAdmin
        .from('customers')
        .select('count', { count: 'exact', head: true })
      
      if (connectionError) {
        console.log('❌ API: Database connection failed:', connectionError)
        return NextResponse.json({ 
          error: 'Database connection failed',
          details: connectionError.message 
        }, { status: 500 })
      }
      
      console.log('✅ API: Database connected! Total customers:', connectionTest?.length || 'unknown')
    } catch (dbError) {
      console.log('💥 API: Database connection exception:', dbError)
      return NextResponse.json({ 
        error: 'Database exception',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 })
    }

    // STEP 3: Build and execute query
    console.log('📊 API: Building customer query...')
    let query = supabaseAdmin
      .from('customers')
      .select(`
        *,
        customer_notes(*),
        customer_files(*),
        customer_activities(*)
      `, { count: 'exact' })

    // Apply filters based on user role and params
    console.log('🔍 API: Applying filters:', { status, assignedTo, search })
    
    if (status && status !== 'all') {
      query = query.eq('status', status)
      console.log('📝 API: Added status filter:', status)
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
      console.log('📝 API: Added assignedTo filter:', assignedTo)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
      console.log('📝 API: Added search filter:', search)
    }

    // Role-based filtering using your role structure
    const userId = user.id
    console.log('🎯 API: Applying role-based filtering for:', user.role, 'User ID:', userId)
    
    switch (user.role) {
      case 'SALESPERSON':
        // Salespeople see their assigned customers and unassigned ones
        query = query.or(`assigned_to.eq.${userId},assigned_to.is.null`)
        console.log('✅ API: Applied SALESPERSON filter')
        break
      
      case 'INSTALLER':
        // Installers only see customers ready for installation
        query = query.in('status', ['ready_for_installation', 'installation_complete'])
        console.log('✅ API: Applied INSTALLER filter')
        break
      
      case 'INHOUSE':
      case 'ADMIN':
        // Internal staff and admins see all customers
        console.log('✅ API: No additional filter for INHOUSE/ADMIN')
        break
      
      default:
        console.log('⚠️ API: Unknown role, applying no filter')
    }

    console.log('⚡ API: Executing database query...')
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ API: Database error fetching customers:', error)
      console.log('🔍 API: Full error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    console.log('🎉 API: Successfully fetched', data?.length || 0, 'customers')
    console.log('📈 API: Total count from query:', count)
    
    if (data && data.length > 0) {
      console.log('📄 API: Sample customer:', {
        id: data[0].id,
        name: data[0].name,
        status: data[0].status,
        assigned_to: data[0].assigned_to
      })
    }

    return NextResponse.json({
      customers: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API: Starting POST /api/customers')
    
    // Check if user has permission to create customers
    const user = await requireRole(['SALESPERSON', 'INHOUSE', 'ADMIN'])
    
    console.log('API: Creating customer as user:', user.email, 'Role:', user.role)

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
    // Note: assigned_to is set to null for now since we're using Supabase Auth users
    // which don't exist in the custom users table. This will be fixed in a future migration.
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        name,
        email,
        phone,
        address,
        status: status || 'not_handled',
        priority: priority || 'medium',
        assigned_to: null // Temporarily null to avoid foreign key constraint
      })
      .select()
      .single()

    if (customerError) {
      console.error('API: Error creating customer:', customerError)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create customer'
      if (customerError.code === '23505') {
        errorMessage = 'A customer with this email already exists'
      } else if (customerError.code === '23503') {
        errorMessage = 'Invalid user assignment - user does not exist'
      } else if (customerError.message.includes('violates check constraint')) {
        errorMessage = 'Invalid data - please check status, priority, and other field values'
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: customerError.message,
        code: customerError.code
      }, { status: 500 })
    }

    // Add initial note if provided
    if (notes && notes.trim()) {
      // Note: author_id temporarily set to null due to Supabase Auth vs custom users table mismatch
      await supabaseAdmin
        .from('customer_notes')
        .insert({
          customer_id: customer.id,
          content: notes,
          author: user.name || user.email,
          author_id: null // Temporarily null to avoid foreign key constraint
        })
    }

    // Log activity
    // Note: performed_by_id temporarily set to null due to Supabase Auth vs custom users table mismatch
    await supabaseAdmin
      .from('customer_activities')
      .insert({
        customer_id: customer.id,
        type: 'custom',
        title: 'Customer created',
        description: `Customer ${name} was created`,
        performed_by: user.name || user.email,
        performed_by_id: null // Temporarily null to avoid foreign key constraint
      })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (error instanceof Error && error.message.includes('Access denied')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    console.error('API: Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}