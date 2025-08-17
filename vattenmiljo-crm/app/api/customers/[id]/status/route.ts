import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, UnauthorizedError } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase-server'
import { CustomerStatus } from '@/lib/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status }: { status: CustomerStatus } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Get Supabase client
    const supabase = createServerClient()

    // Role-based status transition validation
    const userRole = user.role
    const allowedTransitions: Record<string, CustomerStatus[]> = {
      SALESPERSON: ['not_handled', 'meeting', 'sales'],
      INHOUSE: ['sales', 'done'],
      INSTALLER: ['done', 'archived'],
      ADMIN: ['not_handled', 'meeting', 'sales', 'done', 'archived']
    }

    if (!allowedTransitions[userRole]?.includes(status)) {
      return NextResponse.json(
        { error: `${userRole} cannot set status to ${status}` },
        { status: 403 }
      )
    }

    // Get current customer to check current status
    const { data: currentCustomer } = await supabase
      .from('customers')
      .select('status, name')
      .eq('id', params.id)
      .single()

    if (!currentCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Update customer status
    const { data: customer, error } = await supabase
      .from('customers')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating customer status:', error)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    // Log detailed activity
    const statusMessages: Record<CustomerStatus, string> = {
      not_handled: 'Customer marked as not handled',
      meeting: 'Meeting scheduled with customer',
      sales: 'Customer moved to sales process',
      done: 'Customer ready for installation',
      archived: 'Customer archived'
    }

    await supabase
      .from('customer_activities')
      .insert({
        customer_id: params.id,
        type: 'status_change',
        title: 'Status updated',
        description: statusMessages[status],
        performed_by: user.name,
        performed_by_id: user.id,
        metadata: {
          previous_status: currentCustomer.status,
          new_status: status,
          changed_by_role: userRole
        }
      })

    return NextResponse.json({ 
      customer,
      message: `Status updated to ${status}` 
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}