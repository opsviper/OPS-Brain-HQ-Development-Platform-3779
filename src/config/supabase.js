import { createClient } from '@supabase/supabase-js'

// Real Supabase credentials 
const supabaseUrl = 'https://crzycouyfnljrjzaywpv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyenljb3V5Zm5sanJqemF5d3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjczNTQsImV4cCI6MjA2NjM0MzM1NH0.fC0hb5vS6aGzs20EosMvz4BDpeSxSAZSkW29AmIkE9s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Database setup SQL - Run this in your Supabase SQL editor
export const DATABASE_SETUP_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'contributor')) DEFAULT 'contributor',
  created_at TIMESTAMP DEFAULT now()
);

-- Processes table (Required)
CREATE TABLE IF NOT EXISTS processes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('Planned', 'Live', 'Deprecated')) DEFAULT 'Planned',
  owner UUID REFERENCES users(id),
  sop_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Tasks tables with separate types
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('react', 'maintain', 'improve')) NOT NULL,
  status TEXT CHECK (status IN ('To Do', 'In Progress', 'Done')) DEFAULT 'To Do',
  assignee UUID REFERENCES users(id),
  due_date DATE,
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  process_id UUID REFERENCES processes(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Systems table (Required)
CREATE TABLE IF NOT EXISTS systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,
  purpose TEXT,
  status TEXT CHECK (status IN ('Active', 'Inactive', 'Maintenance')) DEFAULT 'Active',
  owner UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Equipment table (Required)
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  owner UUID REFERENCES users(id),
  purchase_date DATE,
  last_maintained DATE,
  next_maintenance DATE,
  status TEXT CHECK (status IN ('Active', 'Maintenance', 'Retired')) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Software table
CREATE TABLE IF NOT EXISTS software (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  use_case TEXT,
  cost NUMERIC,
  owner UUID REFERENCES users(id),
  license_expires DATE,
  last_reviewed DATE,
  status TEXT CHECK (status IN ('Active', 'Inactive', 'Expired')) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Team table
CREATE TABLE IF NOT EXISTS team (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  department TEXT,
  manager UUID REFERENCES team(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Ideas table (Required)
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  source TEXT,
  status TEXT CHECK (status IN ('New', 'Under Review', 'Approved', 'Rejected', 'Implemented')) DEFAULT 'New',
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  process_id UUID REFERENCES processes(id),
  submitted_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Key Events table
CREATE TABLE IF NOT EXISTS key_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  event_date DATE,
  process_id UUID REFERENCES processes(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Relationship tables for Process connections
CREATE TABLE IF NOT EXISTS process_systems (
  process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  system_id UUID REFERENCES systems(id) ON DELETE CASCADE,
  PRIMARY KEY (process_id, system_id)
);

CREATE TABLE IF NOT EXISTS process_equipment (
  process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  PRIMARY KEY (process_id, equipment_id)
);

CREATE TABLE IF NOT EXISTS process_software (
  process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  software_id UUID REFERENCES software(id) ON DELETE CASCADE,
  PRIMARY KEY (process_id, software_id)
);

CREATE TABLE IF NOT EXISTS process_team (
  process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  team_id UUID REFERENCES team(id) ON DELETE CASCADE,
  PRIMARY KEY (process_id, team_id)
);

-- Task relationships with processes
CREATE TABLE IF NOT EXISTS process_tasks (
  process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (process_id, task_id)
);

-- Ideas relationships with processes
CREATE TABLE IF NOT EXISTS process_ideas (
  process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  PRIMARY KEY (process_id, idea_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE software ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Admin can do everything
CREATE POLICY "Admin full access" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Process policies
CREATE POLICY "All can read processes" ON processes FOR SELECT USING (true);
CREATE POLICY "Admin and manager can modify processes" ON processes FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Task policies
CREATE POLICY "All can read tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Users can modify assigned tasks" ON tasks FOR UPDATE USING (
  assignee = auth.uid() OR 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Admin and manager can create tasks" ON tasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Similar policies for other tables
CREATE POLICY "All can read systems" ON systems FOR SELECT USING (true);
CREATE POLICY "Admin and manager can modify systems" ON systems FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "All can read equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Admin and manager can modify equipment" ON equipment FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "All can read software" ON software FOR SELECT USING (true);
CREATE POLICY "Admin and manager can modify software" ON software FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "All can read team" ON team FOR SELECT USING (true);
CREATE POLICY "Admin and manager can modify team" ON team FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "All can read ideas" ON ideas FOR SELECT USING (true);
CREATE POLICY "Users can create ideas" ON ideas FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin and manager can modify ideas" ON ideas FOR UPDATE USING (
  submitted_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "All can read key_events" ON key_events FOR SELECT USING (true);
CREATE POLICY "Admin and manager can modify key_events" ON key_events FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Insert sample data
INSERT INTO users (id, email, name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'admin@opsviper.com', 'Admin User', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440001', 'manager@opsviper.com', 'Manager User', 'manager'),
  ('550e8400-e29b-41d4-a716-446655440002', 'contributor@opsviper.com', 'Contributor User', 'contributor')
ON CONFLICT (email) DO NOTHING;

INSERT INTO processes (name, description, status, owner) VALUES
  ('Client Onboarding', 'Process for onboarding new clients', 'Live', '550e8400-e29b-41d4-a716-446655440000'),
  ('Monthly Reporting', 'Generate and send monthly reports', 'Live', '550e8400-e29b-41d4-a716-446655440001'),
  ('System Maintenance', 'Regular system maintenance procedures', 'Planned', '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, task_type, status, assignee, priority) VALUES
  ('Update client portal', 'Implement new features for client portal', 'react', 'In Progress', '550e8400-e29b-41d4-a716-446655440000', 'High'),
  ('Database backup', 'Perform weekly database backup', 'maintain', 'To Do', '550e8400-e29b-41d4-a716-446655440001', 'Medium'),
  ('Optimize query performance', 'Improve database query performance', 'improve', 'To Do', '550e8400-e29b-41d4-a716-446655440002', 'Low')
ON CONFLICT DO NOTHING;

INSERT INTO systems (name, type, purpose) VALUES
  ('CRM System', 'Customer Management', 'Manage customer relationships and data'),
  ('ERP System', 'Enterprise Resource Planning', 'Integrate business processes'),
  ('Monitoring System', 'System Monitoring', 'Monitor system performance and health')
ON CONFLICT DO NOTHING;

INSERT INTO equipment (name, category, purchase_date) VALUES
  ('Server Rack A', 'Hardware', '2023-01-15'),
  ('Network Switch', 'Networking', '2023-03-20'),
  ('Backup Drive', 'Storage', '2023-06-10')
ON CONFLICT DO NOTHING;

INSERT INTO software (name, use_case, cost) VALUES
  ('Salesforce', 'CRM Management', 150.00),
  ('Slack', 'Team Communication', 8.00),
  ('Jira', 'Project Management', 10.00)
ON CONFLICT DO NOTHING;

INSERT INTO team (name, role, email) VALUES
  ('John Doe', 'Lead Developer', 'john@opsviper.com'),
  ('Jane Smith', 'Project Manager', 'jane@opsviper.com'),
  ('Bob Wilson', 'System Admin', 'bob@opsviper.com')
ON CONFLICT DO NOTHING;

INSERT INTO ideas (title, summary, status, priority) VALUES
  ('Automate client onboarding', 'Implement automated workflow for new client setup', 'New', 'High'),
  ('Mobile app development', 'Create mobile version of client portal', 'Under Review', 'Medium'),
  ('AI-powered reporting', 'Use AI to generate insights in monthly reports', 'Approved', 'High')
ON CONFLICT DO NOTHING;

INSERT INTO key_events (title, description, event_type, event_date) VALUES
  ('System Migration', 'Migration to new cloud infrastructure', 'Technical', '2024-02-15'),
  ('Client Review Meeting', 'Quarterly review with major client', 'Business', '2024-01-30'),
  ('Security Audit', 'Annual security compliance audit', 'Compliance', '2024-03-01')
ON CONFLICT DO NOTHING;
`;