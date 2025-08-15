-- ============================================================================
-- KANBAN CRM ENHANCEMENTS - Enhanced Sales Process Schema
-- ============================================================================

-- Drop existing status type and recreate with new values
DROP TYPE IF EXISTS CustomerStatus CASCADE;

CREATE TYPE CustomerStatus AS ENUM (
    'not_handled',
    'no_answer', 
    'call_again',
    'not_interested',
    'meeting_booked',
    'quotation_stage',
    'extended_water_test',
    'sold',
    'ready_for_installation',
    'installation_complete',
    'archived'
);

-- Add new columns to customers table for enhanced functionality
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS needs_analysis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sale_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS sale_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_followup_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS water_test_results JSONB DEFAULT '{}';

-- Re-add the status column with the new enum
ALTER TABLE customers DROP COLUMN IF EXISTS status;
ALTER TABLE customers ADD COLUMN status CustomerStatus DEFAULT 'not_handled';

-- ============================================================================
-- MEETINGS TABLE - Enhanced Meeting Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS meetings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Customer Meeting',
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_type VARCHAR(50) DEFAULT 'consultation',
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    location VARCHAR(255),
    attendees TEXT[],
    agenda TEXT,
    outcome TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_meetings_customer_id ON meetings(customer_id);
CREATE INDEX idx_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX idx_meetings_status ON meetings(status);

-- ============================================================================
-- QUOTATIONS TABLE - Sales Quote Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS quotations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SEK',
    items JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired')),
    valid_until TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_quote_number ON quotations(quote_number);

-- ============================================================================
-- WATER TESTS TABLE - Water Quality Analysis
-- ============================================================================

CREATE TABLE IF NOT EXISTS water_tests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    test_type VARCHAR(50) NOT NULL DEFAULT 'standard',
    test_date TIMESTAMPTZ NOT NULL,
    results JSONB NOT NULL DEFAULT '{}',
    recommendations JSONB DEFAULT '{}',
    ph_level DECIMAL(3,2),
    hardness_level INTEGER, -- in degrees dH
    chlorine_level DECIMAL(4,2),
    iron_content DECIMAL(4,2),
    bacteria_present BOOLEAN,
    sample_location VARCHAR(255),
    tested_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_water_tests_customer_id ON water_tests(customer_id);
CREATE INDEX idx_water_tests_test_date ON water_tests(test_date);

-- ============================================================================
-- INSTALLATIONS TABLE - Installation Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS installations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    scheduled_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    installer_id UUID REFERENCES users(id),
    equipment_installed JSONB DEFAULT '[]',
    installation_notes TEXT,
    customer_satisfaction INTEGER CHECK (customer_satisfaction BETWEEN 1 AND 5),
    warranty_start_date TIMESTAMPTZ,
    warranty_end_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'on_hold', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_installations_customer_id ON installations(customer_id);
CREATE INDEX idx_installations_installer_id ON installations(installer_id);
CREATE INDEX idx_installations_scheduled_date ON installations(scheduled_date);

-- ============================================================================
-- NOTIFICATIONS TABLE - Real-time Status Change Notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);

-- ============================================================================
-- LEAD SOURCES TABLE - Marketing Attribution
-- ============================================================================

CREATE TABLE IF NOT EXISTS lead_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default lead sources
INSERT INTO lead_sources (name, description) VALUES
    ('Website', 'Leads from company website'),
    ('Referral', 'Customer referrals'),
    ('Social Media', 'Facebook, Instagram, etc.'),
    ('Cold Call', 'Outbound sales calls'),
    ('Trade Show', 'Industry events and exhibitions'),
    ('Print Ad', 'Newspaper and magazine advertisements'),
    ('Direct Mail', 'Physical mail campaigns'),
    ('Other', 'Other sources not listed');

-- ============================================================================
-- TRIGGERS AND FUNCTIONS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language plpgsql;

-- Apply updated_at trigger to new tables
CREATE TRIGGER update_meetings_updated_at
    BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
    BEFORE UPDATE ON quotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installations_updated_at
    BEFORE UPDATE ON installations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ENHANCED ACTIVITY LOGGING FOR KANBAN MOVES
-- ============================================================================

-- Function to log customer status changes for Kanban
CREATE OR REPLACE FUNCTION log_kanban_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO customer_activities (
            customer_id, 
            type, 
            title, 
            description, 
            performed_by, 
            performed_by_id,
            metadata
        ) VALUES (
            NEW.id,
            'status_change',
            'Status updated via Kanban',
            format('Status changed from %s to %s', OLD.status, NEW.status),
            'System',
            NEW.assigned_to,
            jsonb_build_object(
                'previous_status', OLD.status,
                'new_status', NEW.status,
                'method', 'kanban_drag_drop'
            )
        );

        -- Create notifications for relevant users
        CASE 
            WHEN NEW.status IN ('sold', 'ready_for_installation') THEN
                -- Notify internal team when customer is sold or ready for installation
                INSERT INTO notifications (recipient_id, customer_id, type, title, message, data)
                SELECT 
                    u.id,
                    NEW.id,
                    'customer_status_change',
                    format('Customer %s status updated', NEW.name),
                    format('%s moved to %s', NEW.name, NEW.status),
                    jsonb_build_object(
                        'customer_id', NEW.id,
                        'old_status', OLD.status,
                        'new_status', NEW.status
                    )
                FROM users u 
                WHERE u.role IN ('internal', 'installer') 
                AND u.is_active = true;
            ELSE
                NULL;
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$ language plpgsql;

-- Drop existing trigger if it exists and recreate with enhanced functionality
DROP TRIGGER IF EXISTS log_customer_status_change_trigger ON customers;
CREATE TRIGGER log_kanban_status_change_trigger
    AFTER UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION log_kanban_status_change();

-- ============================================================================
-- ROLE-BASED ACCESS POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;

-- Policies for meetings
CREATE POLICY "Users can view meetings for their customers" ON meetings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers c, users u
            WHERE c.id = customer_id 
            AND u.id = auth.uid()::uuid
            AND (c.assigned_to = u.id OR u.role = 'internal')
        )
    );

-- Policies for quotations
CREATE POLICY "Users can view quotations for their customers" ON quotations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers c, users u
            WHERE c.id = customer_id 
            AND u.id = auth.uid()::uuid
            AND (c.assigned_to = u.id OR u.role IN ('internal', 'admin'))
        )
    );

-- Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR ALL USING (recipient_id = auth.uid()::uuid);

-- Policies for other tables follow similar patterns
CREATE POLICY "Users can view water tests for their customers" ON water_tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers c, users u
            WHERE c.id = customer_id 
            AND u.id = auth.uid()::uuid
            AND (c.assigned_to = u.id OR u.role IN ('internal', 'installer'))
        )
    );

CREATE POLICY "Users can view installations for their customers" ON installations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers c, users u
            WHERE c.id = customer_id 
            AND u.id = auth.uid()::uuid
            AND (c.assigned_to = u.id OR u.role IN ('internal', 'installer'))
        )
    );

-- Lead sources are viewable by all authenticated users
CREATE POLICY "All users can view lead sources" ON lead_sources
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SAMPLE DATA FOR TESTING KANBAN
-- ============================================================================

-- Update existing demo customers with new statuses
UPDATE customers 
SET status = 'meeting_booked', 
    needs_analysis = '{"water_hardness": "high", "chlorine_taste": true, "iron_staining": false}',
    lead_source = 'Website',
    last_contact_date = NOW() - INTERVAL '2 days'
WHERE name = 'Anna Andersson';

UPDATE customers 
SET status = 'quotation_stage',
    needs_analysis = '{"water_hardness": "medium", "bacteria_concern": true, "well_water": true}',
    lead_source = 'Referral',
    last_contact_date = NOW() - INTERVAL '1 day'
WHERE name = 'Erik Eriksson';

-- Add a few more demo customers across different stages
DO $$
DECLARE
    demo_salesperson_id UUID;
    demo_internal_id UUID;
    demo_installer_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO demo_salesperson_id FROM users WHERE email = 'demo.saljare@vattenmiljo.se' LIMIT 1;
    SELECT id INTO demo_internal_id FROM users WHERE email = 'demo.intern@vattenmiljo.se' LIMIT 1;
    SELECT id INTO demo_installer_id FROM users WHERE email = 'demo.montor@vattenmiljo.se' LIMIT 1;

    -- Insert more demo customers
    INSERT INTO customers (name, email, phone, address, status, priority, assigned_to, needs_analysis, lead_source) VALUES
    ('Maria Johansson', 'maria@example.com', '070-555-1234', 'Kungsgatan 15, Malmö', 'not_handled', 'high', demo_salesperson_id, '{}', 'Cold Call'),
    ('Lars Larsson', 'lars@company.se', '070-555-2345', 'Industrigatan 8, Västerås', 'no_answer', 'medium', demo_salesperson_id, '{}', 'Trade Show'),
    ('Karin Nilsson', 'karin@home.se', '070-555-3456', 'Björkgatan 22, Uppsala', 'sold', 'high', demo_internal_id, '{"water_hardness": "very_high", "iron_content": "high"}', 'Referral'),
    ('Peter Petersson', 'peter@villa.se', '070-555-4567', 'Ekgatan 33, Örebro', 'ready_for_installation', 'medium', demo_installer_id, '{"installation_type": "whole_house"}', 'Website');

END $$;