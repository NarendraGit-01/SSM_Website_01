-- Add estimated_weight_size to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_weight_size DECIMAL(12,2) DEFAULT 0;
