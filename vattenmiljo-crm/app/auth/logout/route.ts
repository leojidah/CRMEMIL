// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  
  // Ta bort session cookie
  response.cookies.set('auth-user', '', {
    httpOnly: true,
    expires: new Date(0)
  })
  
  return response
}