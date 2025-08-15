import { NextRequest, NextResponse } from 'next/server'
import { auth } from 'next/server'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { CustomerFormData } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select(`
        *,
        customer_notes(*),
        customer_files(*),
        customer_activities(*),
        assigned_user:assigned_to(name, email, role)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching customer:', error)
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: Partial<CustomerFormData> = await request.json()
    const updates: any = {}

    // Only include fields that are being updated
    if (body.name !== undefined) updates.name = body.name
    if (body.email !== undefined) updates.email = body.email
    if (body.phone !== undefined) updates.phone = body.phone
    if (body.address !== undefined) updates.address = body.address
    if (body.status !== undefined) updates.status = body.status
    if (body.priority !== undefined) updates.priority = body.priority
    if (body.assignedTo !== undefined) updates.assigned_to = body.assignedTo

    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating customer:', error)
      return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
    }

    // Add activity log for significant changes
    if (body.status) {
      await supabaseAdmin
        .from('customer_activities')
        .insert({
          customer_id: params.id,
          type: 'status_change',
          title: 'Status updated',
          description: `Status changed to ${body.status}`,
          performed_by: session.user.name,
          performed_by_id: session.user.id
        })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions - only internal users can delete customers
    if (session.user.role !== 'internal') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Instead of hard delete, we'll archive the customer
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .update({ status: 'archived' })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error archiving customer:', error)
      return NextResponse.json({ error: 'Failed to archive customer' }, { status: 500 })
    }

    // Log activity
    await supabaseAdmin
      .from('customer_activities')
      .insert({
        customer_id: params.id,
        type: 'custom',
        title: 'Customer archived',
        description: 'Customer was archived',
        performed_by: session.user.name,
        performed_by_id: session.user.id
      })

    return NextResponse.json({ message: 'Customer archived successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}