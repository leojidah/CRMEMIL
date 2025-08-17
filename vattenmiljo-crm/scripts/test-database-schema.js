// Test script to check if database migrations have been applied
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Present' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDatabaseSchema() {
  console.log('🔍 Testing database schema...')
  
  try {
    // Test 1: Check if new customer status enum values exist
    console.log('\n📋 Test 1: Customer Status Enum Values')
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, name, status')
      .limit(5)
    
    if (customerError) {
      console.error('❌ Error fetching customers:', customerError.message)
    } else {
      console.log('✅ Successfully fetched customers')
      console.log('📊 Sample customer statuses:', customers.map(c => c.status))
    }
    
    // Test 2: Try to create a customer with new status values
    console.log('\n📋 Test 2: Creating Customer with New Status')
    const testCustomer = {
      name: 'Test Schema Customer',
      phone: '070-000-0000',
      email: 'test@schema.com',
      status: 'meeting_booked', // This should work if migration 002 is applied
      priority: 'medium'
    }
    
    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert(testCustomer)
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Error creating test customer:', createError.message)
      console.error('📄 Full error:', createError)
      
      if (createError.message.includes('invalid input value') || createError.message.includes('violates check constraint')) {
        console.error('🚨 SCHEMA ISSUE: Migrations 002 not applied - old status enum still in use!')
      }
    } else {
      console.log('✅ Successfully created test customer with new status')
      console.log('👤 Customer:', newCustomer)
      
      // Clean up - delete the test customer
      await supabase
        .from('customers')
        .delete()
        .eq('id', newCustomer.id)
      console.log('🧹 Cleaned up test customer')
    }
    
    // Test 3: Check if new tables exist (from migration 002)
    console.log('\n📋 Test 3: New Tables from Migration 002')
    const tablesToCheck = ['meetings', 'quotations', 'water_tests', 'installations', 'notifications']
    
    for (const table of tablesToCheck) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('id')
          .limit(1)
          
        if (tableError) {
          console.error(`❌ Table '${table}' not accessible:`, tableError.message)
        } else {
          console.log(`✅ Table '${table}' exists and accessible`)
        }
      } catch (err) {
        console.error(`❌ Exception testing table '${table}':`, err.message)
      }
    }
    
    // Test 4: Test auth uid() function (migration 003)
    console.log('\n📋 Test 4: RLS Policies Test')
    // This test will fail if not authenticated, but that's expected
    const { data: rlsTest, error: rlsError } = await supabase
      .from('customers')
      .select('id')
      .limit(1)
    
    if (rlsError) {
      console.log('ℹ️ RLS policies active (expected for service role):', rlsError.message)
    } else {
      console.log('✅ RLS policies allow service role access')
    }
    
  } catch (error) {
    console.error('💥 Unexpected error during schema test:', error)
  }
}

// Run the test
testDatabaseSchema()