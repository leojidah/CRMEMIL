import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'E-post och lösenord krävs' },
        { status: 400 }
      )
    }

    // Skapa användare i Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Bekräfta direkt utan email
      user_metadata: {
        name: name || email.split('@')[0],
        role: 'ADMIN' // Sätt som admin för leojidah@hotmail.com
      }
    })

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Användare skapad framgångsrikt',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name
      }
    })

  } catch (error) {
    console.error('Setup API error:', error)
    return NextResponse.json(
      { success: false, message: 'Ett serverfel uppstod' },
      { status: 500 }
    )
  }
}