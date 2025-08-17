# Supabase Database Migrations

## ⚠️ IMPORTANT: Run These Migrations in Supabase SQL Editor

Your database exists but needs the enhanced schema for the Kanban CRM. Follow these steps:

### 1. Open Supabase Dashboard
Go to: https://wyxqyqlnzkgbigsfglou.supabase.co

### 2. Navigate to SQL Editor
- Click on "SQL Editor" in the left sidebar
- Create a new query

### 3. Run Migration 001 (Initial Schema)
Copy and paste the contents of `supabase/migrations/001_initial_schema.sql` and execute it.

### 4. Run Migration 002 (Kanban Enhancements)
Copy and paste the contents of `supabase/migrations/002_kanban_enhancements.sql` and execute it.

## Quick Migration Commands

If you prefer to run via command line and have Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your project
supabase link --project-ref wyxqyqlnzkgbigsfglou

# Push migrations
supabase db push
```

## Verify Migration Success

After running migrations, test with:
```bash
node scripts/test-db.js
```

You should see:
```
✅ Users table accessible
✅ Customers table accessible
✅ Enhanced customer columns accessible
✅ meetings table accessible
✅ quotations table accessible
✅ water_tests table accessible
✅ installations table accessible
✅ notifications table accessible
🎉 Database connection and migrations test passed!
```

## Create Admin User

After migrations are complete, run:
```bash
node scripts/create-admin.js
```

This will create the admin user account (credentials will be generated securely)