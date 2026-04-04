-- Add actual weight/size and actual project value columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_weight_size DECIMAL(12,2) DEFAULT NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_project_value DECIMAL(12,2) DEFAULT NULL;
