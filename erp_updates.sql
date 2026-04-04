-- Add document management columns to projects table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='agreement_url') THEN
        ALTER TABLE projects ADD COLUMN agreement_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='measurement_url') THEN
        ALTER TABLE projects ADD COLUMN measurement_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='completion_url') THEN
        ALTER TABLE projects ADD COLUMN completion_url TEXT;
    END IF;
END $$;
