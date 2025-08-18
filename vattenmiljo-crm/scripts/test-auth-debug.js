#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

// Test Supabase Auth and API endpoints
async function testAuth() {
  const supabaseUrl = 'https://wyxqyqlnzkgbigsfglou.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eHF5cWxuemtnYmlnc2ZnbG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDIzNDMsImV4cCI6MjA3MDc3ODM0M30.oKjMx_ju5KyJ1LighWYQrYGs1SqK0SvRPCAJ50-0MKI'
  
  console.log('🔍 Testing Supabase Auth Configuration...')
  console.log('URL:', supabaseUrl)
  console.log('Key length:', supabaseAnonKey.length)
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Test 1: List demo users
    console.log('\n📋 Test 1: Checking for demo users...')
    
    // Test sign in with demo user
    console.log('\n🔐 Test 2: Testing demo user login...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'demo.saljare@vattenmiljo.se',
      password: 'demo123'
    })
    
    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message)
      return
    }
    
    console.log('✅ Sign in successful!')
    console.log('User:', signInData.user?.email)
    console.log('Role:', signInData.user?.user_metadata?.role)
    console.log('Token length:', signInData.session?.access_token?.length)
    
    // Test 3: API call with token
    console.log('\n🌐 Test 3: Testing API call with token...')
    
    const response = await fetch('http://localhost:3000/api/stats/personal', {
      headers: {
        'Authorization': `Bearer ${signInData.session.access_token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('API Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API call successful!')
      console.log('Data keys:', Object.keys(data))
    } else {
      const errorText = await response.text()
      console.log('❌ API call failed:', errorText)
    }
    
    // Clean up
    await supabase.auth.signOut()
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testAuth().catch(console.error)