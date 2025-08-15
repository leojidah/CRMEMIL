# Database Setup Guide

## Environment Variables Required

The application requires the following environment variables in your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Database Migration Steps

1. **Create Supabase Project**: Go to [Supabase](https://supabase.com) and create a new project
2. **Get Your Keys**: Copy the Project URL, anon key, and service role key from the API settings
3. **Update Environment Variables**: Replace the placeholders in `.env.local`
4. **Run Initial Migration**: Execute the SQL from `supabase/migrations/001_initial_schema.sql` in the SQL editor
5. **Run Kanban Enhancement Migration**: Execute the SQL from `supabase/migrations/002_kanban_enhancements.sql`

## Database Tables Created

### Core Tables:
- `users` - User accounts with roles (salesperson, internal, installer, admin)
- `customers` - Enhanced customer records with Kanban fields
- `customer_notes` - Customer interaction notes
- `customer_files` - File attachments
- `customer_activities` - Activity log

### Kanban Enhancement Tables:
- `meetings` - Customer meetings and appointments
- `quotations` - Sales quotations and proposals
- `water_tests` - Water quality test results
- `installations` - Installation tracking
- `notifications` - Real-time notifications
- `lead_sources` - Marketing attribution

## Customer Status Flow

The Kanban system supports the following status flow:
1. `not_handled` → Initial leads
2. `no_answer` → Contact attempted, no response
3. `call_again` → Scheduled follow-up
4. `meeting_booked` → Meeting scheduled
5. `quotation_stage` → Quotation sent
6. `extended_water_test` → Water testing in progress
7. `sold` → Customer purchased
8. `ready_for_installation` → Ready for installation
9. `installation_complete` → Installation finished
10. `not_interested` → Customer declined
11. `archived` → Closed/archived

## Role-Based Access

- **Salesperson**: Can manage customers through sales process (not_handled → sold)
- **Internal**: Can manage all customer stages and move sold customers to installation
- **Installer**: Can manage installation process (ready_for_installation → installation_complete)
- **Admin**: Can manage all aspects of the system

## Test the Setup

After setting up the database, you can test the connection by running:

```bash
node scripts/test-db.js
```

This will verify that all tables are accessible and migrations are applied correctly.