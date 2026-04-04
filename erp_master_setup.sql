-- SSM ERP MASTER SETUP SCRIPT
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/qkiiismsqqfkonxxwaid/sql)

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone_number TEXT,
    whatsapp_number TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    skill_category TEXT,
    active_status BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
    model_name TEXT NOT NULL,
    category TEXT NOT NULL, -- Steel, UPVC, Interiors, etc.
    status TEXT DEFAULT 'Not Started', -- Not Started, In Progress, Completed, Delivered
    quality_type TEXT,
    rate_per_unit DECIMAL,
    estimated_cost DECIMAL,
    negotiated_price DECIMAL,
    final_project_value DECIMAL DEFAULT 0,
    start_date DATE,
    delivery_date DATE,
    notes TEXT,
    agreement_url TEXT,
    measurement_url TEXT,
    completion_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    stage_name TEXT NOT NULL,
    stage_order INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- Payment, Refund
    amount DECIMAL NOT NULL,
    payment_mode TEXT, -- Cash, UPI, Bank Transfer
    transaction_date DATE DEFAULT CURRENT_DATE,
    screenshot_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 3. Simple Auth Policies (Allow all for authenticated users)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for public' AND tablename = 'customers') THEN
        CREATE POLICY "Allow all for public" ON customers FOR ALL TO public USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for public' AND tablename = 'workers') THEN
        CREATE POLICY "Allow all for public" ON workers FOR ALL TO public USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for public' AND tablename = 'projects') THEN
        CREATE POLICY "Allow all for public" ON projects FOR ALL TO public USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for public' AND tablename = 'project_stages') THEN
        CREATE POLICY "Allow all for public" ON project_stages FOR ALL TO public USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for public' AND tablename = 'transactions') THEN
        CREATE POLICY "Allow all for public" ON transactions FOR ALL TO public USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 4. Auto-Incrementing Display IDs & Constraints
-- Add columns if they don't exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS display_id TEXT UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_id TEXT UNIQUE;

-- Enforce unique mobile number
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customers_phone_number_key'
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_phone_number_key UNIQUE (phone_number);
  END IF;
END $$;

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS customer_seq START 1001;
CREATE SEQUENCE IF NOT EXISTS project_seq START 1;

-- Functions to generate IDs
CREATE OR REPLACE FUNCTION generate_customer_display_id() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'SSM-CUST-' || nextval('customer_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_project_display_id() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'PROJ-' || to_char(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('project_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS set_customer_display_id ON customers;
CREATE TRIGGER set_customer_display_id BEFORE INSERT ON customers FOR EACH ROW EXECUTE FUNCTION generate_customer_display_id();

DROP TRIGGER IF EXISTS set_project_display_id ON projects;
CREATE TRIGGER set_project_display_id BEFORE INSERT ON projects FOR EACH ROW EXECUTE FUNCTION generate_project_display_id();

-- 5. Project Photos
CREATE TABLE IF NOT EXISTS project_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for photos
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for public' AND tablename = 'project_photos') THEN
        CREATE POLICY "Allow all for public" ON project_photos FOR ALL TO public USING (true) WITH CHECK (true);
    END IF;
END $$;
