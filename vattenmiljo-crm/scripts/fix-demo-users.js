// Fix demo users - create in Supabase Auth and update existing users table records
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDemoUsers() {
  try {
    console.log('🔧 Fixar demo-användare för Vattenmiljö CRM...\n');
    
    // Demo-användare att fixa
    const demoUsers = [
      {
        email: 'demo.saljare@vattenmiljo.se',
        password: 'admin123!',
        name: 'Demo Säljare',
        role: 'SALESPERSON'
      },
      {
        email: 'demo.intern@vattenmiljo.se',
        password: 'admin123!',
        name: 'Demo Intern',
        role: 'INHOUSE'
      },
      {
        email: 'demo.montor@vattenmiljo.se',
        password: 'admin123!',
        name: 'Demo Montör',
        role: 'INSTALLER'
      }
    ];
    
    // Först, lista befintliga Auth-användare
    const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
    console.log('🔍 Befintliga Auth-användare:');
    existingAuthUsers.users.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
    });
    
    // Hämta befintliga users från tabellen
    const { data: existingDbUsers } = await supabase
      .from('users')
      .select('*');
    
    console.log('\n🗄️ Befintliga users-tabell poster:');
    existingDbUsers.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id}, roll: ${user.role})`);
    });
    
    console.log('\n');
    
    for (const user of demoUsers) {
      console.log(`👤 Fixar användare: ${user.email}`);
      
      // Kontrollera om användaren redan finns i Supabase Auth
      const existingAuthUser = existingAuthUsers.users.find(u => u.email === user.email);
      
      if (existingAuthUser) {
        console.log(`   ✅ Användare finns redan i Auth (ID: ${existingAuthUser.id})`);
        
        // Uppdatera users-tabellen med korrekt Auth ID
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            id: existingAuthUser.id,
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email);
          
        if (updateError) {
          console.log(`   ❌ Kunde inte uppdatera users-tabell: ${updateError.message}`);
        } else {
          console.log(`   ✅ Uppdaterade users-tabell med Auth ID: ${existingAuthUser.id}`);
        }
        continue;
      }
      
      // Skapa ny användare i Supabase Auth
      console.log(`   🔐 Skapar ny användare i Supabase Auth...`);
      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role,
          created_by: 'demo-fix',
          created_at: new Date().toISOString()
        }
      });
      
      if (createError) {
        console.error(`   ❌ Fel vid skapande i Auth: ${createError.message}`);
        continue;
      }
      
      console.log(`   ✅ Skapad i Auth (ID: ${authUser.user.id})`);
      
      // Uppdatera befintlig post i users-tabellen med det nya Auth ID:t
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          id: authUser.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('email', user.email);
      
      if (updateError) {
        console.error(`   ❌ Fel vid uppdatering av users-tabell: ${updateError.message}`);
        // Ta bort Auth-användaren om users-tabell uppdatering misslyckas
        await supabase.auth.admin.deleteUser(authUser.user.id);
        console.log(`   🧹 Rensade Auth-användare på grund av fel`);
        continue;
      }
      
      console.log(`   ✅ Uppdaterade users-tabell med Auth ID: ${authUser.user.id}`);
      console.log(`   📋 Klar: ${user.email} / ${user.password}\\n`);
    }
    
    // Visa slutlig status
    console.log('\\n📊 Kontrollerar slutresultat...');
    
    // Lista Auth-användare
    const { data: finalAuthUsers } = await supabase.auth.admin.listUsers();
    console.log(`\\n🔐 Supabase Auth användare (${finalAuthUsers.users.length}):`);
    finalAuthUsers.users.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id}, Roll: ${user.user_metadata?.role || 'Ingen'})`);
    });
    
    // Lista users-tabell
    const { data: finalDbUsers } = await supabase
      .from('users')
      .select('*');
    
    console.log(`\\n🗄️ Users-tabell användare (${finalDbUsers.length}):`);
    finalDbUsers.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id}, roll: ${user.role}, aktiv: ${user.is_active})`);
    });
    
    console.log('\\n🎉 Demo-användare fixade framgångsrikt!');
    console.log('\\n🔗 Testa inloggning på: http://localhost:3000/auth/signin');
    console.log('\\n📋 Inloggningsuppgifter:');
    demoUsers.forEach(user => {
      const roleLabel = user.role === 'SALESPERSON' ? 'Säljare' : 
                       user.role === 'INHOUSE' ? 'Intern' : 'Montör';
      console.log(`   ${roleLabel}: ${user.email} / ${user.password}`);
    });
    
  } catch (error) {
    console.error('❌ Fel vid fixning av demo-användare:', error.message);
    console.error('📄 Fullständig fel:', error);
    process.exit(1);
  }
}

fixDemoUsers().then(() => {
  process.exit(0);
});