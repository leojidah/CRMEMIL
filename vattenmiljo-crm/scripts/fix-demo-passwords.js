#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

async function fixDemoPasswords() {
  const supabaseUrl = 'https://wyxqyqlnzkgbigsfglou.supabase.co'
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eHF5cWxuemtnYmlnc2ZnbG91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIwMjM0MywiZXhwIjoyMDcwNzc4MzQzfQ.J3uN-yEzr8BiGkH4vRDcweoIog9UxakBgGF6SX746Ng'
  
  console.log('🔧 Fixing demo user passwords...')
  
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  
  try {
    const { data: users } = await supabase.auth.admin.listUsers()
    
    const demoUsers = users.users.filter(u => 
      u.email?.includes('demo.') && u.email?.includes('@vattenmiljo.se')
    )
    
    console.log(`Found ${demoUsers.length} demo users`)
    
    for (const user of demoUsers) {
      console.log(`\n🔑 Updating password for: ${user.email}`)
      
      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        password: 'demo123456'
      })
      
      if (error) {
        console.log(`   ❌ Failed to update password: ${error.message}`)
      } else {
        console.log(`   ✅ Password updated successfully`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    console.log('\n🎯 Password update completed!')
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

fixDemoPasswords().catch(console.error)