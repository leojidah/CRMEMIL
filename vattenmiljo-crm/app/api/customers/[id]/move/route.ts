import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { CustomerStatus } from '@/lib/types'

interface MoveCustomerRequest {
  status: CustomerStatus
  movedBy?: string
  method: 'kanban_drag_drop' | 'manual'
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { status, method = 'manual' }: MoveCustomerRequest = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status
    const validStatuses: CustomerStatus[] = [
      'not_handled', 'no_answer', 'call_again', 'not_interested', 
      'meeting_booked', 'quotation_stage', 'extended_water_test', 
      'sold', 'ready_for_installation', 'installation_complete', 'archived'
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get current customer to check permissions and current status
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Role-based permission checks
    const userRole = session.user.user_metadata?.role || 'salesperson'
    const currentStatus = customer.status

    // Define valid transitions by role
    const validTransitions: Record<string, Record<CustomerStatus, CustomerStatus[]>> = {
      salesperson: {
        'not_handled': ['no_answer', 'call_again', 'not_interested', 'meeting_booked'],
        'no_answer': ['call_again', 'not_interested', 'meeting_booked'],
        'call_again': ['no_answer', 'not_interested', 'meeting_booked'],
        'meeting_booked': ['quotation_stage', 'not_interested'],
        'quotation_stage': ['extended_water_test', 'sold', 'not_interested'],
        'extended_water_test': ['sold', 'not_interested'],
        'sold': [], // Salespeople can't move from sold
        'ready_for_installation': [],
        'installation_complete': [],
        'not_interested': ['call_again'], // Can reactivate
        'archived': []
      },
      internal: {
        'not_handled': ['no_answer', 'call_again', 'not_interested', 'meeting_booked'],
        'no_answer': ['call_again', 'not_interested', 'meeting_booked'],
        'call_again': ['no_answer', 'not_interested', 'meeting_booked'],
        'meeting_booked': ['quotation_stage', 'not_interested'],
        'quotation_stage': ['extended_water_test', 'sold', 'not_interested'],
        'extended_water_test': ['sold', 'not_interested'],
        'sold': ['ready_for_installation'],
        'ready_for_installation': ['installation_complete'],
        'installation_complete': ['archived'],
        'not_interested': ['archived'],
        'archived': []
      },
      installer: {
        'not_handled': [],
        'no_answer': [],
        'call_again': [],
        'meeting_booked': [],
        'quotation_stage': [],
        'extended_water_test': [],
        'sold': [],
        'ready_for_installation': ['installation_complete'],
        'installation_complete': [],
        'not_interested': [],
        'archived': []
      },
      admin: {
        // Admin can move between any statuses
        'not_handled': validStatuses.filter(s => s !== 'not_handled'),
        'no_answer': validStatuses.filter(s => s !== 'no_answer'),
        'call_again': validStatuses.filter(s => s !== 'call_again'),
        'meeting_booked': validStatuses.filter(s => s !== 'meeting_booked'),
        'quotation_stage': validStatuses.filter(s => s !== 'quotation_stage'),
        'extended_water_test': validStatuses.filter(s => s !== 'extended_water_test'),
        'sold': validStatuses.filter(s => s !== 'sold'),
        'ready_for_installation': validStatuses.filter(s => s !== 'ready_for_installation'),
        'installation_complete': validStatuses.filter(s => s !== 'installation_complete'),
        'not_interested': validStatuses.filter(s => s !== 'not_interested'),
        'archived': validStatuses.filter(s => s !== 'archived')
      }
    }

    const allowedTransitions = validTransitions[userRole]?.[currentStatus] || []
    if (!allowedTransitions.includes(status)) {
      return NextResponse.json({ 
        error: `Cannot move customer from ${currentStatus} to ${status} with role ${userRole}` 
      }, { status: 403 })
    }

    // Check if user can modify this customer (ownership or role-based access)
    if (userRole === 'salesperson') {
      if (customer.assigned_to !== session.user.id && customer.assigned_to !== null) {
        return NextResponse.json({ 
          error: 'You can only modify customers assigned to you' 
        }, { status: 403 })
      }
    }

    // Update the customer status
    const { data: updatedCustomer, error: updateError } = await supabase
      .from('customers')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
        // Assign customer to user if not already assigned and they're a salesperson
        ...(userRole === 'salesperson' && !customer.assigned_to ? { assigned_to: session.user.id } : {})
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating customer:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update customer status' 
      }, { status: 500 })
    }

    // Log activity
    const { error: activityError } = await supabase
      .from('customer_activities')
      .insert({
        customer_id: id,
        type: 'status_change',
        title: 'Status updated via Kanban',
        description: `Status changed from ${currentStatus} to ${status}`,
        performed_by: session.user.user_metadata?.name || session.user.email || 'Unknown User',
        performed_by_id: session.user.id,
        metadata: {
          previous_status: currentStatus,
          new_status: status,
          method: method
        }
      })

    if (activityError) {
      console.error('Error logging activity:', activityError)
      // Don't fail the request, just log the error
    }

    // Create notifications for status changes that require cross-department communication
    if (status === 'sold' || status === 'ready_for_installation') {
      const targetRoles = status === 'sold' ? ['internal'] : ['installer']
      
      // Get users with target roles
      const { data: targetUsers } = await supabase
        .from('users')
        .select('id')
        .in('role', targetRoles)
        .eq('is_active', true)

      if (targetUsers && targetUsers.length > 0) {
        const notifications = targetUsers.map(user => ({
          recipient_id: user.id,
          customer_id: id,
          type: 'customer_status_change',
          title: `Customer ${customer.name} status updated`,
          message: `${customer.name} moved to ${status}`,
          data: {
            customer_id: id,
            old_status: currentStatus,
            new_status: status,
            customer_name: customer.name
          }
        }))

        await supabase
          .from('notifications')
          .insert(notifications)
      }
    }

    return NextResponse.json({
      customer: updatedCustomer,
      message: `Customer status updated to ${status}`
    })

  } catch (error) {
    console.error('Error in move customer API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}