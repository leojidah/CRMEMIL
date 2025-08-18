#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

async function checkDatabase() {
  const supabaseUrl = 'https://wyxqyqlnzkgbigsfglou.supabase.co'
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eHF5cWxuemtnYmlnc2ZnbG91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIwMjM0MywiZXhwIjoyMDcwNzc4MzQzfQ.J3uN-yEzr8BiGkH4vRDcweoIog9UxakBgGF6SX746Ng'
  
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  
  console.log('🔍 Checking database structure...')
  
  try {
    // Check customers table
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .limit(5)
    
    if (customersError) {
      console.log('❌ Customers table error:', customersError.message)
    } else {
      console.log(`✅ Customers table exists with ${customers?.length || 0} records`)
      if (customers && customers.length > 0) {
        console.log('📋 Sample customer columns:', Object.keys(customers[0]))
      }
    }
    
    // Check if we can create sample data
    if (!customers || customers.length === 0) {
      console.log('\n🎯 Creating sample customer data...')
      
      const { data: users } = await supabase.auth.admin.listUsers()
      const demoSalesperson = users.users.find(u => u.email === 'demo.saljare@vattenmiljo.se')
      
      if (demoSalesperson) {
        const sampleCustomers = [
          {
            name: 'Kund 1 AB',
            email: 'kund1@example.com',
            phone: '070-123-4567',
            address: 'Testgatan 1, Stockholm',
            status: 'not_handled',
            priority: 'high',
            assigned_to: demoSalesperson.id,
            sale_amount: 25000,
            notes: 'Intresserad av vattenrenare'
          },
          {
            name: 'Kund 2 AB', 
            email: 'kund2@example.com',
            phone: '070-234-5678',
            address: 'Testgatan 2, Göteborg',
            status: 'sold',
            priority: 'medium',
            assigned_to: demoSalesperson.id,
            sale_amount: 32000,
            notes: 'Färdig installation'
          },
          {
            name: 'Kund 3 AB',
            email: 'kund3@example.com', 
            phone: '070-345-6789',
            address: 'Testgatan 3, Malmö',
            status: 'meeting_booked',
            priority: 'medium',
            assigned_to: demoSalesperson.id,
            sale_amount: 28000,
            notes: 'Möte nästa vecka'
          }
        ]
        
        for (const customer of sampleCustomers) {
          const { error } = await supabase
            .from('customers')
            .insert(customer)
          
          if (error) {
            console.log(`   ❌ Failed to create ${customer.name}: ${error.message}`)
          } else {
            console.log(`   ✅ Created customer: ${customer.name}`)
          }
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Database check failed:', error)
  }
}

checkDatabase().catch(console.error)