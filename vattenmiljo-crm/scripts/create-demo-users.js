#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

// Create demo users for all roles
async function createDemoUsers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wyxqyqlnzkgbigsfglou.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eHF5cWxuemtnYmlnc2ZnbG91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIwMjM0MywiZXhwIjoyMDcwNzc4MzQzfQ.J3uN-yEzr8BiGkH4vRDcweoIog9UxakBgGF6SX746Ng'
  
  console.log('🔧 Creating demo users for all roles...')
  console.log('Using URL:', supabaseUrl)
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  const demoUsers = [
    {
      email: 'demo.saljare@vattenmiljo.se',
      password: 'demo123456',
      role: 'SALESPERSON',
      name: 'Demo Säljare'
    },
    {
      email: 'demo.inhouse@vattenmiljo.se', 
      password: 'demo123456',
      role: 'INHOUSE',
      name: 'Demo Inhouse'
    },
    {
      email: 'demo.montor@vattenmiljo.se',
      password: 'demo123456', 
      role: 'INSTALLER',
      name: 'Demo Montör'
    },
    {
      email: 'demo.admin@vattenmiljo.se',
      password: 'demo123456',
      role: 'ADMIN', 
      name: 'Demo Admin'
    }
  ]
  
  for (const user of demoUsers) {
    try {
      console.log(`\n📧 Creating user: ${user.email} (${user.role})`)
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: {
          name: user.name,
          role: user.role,
          created_by: 'demo-script'
        },
        email_confirm: true // Skip email confirmation for demo
      })
      
      if (error) {
        if (error.message.includes('already been registered')) {
          console.log(`   ℹ️  User already exists: ${user.email}`)
          
          // Update existing user's metadata
          const { data: users } = await supabase.auth.admin.listUsers()
          const existingUser = users.users.find(u => u.email === user.email)
          
          if (existingUser) {
            const { error: updateError } = await supabase.auth.admin.updateUserById(
              existingUser.id,
              {
                user_metadata: {
                  name: user.name,
                  role: user.role,
                  updated_by: 'demo-script'
                }
              }
            )
            
            if (updateError) {
              console.log(`   ❌ Failed to update metadata: ${updateError.message}`)
            } else {
              console.log(`   ✅ Updated metadata for: ${user.email}`)
            }
          }
        } else {
          console.log(`   ❌ Error creating user: ${error.message}`)
        }
      } else {
        console.log(`   ✅ Successfully created: ${user.email}`)
        console.log(`   🆔 User ID: ${data.user?.id}`)
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error(`   💥 Exception creating ${user.email}:`, error.message)
    }
  }
  
  console.log('\n🎯 Demo users creation completed!')
  console.log('\n📋 Login credentials:')
  demoUsers.forEach(user => {
    console.log(`   ${user.role}: ${user.email} / ${user.password}`)
  })
  
  console.log('\n🔍 Verifying users...')
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.log('❌ Failed to list users:', error.message)
    } else {
      console.log(`✅ Total users in system: ${users.users.length}`)
      
      const demoUsersInSystem = users.users.filter(u => 
        u.email?.includes('demo.') && u.email?.includes('@vattenmiljo.se')
      )
      
      console.log(`✅ Demo users found: ${demoUsersInSystem.length}`)
      
      demoUsersInSystem.forEach(user => {
        console.log(`   - ${user.email} (${user.user_metadata?.role || 'No role'}) - ${user.user_metadata?.name}`)
      })
    }
  } catch (error) {
    console.error('Error listing users:', error)
  }
}

createDemoUsers().catch(console.error)