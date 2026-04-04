-- Create the ssm-project-assets storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ssm-project-assets', 'ssm-project-assets', true) 
ON CONFLICT DO NOTHING;

-- Set up RLS policies to allow public access for uploads, viewing, and deleting
CREATE POLICY "Public Upload to Project Assets" ON storage.objects
FOR INSERT TO public WITH CHECK (bucket_id = 'ssm-project-assets');

CREATE POLICY "Public View of Project Assets" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'ssm-project-assets');

CREATE POLICY "Public Delete from Project Assets" ON storage.objects
FOR DELETE TO public USING (bucket_id = 'ssm-project-assets');
