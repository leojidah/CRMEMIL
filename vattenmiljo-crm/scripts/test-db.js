// Simple database connection test
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .limit(1);
    
    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
      return false;
    }
    
    console.log('✅ Users table accessible');
    
    // Test customers table
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id', { count: 'exact' })
      .limit(1);
    
    if (customersError) {
      console.error('❌ Customers table error:', customersError.message);
      return false;
    }
    
    console.log('✅ Customers table accessible');
    
    // Test if enhanced columns exist
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, name, status, needs_analysis, sale_amount')
      .limit(1)
      .single();
    
    if (customerError && !customerError.message.includes('multiple (or no) rows returned')) {
      console.error('❌ Enhanced customer columns error:', customerError.message);
      return false;
    }
    
    console.log('✅ Enhanced customer columns accessible');
    
    // Test new tables
    const tables = ['meetings', 'quotations', 'water_tests', 'installations', 'notifications'];
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('id', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.error(`❌ ${table} table error:`, error.message);
        return false;
      }
      
      console.log(`✅ ${table} table accessible`);
    }
    
    console.log('\n🎉 Database connection and migrations test passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});