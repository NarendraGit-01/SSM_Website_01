-- SSM Mini ERP Database Schema

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone_number TEXT,
    whatsapp_number TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Workers Table
CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    skill_category TEXT,
    active_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    category TEXT,
    description TEXT,
    budget_range TEXT,
    status TEXT DEFAULT 'New', -- New, Contacted, Converted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('Steel', 'UPVC', 'Interiors', 'Iron Works', 'Lifts')),
    model_name TEXT,
    start_date DATE,
    delivery_date DATE,
    status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled')),
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    quality_type TEXT, -- e.g., 304/202
    rate_per_unit DECIMAL(12,2) DEFAULT 0,
    negotiated_price DECIMAL(12,2) DEFAULT 0,
    final_project_value DECIMAL(12,2) DEFAULT 0,
    worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Transactions (Payments & Refunds)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('Advance', 'Payment', 'Refund')),
    amount DECIMAL(12,2) NOT NULL,
    payment_mode TEXT CHECK (payment_mode IN ('Cash', 'UPI', 'Bank Transfer')),
    reference_number TEXT,
    screenshot_url TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Project Stages (Timeline)
CREATE TABLE IF NOT EXISTS project_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    stage_name TEXT NOT NULL, -- e.g., Measurement Done, Material Ordered, Fabrication, Installation, Delivered
    completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
-- For an admin-only ERP, we typically restrict all access to authenticated admins.

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stages ENABLE ROW LEVEL SECURITY;

-- Creating a simple "Select All" policy for authenticated users for now.
-- In a production app, you'd check for an 'is_admin' column in a 'profiles' table.
CREATE POLICY "Admin All Access Customers" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Access Workers" ON workers FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Access Leads" ON leads FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Access Projects" ON projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Access Transactions" ON transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Access Project Stages" ON project_stages FOR ALL TO authenticated USING (true);
