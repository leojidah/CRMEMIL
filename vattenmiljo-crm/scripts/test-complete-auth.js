#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

async function testCompleteAuth() {
  const supabaseUrl = 'https://wyxqyqlnzkgbigsfglou.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eHF5cWxuemtnYmlnc2ZnbG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDIzNDMsImV4cCI6MjA3MDc3ODM0M30.oKjMx_ju5KyJ1LighWYQrYGs1SqK0SvRPCAJ50-0MKI'
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  const testUsers = [
    { email: 'demo.saljare@vattenmiljo.se', password: 'demo123456', role: 'SALESPERSON', endpoint: '/api/stats/personal' },
    { email: 'demo.inhouse@vattenmiljo.se', password: 'demo123456', role: 'INHOUSE', endpoint: '/api/stats/team' },
    { email: 'demo.montor@vattenmiljo.se', password: 'demo123456', role: 'INSTALLER', endpoint: '/api/stats/installations' },
    { email: 'demo.admin@vattenmiljo.se', password: 'demo123456', role: 'ADMIN', endpoint: '/api/stats/overview' }
  ]
  
  for (const user of testUsers) {
    console.log(`\n🔐 Testing ${user.role}: ${user.email}`)
    
    try {
      // Test login
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })
      
      if (signInError) {
        console.log(`   ❌ Login failed: ${signInError.message}`)
        continue
      }
      
      console.log(`   ✅ Login successful!`)
      console.log(`   👤 User: ${signInData.user?.user_metadata?.name}`)
      console.log(`   🎭 Role: ${signInData.user?.user_metadata?.role}`)
      
      // Test API endpoint
      console.log(`   🌐 Testing endpoint: ${user.endpoint}`)
      
      const response = await fetch(`http://localhost:3000${user.endpoint}`, {
        headers: {
          'Authorization': `Bearer ${signInData.session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`   📊 API Response: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`   ✅ API call successful!`)
        if (data.stats) {
          console.log(`   📈 Stats keys: ${Object.keys(data.stats).slice(0, 5).join(', ')}`)
        }
      } else {
        const errorText = await response.text()
        console.log(`   ❌ API failed: ${errorText.substring(0, 100)}`)
      }
      
      // Sign out
      await supabase.auth.signOut()
      
    } catch (error) {
      console.log(`   💥 Test failed: ${error.message}`)
    }
  }
}

testCompleteAuth().catch(console.error)