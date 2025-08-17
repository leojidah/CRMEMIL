/**
 * Test full authentication and API flow
 */

async function testFullFlow() {
  try {
    console.log('🔧 Testing full authentication + API flow...')
    
    // Step 1: Test that the customers API responds (even with 401)
    console.log('\n📡 Step 1: Testing API endpoint response...')
    const apiResponse = await fetch('http://localhost:3000/api/customers')
    
    console.log('📊 API Status:', apiResponse.status)
    const apiData = await apiResponse.json()
    console.log('📄 API Response:', apiData)
    
    if (apiResponse.status === 401) {
      console.log('✅ API correctly returns 401 for unauthenticated request')
    } else {
      console.log('⚠️ Unexpected API response status')
    }
    
    // Step 2: Check if we can create/verify user account
    console.log('\n👤 Step 2: Testing user setup...')
    const setupResponse = await fetch('http://localhost:3000/api/auth/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'leojidah@hotmail.com',
        password: 'test123456',
        name: 'Leo Jidah'
      }),
    })
    
    console.log('👤 Setup Status:', setupResponse.status)
    const setupData = await setupResponse.json()
    console.log('👤 Setup Response:', setupData)
    
    // Step 3: Test signin endpoint
    console.log('\n🔐 Step 3: Testing signin...')
    const signinResponse = await fetch('http://localhost:3000/auth/signin', {
      method: 'GET'
    })
    
    console.log('🔐 Signin page Status:', signinResponse.status)
    
    // Step 4: Make sure dashboard page loads
    console.log('\n📊 Step 4: Testing dashboard access...')
    const dashboardResponse = await fetch('http://localhost:3000/dashboard')
    
    console.log('📊 Dashboard Status:', dashboardResponse.status)
    
    console.log('\n🎯 Next Steps for Manual Testing:')
    console.log('1. Open browser to http://localhost:3000/auth/signin')
    console.log('2. Login with leojidah@hotmail.com')
    console.log('3. After login, open browser dev tools')
    console.log('4. Go to http://localhost:3000/api/customers')
    console.log('5. Check console logs for detailed debugging info')
    console.log('6. Check terminal for server-side logs')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testFullFlow()