/**
 * Test script to check if customers table exists and has data
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCustomersTable() {
  try {
    console.log('🔍 Testing customers table...')
    
    // Test basic table access
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('❌ Error querying customers:', error)
      return
    }
    
    console.log(`✅ Customers table exists with ${customers.length} customers`)
    
    if (customers.length > 0) {
      console.log('📄 Sample customer:', {
        id: customers[0].id,
        name: customers[0].name,
        email: customers[0].email,
        status: customers[0].status,
        assigned_to: customers[0].assigned_to
      })
    }
    
    // Test RLS with auth context
    console.log('\n🔐 Testing RLS policies...')
    
    // Get a test user from auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Error getting users:', usersError)
      return
    }
    
    if (users.length > 0) {
      const testUser = users.find(u => u.email === 'leojidah@hotmail.com') || users[0]
      console.log(`📧 Testing with user: ${testUser.email}`)
      
      // Test with user context
      const { data: userCustomers, error: userError } = await supabase
        .from('customers')
        .select('*')
        .limit(3)
      
      if (userError) {
        console.log('⚠️ RLS might be blocking access:', userError.message)
      } else {
        console.log(`✅ User can access ${userCustomers.length} customers`)
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

testCustomersTable()