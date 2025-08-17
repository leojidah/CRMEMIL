// Test script to debug customer creation API with authentication
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCustomerCreationAPI() {
  console.log('🔍 Testing Customer Creation API with Authentication...')
  
  try {
    // Step 1: Test if we can get a session
    console.log('\n📋 Step 1: Check current session')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message)
    }
    
    if (!sessionData.session) {
      console.log('ℹ️ No active session found')
      console.log('🔑 This might be the issue - the KanbanBoard needs an authenticated session')
    } else {
      console.log('✅ Active session found')
      console.log('👤 User ID:', sessionData.session.user.id)
      console.log('📧 Email:', sessionData.session.user.email)
      console.log('🔑 Access Token:', sessionData.session.access_token ? 'Present' : 'Missing')
    }
    
    // Step 2: Test direct API call to /api/customers (GET)
    console.log('\n📋 Step 2: Test GET /api/customers')
    
    try {
      const response = await fetch('http://localhost:3002/api/customers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionData.session?.access_token ? `Bearer ${sessionData.session.access_token}` : ''
        },
        credentials: 'include'
      })
      
      console.log('📊 GET Response Status:', response.status)
      const getResult = await response.json()
      console.log('📄 GET Response:', getResult)
      
      if (!response.ok) {
        console.error('❌ GET request failed')
      } else {
        console.log('✅ GET request successful')
      }
    } catch (fetchError) {
      console.error('💥 Fetch error during GET:', fetchError.message)
    }
    
    // Step 3: Test direct API call to /api/customers (POST)
    console.log('\n📋 Step 3: Test POST /api/customers')
    
    const testCustomer = {
      name: `API Test Customer ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      phone: '070-123-4567',
      address: 'Test Address 123',
      status: 'not_handled',
      priority: 'medium',
      notes: 'Created via API test'
    }
    
    try {
      const postResponse = await fetch('http://localhost:3002/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionData.session?.access_token ? `Bearer ${sessionData.session.access_token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify(testCustomer)
      })
      
      console.log('📊 POST Response Status:', postResponse.status)
      console.log('📄 POST Response Headers:', Object.fromEntries(postResponse.headers.entries()))
      
      const postResult = await postResponse.text() // Get as text first to see raw response
      console.log('📄 POST Raw Response:', postResult)
      
      try {
        const jsonResult = JSON.parse(postResult)
        console.log('📄 POST Parsed Response:', jsonResult)
      } catch (parseError) {
        console.error('❌ Failed to parse POST response as JSON:', parseError.message)
      }
      
      if (!postResponse.ok) {
        console.error('❌ POST request failed')
      } else {
        console.log('✅ POST request successful')
      }
    } catch (fetchError) {
      console.error('💥 Fetch error during POST:', fetchError.message)
    }
    
    // Step 4: Test auth headers function simulation
    console.log('\n📋 Step 4: Simulate KanbanBoard buildAuthHeaders()')
    
    const buildAuthHeaders = (accessToken) => {
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }
      
      return headers
    }
    
    const simulatedHeaders = buildAuthHeaders(sessionData.session?.access_token)
    console.log('🔧 Simulated headers:', simulatedHeaders)
    
  } catch (error) {
    console.error('💥 Unexpected error during API test:', error)
  }
}

// Run the test
testCustomerCreationAPI()