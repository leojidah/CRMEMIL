-- ============================================================================
-- VATTENMILJÖ CRM - INITIAL DATABASE SCHEMA
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================

create table users (
    id uuid default uuid_generate_v4() primary key,
    email varchar(255) unique not null,
    password_hash varchar(255), -- nullable for OAuth users
    name varchar(255) not null,
    role varchar(20) not null check (role in ('salesperson', 'internal', 'installer')),
    avatar text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()),
    last_login timestamp with time zone,
    last_logout timestamp with time zone
);

-- Create indexes for performance
create index idx_users_email on users(email);
create index idx_users_role on users(role);
create index idx_users_active on users(is_active);

-- ============================================================================
-- CUSTOMERS TABLE
-- ============================================================================

create table customers (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    email varchar(255),
    phone varchar(50) not null,
    address text,
    status varchar(20) not null check (status in ('not_handled', 'meeting', 'sales', 'done', 'archived')),
    priority varchar(10) not null check (priority in ('low', 'medium', 'high')),
    assigned_to uuid references users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()),
    metadata jsonb default '{}'::jsonb
);

-- Create indexes
create index idx_customers_status on customers(status);
create index idx_customers_priority on customers(priority);
create index idx_customers_assigned_to on customers(assigned_to);
create index idx_customers_created_at on customers(created_at);

-- ============================================================================
-- CUSTOMER_NOTES TABLE
-- ============================================================================

create table customer_notes (
    id uuid default uuid_generate_v4() primary key,
    customer_id uuid references customers(id) on delete cascade not null,
    content text not null,
    author varchar(255) not null,
    author_id uuid references users(id) not null,
    is_private boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index idx_customer_notes_customer_id on customer_notes(customer_id);
create index idx_customer_notes_author_id on customer_notes(author_id);

-- ============================================================================
-- CUSTOMER_FILES TABLE
-- ============================================================================

create table customer_files (
    id uuid default uuid_generate_v4() primary key,
    customer_id uuid references customers(id) on delete cascade not null,
    filename varchar(255) not null,
    original_name varchar(255) not null,
    mime_type varchar(100) not null,
    size_bytes integer not null,
    storage_path text not null, -- Supabase storage path
    url text, -- Public URL if applicable
    category varchar(20) not null check (category in ('contract', 'photo', 'document', 'other')),
    uploaded_by varchar(255) not null,
    uploaded_by_id uuid references users(id) not null,
    uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index idx_customer_files_customer_id on customer_files(customer_id);
create index idx_customer_files_category on customer_files(category);
create index idx_customer_files_uploaded_by_id on customer_files(uploaded_by_id);

-- ============================================================================
-- CUSTOMER_ACTIVITIES TABLE
-- ============================================================================

create table customer_activities (
    id uuid default uuid_generate_v4() primary key,
    customer_id uuid references customers(id) on delete cascade not null,
    type varchar(30) not null check (type in ('status_change', 'note_added', 'file_uploaded', 'meeting_scheduled', 'call_made', 'email_sent', 'custom')),
    title varchar(255) not null,
    description text,
    performed_by varchar(255) not null,
    performed_by_id uuid references users(id) not null,
    performed_at timestamp with time zone default timezone('utc'::text, now()) not null,
    metadata jsonb default '{}'::jsonb
);

-- Create indexes
create index idx_customer_activities_customer_id on customer_activities(customer_id);
create index idx_customer_activities_type on customer_activities(type);
create index idx_customer_activities_performed_by_id on customer_activities(performed_by_id);
create index idx_customer_activities_performed_at on customer_activities(performed_at);

-- ============================================================================
-- USER_SESSIONS TABLE (for tracking active sessions)
-- ============================================================================

create table user_sessions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references users(id) on delete cascade not null,
    session_token varchar(255) unique not null,
    expires_at timestamp with time zone not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_agent text,
    ip_address inet
);

-- Create indexes
create index idx_user_sessions_user_id on user_sessions(user_id);
create index idx_user_sessions_token on user_sessions(session_token);
create index idx_user_sessions_expires_at on user_sessions(expires_at);

-- ============================================================================
-- BACKUP_LOGS TABLE (for tracking backups)
-- ============================================================================

create table backup_logs (
    id uuid default uuid_generate_v4() primary key,
    backup_type varchar(20) not null check (backup_type in ('database', 'files', 'full')),
    status varchar(20) not null check (status in ('started', 'completed', 'failed')),
    size_bytes bigint,
    storage_location text,
    started_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone,
    error_message text,
    metadata jsonb default '{}'::jsonb
);

-- Create indexes
create index idx_backup_logs_type on backup_logs(backup_type);
create index idx_backup_logs_status on backup_logs(status);
create index idx_backup_logs_started_at on backup_logs(started_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to relevant tables
create trigger update_users_updated_at
    before update on users
    for each row execute function update_updated_at_column();

create trigger update_customers_updated_at
    before update on customers
    for each row execute function update_updated_at_column();

-- Function to automatically create activity log for customer status changes
create or replace function log_customer_status_change()
returns trigger as $$
begin
    if old.status != new.status then
        insert into customer_activities (customer_id, type, title, description, performed_by, performed_by_id)
        values (
            new.id,
            'status_change',
            'Status changed',
            format('Status changed from %s to %s', old.status, new.status),
            'System',
            new.assigned_to -- This should be updated to track who made the change
        );
    end if;
    return new;
end;
$$ language plpgsql;

-- Apply status change trigger
create trigger log_customer_status_change_trigger
    after update on customers
    for each row execute function log_customer_status_change();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table customers enable row level security;
alter table customer_notes enable row level security;
alter table customer_files enable row level security;
alter table customer_activities enable row level security;
alter table user_sessions enable row level security;

-- Basic RLS policies (can be expanded based on specific requirements)
-- Users can see their own record and other active users
create policy "Users can view active users" on users
    for select using (is_active = true or auth.uid()::text = id::text);

-- Customers are visible based on role and assignment
create policy "Users can view customers based on role" on customers
    for all using (
        exists (
            select 1 from users 
            where id = auth.uid()::uuid 
            and is_active = true
        )
    );

-- Similar policies for other tables...
create policy "Users can view customer notes" on customer_notes
    for all using (
        exists (
            select 1 from users 
            where id = auth.uid()::uuid 
            and is_active = true
        )
    );

create policy "Users can view customer files" on customer_files
    for all using (
        exists (
            select 1 from users 
            where id = auth.uid()::uuid 
            and is_active = true
        )
    );

create policy "Users can view customer activities" on customer_activities
    for all using (
        exists (
            select 1 from users 
            where id = auth.uid()::uuid 
            and is_active = true
        )
    );

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- NOTE: Admin user should be created using the create-admin.js script
-- This ensures secure password generation and proper environment variable usage
-- DO NOT insert default admin credentials in migration files

-- Insert some demo users
insert into users (email, password_hash, name, role, is_active) values
    ('demo.saljare@vattenmiljo.se', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewis42qNTpw6f8.u', 'Demo Säljare', 'salesperson', true),
    ('demo.intern@vattenmiljo.se', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewis42qNTpw6f8.u', 'Demo Intern', 'internal', true),
    ('demo.montor@vattenmiljo.se', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewis42qNTpw6f8.u', 'Demo Montör', 'installer', true);

-- Insert some demo customers
insert into customers (name, email, phone, address, status, priority, assigned_to) 
select 
    'Anna Andersson',
    'anna@example.com',
    '070-123 45 67',
    'Storgatan 1, Stockholm',
    'meeting',
    'high',
    id
from users where email = 'demo.saljare@vattenmiljo.se' limit 1;

insert into customers (name, email, phone, address, status, priority, assigned_to)
select 
    'Erik Eriksson',
    'erik@company.se',
    '070-987 65 43',
    'Vasagatan 10, Göteborg',
    'sales',
    'medium',
    id
from users where email = 'demo.saljare@vattenmiljo.se' limit 1;