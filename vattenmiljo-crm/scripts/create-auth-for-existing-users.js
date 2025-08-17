// Create Supabase Auth users for existing users in users table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAuthForExistingUsers() {
  try {
    console.log('🔧 Skapar Supabase Auth-användare för befintliga users...\n');
    
    // Hämta demo-användare från users-tabellen
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .in('email', [
        'demo.saljare@vattenmiljo.se',
        'demo.intern@vattenmiljo.se', 
        'demo.montor@vattenmiljo.se'
      ]);
    
    if (fetchError) {
      console.error('❌ Fel vid hämtning av användare:', fetchError.message);
      return;
    }
    
    console.log(`🗄️ Hittade ${existingUsers.length} demo-användare i users-tabellen:`);
    existingUsers.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id}, roll: ${user.role})`);
    });
    
    // Mapping för rollöversättning
    const roleMapping = {
      'salesperson': 'SALESPERSON',
      'internal': 'INHOUSE', 
      'installer': 'INSTALLER'
    };
    
    const nameMapping = {
      'demo.saljare@vattenmiljo.se': 'Demo Säljare',
      'demo.intern@vattenmiljo.se': 'Demo Intern',
      'demo.montor@vattenmiljo.se': 'Demo Montör'
    };
    
    console.log('\\n');
    
    for (const user of existingUsers) {
      console.log(`👤 Skapar Auth-användare för: ${user.email}`);
      
      // Kontrollera om Auth-användare redan finns
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const existingAuthUser = authUsers.users.find(au => au.email === user.email);
      
      if (existingAuthUser) {
        console.log(`   ✅ Auth-användare finns redan (ID: ${existingAuthUser.id})`);
        continue;
      }
      
      // Skapa Auth-användare med samma ID som users-tabellen
      const authRole = roleMapping[user.role] || 'USER';
      const displayName = nameMapping[user.email] || user.name || 'Demo User';
      
      console.log(`   🔐 Skapar Auth-användare med ID: ${user.id}...`);
      
      // Använd admin.createUser men försök sätta specifikt ID (kanske inte fungerar, men vi testar)
      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'admin123!',
        email_confirm: true,
        user_metadata: {
          name: displayName,
          role: authRole,
          created_by: 'auth-sync',
          created_at: new Date().toISOString(),
          original_db_id: user.id // Spara original ID som referens
        }
      });
      
      if (createError) {
        console.error(`   ❌ Fel vid skapande av Auth-användare: ${createError.message}`);
        continue;
      }
      
      console.log(`   ✅ Auth-användare skapad (ID: ${authUser.user.id})`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Lösenord: admin123!`);
      console.log(`   🎭 Roll: ${authRole}\\n`);
    }
    
    // Visa slutresultat
    console.log('📊 Kontrollerar slutresultat...');
    
    const { data: finalAuthUsers } = await supabase.auth.admin.listUsers();
    console.log(`\\n🔐 Alla Supabase Auth användare (${finalAuthUsers.users.length}):`);
    finalAuthUsers.users.forEach(user => {
      const role = user.user_metadata?.role || 'Ingen roll';
      console.log(`   - ${user.email} (${role})`);
    });
    
    // Räkna demo-användare
    const demoAuthUsers = finalAuthUsers.users.filter(u => 
      u.email.includes('demo.') && u.email.includes('@vattenmiljo.se')
    );
    
    console.log(`\\n✅ Demo-användare i Auth: ${demoAuthUsers.length}/3`);
    
    if (demoAuthUsers.length === 3) {
      console.log('\\n🎉 Alla demo-användare har nu Auth-konton!');
      console.log('\\n🔗 Testa inloggning på: http://localhost:3000/auth/signin');
      console.log('\\n📋 Inloggningsuppgifter (alla med lösenord: admin123!):');
      console.log('   Säljare: demo.saljare@vattenmiljo.se');
      console.log('   Intern: demo.intern@vattenmiljo.se');
      console.log('   Montör: demo.montor@vattenmiljo.se');
    } else {
      console.log('\\n⚠️ Några demo-användare saknar fortfarande Auth-konton');
    }
    
  } catch (error) {
    console.error('❌ Fel:', error.message);
    console.error('📄 Fullständig fel:', error);
    process.exit(1);
  }
}

createAuthForExistingUsers().then(() => {
  process.exit(0);
});