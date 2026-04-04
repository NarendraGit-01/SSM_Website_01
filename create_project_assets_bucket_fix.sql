-- 1. Create the ssm-project-assets storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ssm-project-assets', 'ssm-project-assets', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to avoid the "already exists" error
DROP POLICY IF EXISTS "Public Upload to Project Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public View of Project Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete from Project Assets" ON storage.objects;

-- 3. Recreate the policies cleanly
CREATE POLICY "Public Upload to Project Assets" ON storage.objects
FOR INSERT TO public WITH CHECK (bucket_id = 'ssm-project-assets');

CREATE POLICY "Public View of Project Assets" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'ssm-project-assets');

CREATE POLICY "Public Delete from Project Assets" ON storage.objects
FOR DELETE TO public USING (bucket_id = 'ssm-project-assets');
