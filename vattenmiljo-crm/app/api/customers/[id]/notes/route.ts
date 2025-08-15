import { NextRequest, NextResponse } from 'next/server'
import { auth } from 'next/server'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: notes, error } = await supabaseAdmin
      .from('customer_notes')
      .select('*')
      .eq('customer_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    }

    return NextResponse.json({ notes })
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
    const session = await auth(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, isPrivate = false } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 })
    }

    const { data: note, error } = await supabaseAdmin
      .from('customer_notes')
      .insert({
        customer_id: params.id,
        content: content.trim(),
        author: session.user.name,
        author_id: session.user.id,
        is_private: isPrivate
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating note:', error)
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
    }

    // Log activity
    await supabaseAdmin
      .from('customer_activities')
      .insert({
        customer_id: params.id,
        type: 'note_added',
        title: 'Note added',
        description: `${isPrivate ? 'Private note' : 'Note'} added by ${session.user.name}`,
        performed_by: session.user.name,
        performed_by_id: session.user.id
      })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}