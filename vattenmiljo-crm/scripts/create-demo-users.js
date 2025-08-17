// Create demo users in both Supabase Auth and users table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createDemoUsers() {
  try {
    console.log('🚀 Skapar demo-användare för Vattenmiljö CRM...\n');
    
    // Demo-användare att skapa
    const demoUsers = [
      {
        email: 'demo.saljare@vattenmiljo.se',
        password: 'admin123!',
        name: 'Demo Säljare',
        role: 'SALESPERSON',
        internalRole: 'salesperson'
      },
      {
        email: 'demo.intern@vattenmiljo.se',
        password: 'admin123!',
        name: 'Demo Intern',
        role: 'INHOUSE',
        internalRole: 'internal'
      },
      {
        email: 'demo.montor@vattenmiljo.se',
        password: 'admin123!',
        name: 'Demo Montör',
        role: 'INSTALLER',
        internalRole: 'installer'
      }
    ];
    
    for (const user of demoUsers) {
      console.log(`👤 Skapar användare: ${user.email} (${user.role})`);
      
      // Kontrollera om användaren redan finns i Supabase Auth
      try {
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingAuthUser = existingUsers.users.find(u => u.email === user.email);
        
        if (existingAuthUser) {
          console.log(`   ⚠️ Användare finns redan i Supabase Auth (ID: ${existingAuthUser.id})`);
          
          // Uppdatera befintlig post i users-tabellen med Auth ID
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
            console.log(`   ✅ Uppdaterade users-tabell med Auth ID`);
          }
          continue;
        }
      } catch (listError) {
        console.log(`   ℹ️ Kunde inte lista användare: ${listError.message}`);
      }
      
      // Skapa användare i Supabase Auth
      console.log(`   🔐 Skapar i Supabase Auth...`);
      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-bekräfta e-post
        user_metadata: {
          name: user.name,
          role: user.role,
          created_by: 'demo-setup',
          created_at: new Date().toISOString()
        }
      });
      
      if (createError) {
        console.error(`   ❌ Fel vid skapande i Auth: ${createError.message}`);
        continue;
      }
      
      console.log(`   ✅ Skapad i Auth (ID: ${authUser.user.id})`);
      
      // Ta bort befintlig post från users-tabellen (om den finns) och skapa ny med Auth ID
      console.log(`   🗄️ Uppdaterar users-tabell...`);
      
      // Först, ta bort befintlig post med samma e-post
      await supabase
        .from('users')
        .delete()
        .eq('email', user.email);
      
      // Skapa ny post med korrekt Auth ID
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id, // Använd Supabase Auth ID
          name: user.name,
          email: user.email,
          role: user.internalRole,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (userError) {
        console.error(`   ❌ Fel vid skapande i users-tabell: ${userError.message}`);
        
        // Om users-tabell misslyckas, ta bort från Auth också
        await supabase.auth.admin.deleteUser(authUser.user.id);
        console.log(`   🧹 Rensade Auth-användare på grund av fel`);
        continue;
      }
      
      console.log(`   ✅ Skapad i users-tabell`);
      console.log(`   📋 Slutförd: ${user.email} med lösenord: ${user.password}\\n`);
    }
    
    // Visa slutlig status
    console.log('\\n📊 Kontrollerar slutresultat...');
    
    // Lista Auth-användare
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    console.log(`\\n🔐 Supabase Auth användare (${authUsers.users.length}):`);
    authUsers.users.forEach(user => {
      console.log(`   - ${user.email} (${user.user_metadata?.role || 'Ingen roll'})`);
    });
    
    // Lista users-tabell
    const { data: dbUsers } = await supabase
      .from('users')
      .select('*');
    
    console.log(`\\n🗄️ Users-tabell användare (${dbUsers.length}):`);
    dbUsers.forEach(user => {
      console.log(`   - ${user.email} (roll: ${user.role}, aktiv: ${user.is_active})`);
    });
    
    console.log('\\n🎉 Demo-användare skapade framgångsrikt!');
    console.log('\\n🔗 Testa inloggning på: http://localhost:3000/auth/signin');
    console.log('\\n📋 Inloggningsuppgifter:');
    demoUsers.forEach(user => {
      console.log(`   ${user.role}: ${user.email} / ${user.password}`);
    });
    
  } catch (error) {
    console.error('❌ Fel vid skapande av demo-användare:', error.message);
    console.error('📄 Fullständig fel:', error);
    process.exit(1);
  }
}

createDemoUsers().then(() => {
  process.exit(0);
});