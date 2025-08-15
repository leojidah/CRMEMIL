// Complete authentication system test
const http = require('http');

async function testAuthenticationFlow() {
  const baseUrl = 'http://localhost:3002';
  
  console.log('🧪 Testing Complete Authentication System...\n');
  
  const tests = [
    {
      name: 'Homepage Redirect',
      url: baseUrl,
      expectedRedirect: '/auth/signin',
      description: 'Should redirect unauthenticated users to signin'
    },
    {
      name: 'Signin Page',
      url: `${baseUrl}/auth/signin`,
      expectedStatus: 200,
      description: 'Signin page should be accessible'
    },
    {
      name: 'Forgot Password Page',
      url: `${baseUrl}/auth/forgot-password`,
      expectedStatus: 200,
      description: 'Forgot password page should be accessible'
    },
    {
      name: 'Reset Password Page',
      url: `${baseUrl}/auth/reset-password`,
      expectedStatus: 200,
      description: 'Reset password page should be accessible'
    },
    {
      name: 'Inactive User Page',
      url: `${baseUrl}/auth/inactive`,
      expectedStatus: 200,
      description: 'Inactive user page should be accessible'
    },
    {
      name: 'NextAuth API',
      url: `${baseUrl}/api/auth/providers`,
      expectedStatus: 200,
      description: 'NextAuth API should be working'
    },
    {
      name: 'Protected Dashboard',
      url: `${baseUrl}/dashboard`,
      expectedRedirect: '/auth/signin',
      description: 'Dashboard should redirect unauthenticated users'
    },
    {
      name: 'Protected API Route',
      url: `${baseUrl}/api/customers`,
      expectedStatus: 401,
      description: 'Protected API should return 401 for unauthenticated requests'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const response = await fetch(test.url, { redirect: 'manual' });
      
      let success = false;
      let message = '';
      
      if (test.expectedStatus) {
        success = response.status === test.expectedStatus;
        message = `Status: ${response.status} (expected ${test.expectedStatus})`;
      } else if (test.expectedRedirect) {
        const location = response.headers.get('location') || '';
        success = response.status === 302 && location.includes(test.expectedRedirect);
        message = `Redirect: ${location} (expected to contain ${test.expectedRedirect})`;
      }
      
      if (success) {
        console.log(`✅ ${test.name}: ${message}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: ${message}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Test Results:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log(`\n🎉 All authentication tests passed!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Run database migrations in Supabase (see SUPABASE_MIGRATIONS.md)`);
    console.log(`   2. Create admin user: node scripts/create-admin.js`);
    console.log(`   3. Test login at: http://localhost:3002/auth/signin`);
    console.log(`   4. Admin credentials: leojidah@hotmail.com / admin123`);
  } else {
    console.log(`\n⚠️  Some tests failed. Check the implementation.`);
  }
  
  return failed === 0;
}

testAuthenticationFlow().then(success => {
  process.exit(success ? 0 : 1);
});