// Test admin login and API access
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin login...\n')
    
    // Step 1: Login with admin credentials
    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@vattenmiljo.se',
      password: 'TempPassword123!'
    })
    
    if (loginError) {
      console.error('❌ Login failed:', loginError.message)
      return
    }
    
    console.log('✅ Login successful!')
    console.log('👤 User ID:', authData.user.id)
    console.log('📧 Email:', authData.user.email)
    console.log('🎭 Role:', authData.user.user_metadata.role)
    console.log('🔑 Access Token:', authData.session.access_token ? 'Present' : 'Missing')
    
    // Step 2: Test API call with authentication
    console.log('\n📋 Testing authenticated API call...')
    
    try {
      const response = await fetch('http://localhost:3002/api/customers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.session.access_token}`
        },
        credentials: 'include'
      })
      
      console.log('📊 API Response Status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ API call successful!')
        console.log('📄 Customers found:', result.customers ? result.customers.length : 0)
      } else {
        const errorResult = await response.json()
        console.error('❌ API call failed:', errorResult)
      }
    } catch (fetchError) {
      console.error('💥 Fetch error:', fetchError.message)
    }
    
    // Step 3: Test customer creation
    console.log('\n📋 Testing customer creation...')
    
    const testCustomer = {
      name: `Test Customer ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      phone: '070-123-4567',
      address: 'Test Address 123',
      status: 'not_handled',
      priority: 'medium',
      notes: 'Created via test script'
    }
    
    try {
      const createResponse = await fetch('http://localhost:3002/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify(testCustomer)
      })
      
      console.log('📊 Create Response Status:', createResponse.status)
      
      if (createResponse.ok) {
        const createResult = await createResponse.json()
        console.log('✅ Customer creation successful!')
        console.log('👤 New customer:', createResult.customer.name)
      } else {
        const createError = await createResponse.json()
        console.error('❌ Customer creation failed:', createError)
      }
    } catch (createFetchError) {
      console.error('💥 Create fetch error:', createFetchError.message)
    }
    
    // Step 4: Sign out
    console.log('\n🚪 Signing out...')
    await supabase.auth.signOut()
    console.log('✅ Signed out successfully')
    
  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

testAdminLogin()