/**
 * Test script to verify API works with authentication
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

async function testAPIWithAuth() {
  try {
    console.log('🔐 Testing API with authentication...')
    
    // Create Supabase client (same as frontend)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Try to sign in with the test user
    console.log('📧 Signing in as leojidah@hotmail.com...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'leojidah@hotmail.com',
      password: 'test123' // assuming this is the password
    })
    
    if (authError) {
      console.error('❌ Auth failed:', authError.message)
      return
    }
    
    console.log('✅ Signed in successfully!')
    console.log('👤 User:', authData.user.email)
    console.log('🔑 Session token:', authData.session.access_token ? 'Present' : 'Missing')
    
    // Get the session token for API call
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error('❌ No session found after login')
      return
    }
    
    // Now test the API endpoint with the session
    console.log('🌐 Testing /api/customers endpoint...')
    
    // Make request with session cookies (simulate browser)
    const response = await fetch('http://localhost:3000/api/customers', {
      headers: {
        'Cookie': `sb-wyxqyqlnzkgbigsfglou-auth-token=${JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          user: session.user
        })}`,
        'Authorization': `Bearer ${session.access_token}`
      }
    })
    
    console.log('📊 API Response Status:', response.status)
    console.log('📋 API Response Headers:', Object.fromEntries(response.headers.entries()))
    
    const responseData = await response.json()
    console.log('📄 API Response Data:', responseData)
    
    if (response.ok) {
      console.log('🎉 API call successful!')
      if (responseData.customers) {
        console.log('👥 Customers returned:', responseData.customers.length)
      }
    } else {
      console.log('❌ API call failed')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testAPIWithAuth()