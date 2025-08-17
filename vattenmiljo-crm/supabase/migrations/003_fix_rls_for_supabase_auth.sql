-- ============================================================================
-- FIX RLS POLICIES FOR SUPABASE AUTH
-- ============================================================================

-- Drop existing RLS policies that depend on the custom users table
DROP POLICY IF EXISTS "Users can view active users" ON users;
DROP POLICY IF EXISTS "Users can view customers based on role" ON customers;
DROP POLICY IF EXISTS "Users can view customer notes" ON customer_notes;
DROP POLICY IF EXISTS "Users can view customer files" ON customer_files;
DROP POLICY IF EXISTS "Users can view customer activities" ON customer_activities;

-- Create simpler RLS policies that work with Supabase Auth
-- Customers are visible to all authenticated users (role-based filtering handled in app)
CREATE POLICY "Authenticated users can view customers" ON customers
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Customer notes are visible to all authenticated users
CREATE POLICY "Authenticated users can view customer notes" ON customer_notes
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Customer files are visible to all authenticated users
CREATE POLICY "Authenticated users can view customer files" ON customer_files
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Customer activities are visible to all authenticated users
CREATE POLICY "Authenticated users can view customer activities" ON customer_activities
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Note: The custom users table is no longer used for authentication
-- User roles and permissions are handled via Supabase Auth user_metadata
-- Role-based filtering is implemented in the application layer