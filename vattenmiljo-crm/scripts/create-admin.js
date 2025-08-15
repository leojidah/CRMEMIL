// Create admin user script
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user...\n');
    
    const adminEmail = 'leojidah@hotmail.com';
    const adminName = 'Leo Jidah';
    const adminPassword = 'admin123'; // You should change this!
    const adminRole = 'admin';
    
    // Check if admin user already exists
    console.log('📋 Checking if admin user exists...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (existingUser) {
      console.log('⚠️  Admin user already exists:');
      console.log('   Email:', existingUser.email);
      console.log('   Name:', existingUser.name);
      console.log('   Role:', existingUser.role);
      console.log('   Active:', existingUser.is_active);
      console.log('\n✅ You can login with existing credentials');
      return;
    }
    
    // Hash password
    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Create admin user
    console.log('👤 Creating admin user account...');
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: adminEmail,
        name: adminName,
        password_hash: hashedPassword,
        role: adminRole,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating admin user:', createError.message);
      return;
    }
    
    console.log('✅ Admin user created successfully!\n');
    console.log('📋 Admin Account Details:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('   Role:', adminRole);
    console.log('   Name:', adminName);
    console.log('\n🔐 IMPORTANT: Change the default password after first login!');
    console.log('\n🚀 You can now login at: http://localhost:3000/auth/signin');
    
    // Create some sample customers for testing
    console.log('\n📊 Creating sample customers for testing...');
    
    const sampleCustomers = [
      {
        name: 'Anna Andersson',
        email: 'anna@example.com',
        phone: '070-555-0001',
        address: 'Storgatan 1, Stockholm',
        status: 'not_handled',
        priority: 'high',
        assigned_to: newUser.id,
        lead_source: 'Website',
        needs_analysis: JSON.stringify({
          water_hardness: 'high',
          chlorine_taste: true,
          iron_staining: false,
          well_water: false,
          installation_type: 'whole_house',
          budget_range: '50k_100k',
          timeframe: 'within_month'
        })
      },
      {
        name: 'Erik Eriksson', 
        email: 'erik@company.se',
        phone: '070-555-0002',
        address: 'Industrigatan 8, Göteborg',
        status: 'meeting_booked',
        priority: 'medium',
        assigned_to: newUser.id,
        lead_source: 'Referral',
        needs_analysis: JSON.stringify({
          water_hardness: 'medium',
          bacteria_concern: true,
          well_water: true,
          installation_type: 'kitchen_only',
          budget_range: '20k_50k',
          timeframe: 'within_3months'
        })
      },
      {
        name: 'Maria Johansson',
        email: 'maria@home.se', 
        phone: '070-555-0003',
        address: 'Kungsgatan 15, Malmö',
        status: 'quotation_stage',
        priority: 'high',
        assigned_to: newUser.id,
        lead_source: 'Cold Call',
        sale_amount: 85000,
        needs_analysis: JSON.stringify({
          water_hardness: 'very_high',
          chlorine_taste: true,
          iron_staining: true,
          installation_type: 'whole_house',
          budget_range: '50k_100k',
          timeframe: 'immediate'
        })
      }
    ];
    
    const { error: customersError } = await supabase
      .from('customers')
      .insert(sampleCustomers);
    
    if (customersError) {
      console.log('⚠️  Could not create sample customers:', customersError.message);
    } else {
      console.log('✅ Sample customers created successfully!');
    }
    
    console.log('\n🎉 Setup complete! Your Kanban CRM is ready to use.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

createAdminUser().then(() => {
  process.exit(0);
});