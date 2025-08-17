import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { ActivityType } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify customer exists and user has access
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('id', params.id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Fetch customer activities
    const { data: activities, error } = await supabaseAdmin
      .from('customer_activities')
      .select('*')
      .eq('customer_id', params.id)
      .order('performed_at', { ascending: false })

    if (error) {
      console.error('Error fetching customer activities:', error)
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
    }

    // Transform database format to frontend format
    const transformedActivities = (activities || []).map(activity => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      performedBy: activity.performed_by,
      performedById: activity.performed_by_id,
      performedAt: activity.performed_at,
      metadata: activity.metadata
    }))

    return NextResponse.json({ activities: transformedActivities })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify customer exists
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('id', params.id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const body = await request.json()
    const { type, title, description, metadata } = body

    if (!type || !title) {
      return NextResponse.json({ 
        error: 'Missing required fields: type and title are required' 
      }, { status: 400 })
    }

    // Validate activity type
    const validTypes: ActivityType[] = [
      'status_change', 'note_added', 'file_upload', 'file_download', 'file_delete',
      'meeting_scheduled', 'call_made', 'email_sent', 'custom'
    ]
    
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: `Invalid activity type. Must be one of: ${validTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Create activity
    const { data: activity, error } = await supabaseAdmin
      .from('customer_activities')
      .insert({
        customer_id: params.id,
        type,
        title,
        description,
        performed_by: user.name || user.email || 'Unknown User',
        performed_by_id: user.id,
        metadata: metadata || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating activity:', error)
      return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
    }

    // Transform database format to frontend format
    const transformedActivity = {
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      performedBy: activity.performed_by,
      performedById: activity.performed_by_id,
      performedAt: activity.performed_at,
      metadata: activity.metadata
    }

    return NextResponse.json({ 
      message: 'Activity created successfully',
      activity: transformedActivity 
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}