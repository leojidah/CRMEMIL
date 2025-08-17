// Create admin user using Supabase Auth (not custom users table)
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

async function createSupabaseAdminUser() {
  try {
    console.log('🚀 Creating admin user in Supabase Auth...\n')
    
    // Admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vattenmiljo.se'
    const adminPassword = process.env.ADMIN_PASSWORD || 'TempPassword123!'
    const adminName = process.env.ADMIN_NAME || 'System Administrator'
    const adminRole = 'ADMIN'
    
    console.log('📧 Email:', adminEmail)
    console.log('👤 Name:', adminName)
    console.log('🎭 Role:', adminRole)
    console.log('🔑 Password:', adminPassword)
    
    // Check if user already exists
    console.log('\n📋 Checking if admin user already exists...')
    
    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers.users.find(user => user.email === adminEmail)
      
      if (existingUser) {
        console.log('⚠️ Admin user already exists in Supabase Auth:')
        console.log('   User ID:', existingUser.id)
        console.log('   Email:', existingUser.email)
        console.log('   Confirmed:', existingUser.email_confirmed_at ? 'Yes' : 'No')
        console.log('   Created:', existingUser.created_at)
        console.log('   Metadata:', existingUser.user_metadata)
        console.log('\n✅ You can login with existing credentials')
        console.log('📋 Login URL: http://localhost:3002/auth/signin')
        return
      }
    } catch (listError) {
      console.log('ℹ️ Could not list existing users (might be normal):', listError.message)
    }
    
    // Create admin user in Supabase Auth
    console.log('\n👤 Creating admin user in Supabase Auth...')
    
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: adminName,
        role: adminRole,
        created_by: 'system',
        created_at: new Date().toISOString()
      }
    })
    
    if (createError) {
      console.error('❌ Error creating admin user:', createError.message)
      console.error('📄 Full error:', createError)
      return
    }
    
    console.log('✅ Admin user created successfully in Supabase Auth!')
    console.log('📋 User Details:')
    console.log('   User ID:', authUser.user.id)
    console.log('   Email:', authUser.user.email)
    console.log('   Confirmed:', authUser.user.email_confirmed_at ? 'Yes' : 'No')
    console.log('   Metadata:', authUser.user.user_metadata)
    
    // Create some sample customers for testing
    console.log('\n📊 Creating sample customers for testing...')
    
    const sampleCustomers = [
      {
        name: 'Anna Andersson',
        email: 'anna@example.com',
        phone: '070-555-0001',
        address: 'Storgatan 1, Stockholm',
        status: 'not_handled',
        priority: 'high',
        assigned_to: authUser.user.id,
        needs_analysis: {
          water_hardness: 'high',
          chlorine_taste: true,
          iron_staining: false,
          well_water: false,
          installation_type: 'whole_house',
          budget_range: '50k_100k',
          timeframe: 'within_month'
        },
        lead_source: 'Website',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Erik Eriksson', 
        email: 'erik@company.se',
        phone: '070-555-0002',
        address: 'Industrigatan 8, Göteborg',
        status: 'meeting_booked',
        priority: 'medium',
        assigned_to: authUser.user.id,
        needs_analysis: {
          water_hardness: 'medium',
          bacteria_concern: true,
          well_water: true,
          installation_type: 'kitchen_only',
          budget_range: '20k_50k',
          timeframe: 'within_3months'
        },
        lead_source: 'Referral',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Maria Johansson',
        email: 'maria@home.se', 
        phone: '070-555-0003',
        address: 'Kungsgatan 15, Malmö',
        status: 'quotation_stage',
        priority: 'high',
        assigned_to: authUser.user.id,
        sale_amount: 85000,
        needs_analysis: {
          water_hardness: 'very_high',
          chlorine_taste: true,
          iron_staining: true,
          installation_type: 'whole_house',
          budget_range: '50k_100k',
          timeframe: 'immediate'
        },
        lead_source: 'Cold Call',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Lars Larsson',
        email: 'lars@villa.se',
        phone: '070-555-0004',
        address: 'Villagatan 22, Uppsala',
        status: 'sold',
        priority: 'high',
        assigned_to: authUser.user.id,
        sale_amount: 125000,
        sale_date: new Date().toISOString(),
        needs_analysis: {
          water_hardness: 'high',
          iron_staining: true,
          installation_type: 'whole_house',
          budget_range: 'over_100k',
          timeframe: 'immediate'
        },
        lead_source: 'Referral',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Karin Nilsson',
        email: 'karin@hem.se',
        phone: '070-555-0005', 
        address: 'Björkgatan 33, Örebro',
        status: 'ready_for_installation',
        priority: 'medium',
        assigned_to: authUser.user.id,
        sale_amount: 75000,
        sale_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        needs_analysis: {
          water_hardness: 'medium',
          installation_type: 'kitchen_only',
          budget_range: '50k_100k',
          timeframe: 'within_month'
        },
        lead_source: 'Website',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .insert(sampleCustomers)
      .select()
    
    if (customersError) {
      console.log('⚠️ Could not create sample customers:', customersError.message)
      console.log('📄 Error details:', customersError)
    } else {
      console.log('✅ Sample customers created successfully!')
      console.log('📊 Created', customers.length, 'customers')
    }
    
    console.log('\n🎉 Setup complete! Your Kanban CRM is ready to use.')
    console.log('🔗 Login URL: http://localhost:3002/auth/signin')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('\n🔐 SECURITY WARNING: Change the default password after first login!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.error('📄 Full error:', error)
    process.exit(1)
  }
}

createSupabaseAdminUser().then(() => {
  process.exit(0)
})