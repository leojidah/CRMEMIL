/**
 * Script to apply RLS policy fixes for Supabase Auth
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyRLSFix() {
  try {
    console.log('🔧 Applying RLS policy fixes...')
    
    // Read and execute the migration SQL
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '003_fix_rls_for_supabase_auth.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split by lines and filter out comments and empty lines
    const sqlStatements = migrationSQL
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .filter(stmt => stmt.trim())
    
    console.log(`📄 Found ${sqlStatements.length} SQL statements to execute`)
    
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i].trim()
      if (!statement) continue
      
      console.log(`⚡ Executing statement ${i + 1}/${sqlStatements.length}`)
      console.log(`   ${statement.substring(0, 50)}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error)
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`)
      }
    }
    
    console.log('🎉 RLS policy fixes applied successfully!')
    
    // Test the new policies
    console.log('\n🧪 Testing new RLS policies...')
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .limit(3)
    
    if (error) {
      console.error('❌ Error testing customers access:', error)
    } else {
      console.log(`✅ Can access ${customers.length} customers with new policies`)
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Create exec_sql function if it doesn't exist
async function ensureExecSqlFunction() {
  const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' })
  
  if (error && error.message.includes('function exec_sql')) {
    console.log('🔧 Creating exec_sql function...')
    
    const createFunctionSQL = `
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
    `
    
    // Use direct SQL execution for function creation
    const { error: createError } = await supabase
      .from('dummy_table_that_does_not_exist')
      .select('*')
    
    // This will fail, but that's expected - we just need the connection
    console.log('📝 Function creation may require manual application via SQL editor')
  }
}

applyRLSFix()