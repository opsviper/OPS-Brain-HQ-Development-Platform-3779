import { createClient } from '@supabase/supabase-js'

// Use environment variables instead of hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Test connection and log result
const testConnection = async () => {
  try {
    console.log('🔗 Testing Supabase connection...')
    const { data, error } = await supabase
      .from('users_67abc23def')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error)
      return false
    } else {
      console.log('✅ Supabase connected successfully')
      return true
    }
  } catch (err) {
    console.error('❌ Supabase connection error:', err)
    return false
  }
}

// Test connection on load
testConnection()

// Database setup SQL - Run this in your Supabase SQL editor
export const DATABASE_SETUP_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users_67abc23def (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'contributor')) DEFAULT 'contributor',
  created_at TIMESTAMP DEFAULT now()
);

-- Processes table (Required)
CREATE TABLE IF NOT EXISTS processes_67abc23def (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('Planned', 'Live', 'Deprecated')) DEFAULT 'Planned',
  owner UUID REFERENCES users_67abc23def(id),
  sop_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Tasks tables with separate types
CREATE TABLE IF NOT EXISTS tasks_67abc23def (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('react', 'maintain', 'improve')) NOT NULL,
  status TEXT CHECK (status IN ('To Do', 'In Progress', 'Done')) DEFAULT 'To Do',
  assignee UUID REFERENCES users_67abc23def(id),
  due_date DATE,
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  process_id UUID REFERENCES processes_67abc23def(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Systems table (Required)
CREATE TABLE IF NOT EXISTS systems_67abc23def (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,
  purpose TEXT,
  status TEXT CHECK (status IN ('Active', 'Inactive', 'Maintenance')) DEFAULT 'Active',
  owner UUID REFERENCES users_67abc23def(id),
  location TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Equipment table (Required)
CREATE TABLE IF NOT EXISTS equipment_67abc23def (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  model TEXT,
  serial_number TEXT,
  owner UUID REFERENCES users_67abc23def(id),
  purchase_date DATE,
  last_maintained DATE,
  next_maintenance DATE,
  status TEXT CHECK (status IN ('Active', 'Maintenance', 'Retired')) DEFAULT 'Active',
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Software table
CREATE TABLE IF NOT EXISTS software_67abc23def (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  version TEXT,
  use_case TEXT,
  cost NUMERIC,
  owner UUID REFERENCES users_67abc23def(id),
  license_expires DATE,
  last_reviewed DATE,
  status TEXT CHECK (status IN ('Active', 'Inactive', 'Expired')) DEFAULT 'Active',
  vendor TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Team table
CREATE TABLE IF NOT EXISTS team_67abc23def (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  department TEXT,
  phone TEXT,
  manager UUID REFERENCES team_67abc23def(id),
  hire_date DATE,
  status TEXT CHECK (status IN ('Active', 'Inactive', 'On Leave')) DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Ideas table (Required)
CREATE TABLE IF NOT EXISTS ideas_67abc23def (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  source TEXT,
  status TEXT CHECK (status IN ('New', 'Under Review', 'Approved', 'Rejected', 'Implemented')) DEFAULT 'New',
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  process_id UUID REFERENCES processes_67abc23def(id),
  submitted_by UUID REFERENCES users_67abc23def(id),
  estimated_effort TEXT,
  expected_benefit TEXT,
  implementation_date DATE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Key Events table
CREATE TABLE IF NOT EXISTS key_events_67abc23def (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  event_date DATE,
  end_date DATE,
  location TEXT,
  process_id UUID REFERENCES processes_67abc23def(id),
  created_by UUID REFERENCES users_67abc23def(id),
  status TEXT CHECK (status IN ('Planned', 'In Progress', 'Completed', 'Cancelled')) DEFAULT 'Planned',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users_67abc23def ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes_67abc23def ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks_67abc23def ENABLE ROW LEVEL SECURITY;
ALTER TABLE systems_67abc23def ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_67abc23def ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_67abc23def ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_67abc23def ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas_67abc23def ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_events_67abc23def ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all operations for now)
DROP POLICY IF EXISTS "Allow all operations" ON users_67abc23def;
CREATE POLICY "Allow all operations" ON users_67abc23def FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON processes_67abc23def;
CREATE POLICY "Allow all operations" ON processes_67abc23def FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON tasks_67abc23def;
CREATE POLICY "Allow all operations" ON tasks_67abc23def FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON systems_67abc23def;
CREATE POLICY "Allow all operations" ON systems_67abc23def FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON equipment_67abc23def;
CREATE POLICY "Allow all operations" ON equipment_67abc23def FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON software_67abc23def;
CREATE POLICY "Allow all operations" ON software_67abc23def FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON team_67abc23def;
CREATE POLICY "Allow all operations" ON team_67abc23def FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON ideas_67abc23def;
CREATE POLICY "Allow all operations" ON ideas_67abc23def FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON key_events_67abc23def;
CREATE POLICY "Allow all operations" ON key_events_67abc23def FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data with varied dates for realistic reporting
INSERT INTO users_67abc23def (id, email, name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'admin@opsviper.com', 'Admin User', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440001', 'manager@opsviper.com', 'Manager User', 'manager'),
  ('550e8400-e29b-41d4-a716-446655440002', 'contributor@opsviper.com', 'Contributor User', 'contributor'),
  ('550e8400-e29b-41d4-a716-446655440003', 'john.doe@opsviper.com', 'John Doe', 'contributor'),
  ('550e8400-e29b-41d4-a716-446655440004', 'jane.smith@opsviper.com', 'Jane Smith', 'manager')
ON CONFLICT (email) DO NOTHING;

INSERT INTO processes_67abc23def (name, description, status, owner) VALUES
  ('Client Onboarding', 'Process for onboarding new clients', 'Live', '550e8400-e29b-41d4-a716-446655440000'),
  ('Monthly Reporting', 'Generate and send monthly reports', 'Live', '550e8400-e29b-41d4-a716-446655440001'),
  ('System Maintenance', 'Regular system maintenance procedures', 'Planned', '550e8400-e29b-41d4-a716-446655440002'),
  ('Data Backup', 'Daily data backup process', 'Live', '550e8400-e29b-41d4-a716-446655440003'),
  ('Security Review', 'Quarterly security assessment', 'Planned', '550e8400-e29b-41d4-a716-446655440004')
ON CONFLICT DO NOTHING;

-- Insert tasks with varied dates over the past 6 months
INSERT INTO tasks_67abc23def (title, description, task_type, status, assignee, priority, due_date, created_at) VALUES
  -- Tasks from 6 months ago
  ('Setup new client portal', 'Implement new features for client portal', 'react', 'Done', '550e8400-e29b-41d4-a716-446655440003', 'High', '2024-07-15', '2024-07-01'),
  ('Database optimization', 'Optimize database queries for better performance', 'improve', 'Done', '550e8400-e29b-41d4-a716-446655440004', 'Medium', '2024-07-20', '2024-07-05'),
  ('Server maintenance', 'Perform monthly server maintenance', 'maintain', 'Done', '550e8400-e29b-41d4-a716-446655440002', 'High', '2024-07-25', '2024-07-10'),
  -- Tasks from 5 months ago
  ('React component library', 'Create reusable React components', 'react', 'Done', '550e8400-e29b-41d4-a716-446655440003', 'Medium', '2024-08-15', '2024-08-01'),
  ('Security patch updates', 'Apply latest security patches', 'maintain', 'Done', '550e8400-e29b-41d4-a716-446655440004', 'Critical', '2024-08-10', '2024-08-05'),
  ('API performance improvement', 'Improve API response times', 'improve', 'Done', '550e8400-e29b-41d4-a716-446655440002', 'High', '2024-08-30', '2024-08-15'),
  -- Tasks from 4 months ago
  ('Client dashboard redesign', 'Redesign client dashboard with React', 'react', 'Done', '550e8400-e29b-41d4-a716-446655440003', 'High', '2024-09-20', '2024-09-01'),
  ('Backup system check', 'Verify backup system integrity', 'maintain', 'Done', '550e8400-e29b-41d4-a716-446655440001', 'Medium', '2024-09-15', '2024-09-05'),
  ('User experience optimization', 'Improve overall user experience', 'improve', 'In Progress', '550e8400-e29b-41d4-a716-446655440004', 'Medium', '2024-09-30', '2024-09-10'),
  -- Tasks from 3 months ago
  ('Mobile responsive updates', 'Make application mobile responsive', 'react', 'Done', '550e8400-e29b-41d4-a716-446655440003', 'High', '2024-10-15', '2024-10-01'),
  ('System monitoring setup', 'Setup comprehensive system monitoring', 'maintain', 'Done', '550e8400-e29b-41d4-a716-446655440002', 'High', '2024-10-25', '2024-10-05'),
  ('Load balancing improvement', 'Implement better load balancing', 'improve', 'Done', '550e8400-e29b-41d4-a716-446655440004', 'Medium', '2024-10-30', '2024-10-10'),
  -- Tasks from 2 months ago
  ('React hooks migration', 'Migrate class components to hooks', 'react', 'Done', '550e8400-e29b-41d4-a716-446655440003', 'Medium', '2024-11-15', '2024-11-01'),
  ('SSL certificate renewal', 'Renew SSL certificates', 'maintain', 'Done', '550e8400-e29b-41d4-a716-446655440001', 'High', '2024-11-10', '2024-11-02'),
  ('Caching strategy optimization', 'Optimize caching for better performance', 'improve', 'In Progress', '550e8400-e29b-41d4-a716-446655440004', 'High', '2024-11-30', '2024-11-15'),
  -- Tasks from last month
  ('New feature development', 'Develop new React features for Q1', 'react', 'In Progress', '550e8400-e29b-41d4-a716-446655440003', 'High', '2025-01-15', '2024-12-01'),
  ('Year-end maintenance', 'Perform comprehensive year-end maintenance', 'maintain', 'Done', '550e8400-e29b-41d4-a716-446655440002', 'Critical', '2024-12-31', '2024-12-15'),
  ('Performance benchmarking', 'Benchmark and improve system performance', 'improve', 'To Do', '550e8400-e29b-41d4-a716-446655440004', 'Medium', '2025-01-20', '2024-12-20'),
  -- Current month tasks (some overdue for realistic reporting)
  ('Critical bug fixes', 'Fix critical bugs in production', 'react', 'In Progress', '550e8400-e29b-41d4-a716-446655440003', 'Critical', '2025-01-05', '2025-01-01'),
  ('Database backup verification', 'Verify all database backups', 'maintain', 'To Do', '550e8400-e29b-41d4-a716-446655440001', 'High', '2025-01-10', '2025-01-03'),
  ('Code review process improvement', 'Improve code review workflows', 'improve', 'To Do', '550e8400-e29b-41d4-a716-446655440004', 'Medium', '2025-01-25', '2025-01-05'),
  ('React testing setup', 'Setup comprehensive React testing', 'react', 'To Do', '550e8400-e29b-41d4-a716-446655440003', 'Medium', '2025-01-30', '2025-01-08'),
  ('Server log rotation', 'Setup automated log rotation', 'maintain', 'To Do', '550e8400-e29b-41d4-a716-446655440002', 'Low', '2025-02-01', '2025-01-10')
ON CONFLICT DO NOTHING;

INSERT INTO systems_67abc23def (name, type, purpose) VALUES
  ('CRM System', 'Customer Management', 'Manage customer relationships and data'),
  ('ERP System', 'Enterprise Resource Planning', 'Integrate business processes'),
  ('Monitoring System', 'System Monitoring', 'Monitor system performance and health'),
  ('Email Server', 'Communication', 'Handle internal and external email'),
  ('File Server', 'Storage', 'Centralized file storage and sharing')
ON CONFLICT DO NOTHING;

INSERT INTO equipment_67abc23def (name, category, purchase_date) VALUES
  ('Server Rack A', 'Hardware', '2023-01-15'),
  ('Network Switch', 'Networking', '2023-03-20'),
  ('Backup Drive', 'Storage', '2023-06-10'),
  ('Firewall Device', 'Security', '2023-08-15'),
  ('Load Balancer', 'Networking', '2023-10-20')
ON CONFLICT DO NOTHING;

INSERT INTO software_67abc23def (name, use_case, cost) VALUES
  ('Salesforce', 'CRM Management', 150.00),
  ('Slack', 'Team Communication', 8.00),
  ('Jira', 'Project Management', 10.00),
  ('AWS Services', 'Cloud Infrastructure', 500.00),
  ('Adobe Creative Suite', 'Design and Marketing', 60.00)
ON CONFLICT DO NOTHING;

INSERT INTO team_67abc23def (name, role, email) VALUES
  ('John Doe', 'Lead Developer', 'john@opsviper.com'),
  ('Jane Smith', 'Project Manager', 'jane@opsviper.com'),
  ('Bob Wilson', 'System Admin', 'bob@opsviper.com'),
  ('Alice Johnson', 'UX Designer', 'alice@opsviper.com'),
  ('Mike Chen', 'DevOps Engineer', 'mike@opsviper.com')
ON CONFLICT DO NOTHING;

INSERT INTO ideas_67abc23def (title, summary, status, priority, created_at) VALUES
  ('Automate client onboarding', 'Implement automated workflow for new client setup', 'New', 'High', '2024-12-01'),
  ('Mobile app development', 'Create mobile version of client portal', 'Under Review', 'Medium', '2024-12-15'),
  ('AI-powered reporting', 'Use AI to generate insights in monthly reports', 'Approved', 'High', '2024-11-20'),
  ('Chatbot integration', 'Add AI chatbot for customer support', 'New', 'Medium', '2025-01-05'),
  ('Real-time notifications', 'Implement real-time push notifications', 'Under Review', 'Low', '2025-01-10')
ON CONFLICT DO NOTHING;

INSERT INTO key_events_67abc23def (title, description, event_type, event_date, created_at) VALUES
  ('System Migration', 'Migration to new cloud infrastructure', 'Technical', '2024-02-15', '2024-01-15'),
  ('Client Review Meeting', 'Quarterly review with major client', 'Business', '2024-01-30', '2024-01-20'),
  ('Security Audit', 'Annual security compliance audit', 'Compliance', '2024-03-01', '2024-02-15'),
  ('Team Training', 'React and modern development training', 'Training', '2025-01-20', '2025-01-10'),
  ('Product Launch', 'Launch of new client portal features', 'Business', '2025-02-01', '2025-01-15')
ON CONFLICT DO NOTHING;
`;