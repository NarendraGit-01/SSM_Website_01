-- 1. Remove the hardcoded category check constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check;

-- 2. Add the sub_category column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sub_category TEXT;
