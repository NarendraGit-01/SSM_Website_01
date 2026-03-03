-- SSM Website: Add hero_metrics table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.hero_metrics (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial data
INSERT INTO public.hero_metrics (value, label) VALUES
('15+', 'Years in Business'),
('1200+', 'Projects Done'),
('50+', 'Expert Craftsmen'),
('98%', 'Client Satisfaction');
